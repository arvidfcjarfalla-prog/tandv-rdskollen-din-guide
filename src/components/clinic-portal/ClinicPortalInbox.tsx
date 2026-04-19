import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, FileText, Send, Eye, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type InvitationStatus = "invited" | "claimed" | "declined" | "closed" | "quoted";
type RequestStatus = "open" | "quoted" | "accepted" | "declined" | "closed";

interface InboxRow {
  invitationId: string;
  invitationStatus: InvitationStatus;
  distance_km: number | null;
  request: {
    id: string;
    created_at: string;
    track: string | null;
    treatment_free_text: string | null;
    selected_teeth: string[];
    description: string | null;
    pain_level: number | null;
    symptom: string | null;
    status: RequestStatus;
  };
  patientInitials: string;
  myOffer?: { id: string; total_price: number; status: string; created_at: string } | null;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  invited: { label: "Ny", cls: "bg-sky-50 text-sky-600" },
  claimed: { label: "Ärende taget", cls: "bg-amber-50 text-amber-700" },
  quoted: { label: "Offert skickad", cls: "bg-amber-50 text-amber-700" },
  closed: { label: "Stängd", cls: "bg-zinc-100 text-zinc-400" },
  declined: { label: "Avböjd", cls: "bg-zinc-100 text-zinc-400" },
  accepted: { label: "Accepterad av patient", cls: "bg-emerald-50 text-emerald-600" },
};

interface QuoteFormData {
  price: string;
  validDays: string;
  note: string;
  items: { label: string; price: string }[];
}

interface Props {
  onOpenChat: (requestId: string, patientInitials: string) => void;
}

export default function ClinicPortalInbox({ onOpenChat }: Props) {
  const { clinicId } = useAuth();
  const [rows, setRows] = useState<InboxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "invited" | "claimed" | "quoted">("all");
  const [acting, setActing] = useState<string | null>(null);
  const [quoting, setQuoting] = useState<string | null>(null);
  const [quoteForm, setQuoteForm] = useState<QuoteFormData>({
    price: "",
    validDays: "14",
    note: "",
    items: [{ label: "Behandling", price: "" }],
  });

  const initialsFromName = (name: string | null | undefined) => {
    if (!name) return "??";
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  };

  const load = useCallback(async () => {
    if (!clinicId) return;
    setLoading(true);

    // Fetch all invitations for this clinic
    const { data: invitations, error } = await supabase
      .from("request_clinics")
      .select("id, status, distance_km, request_id, invited_at")
      .eq("clinic_id", clinicId)
      .order("invited_at", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Kunde inte hämta inkorgen");
      setLoading(false);
      return;
    }

    if (!invitations?.length) {
      setRows([]);
      setLoading(false);
      return;
    }

    const requestIds = invitations.map((i) => i.request_id);
    const [{ data: requests }, { data: offers }] = await Promise.all([
      supabase.from("requests").select("*").in("id", requestIds),
      supabase.from("offers").select("*").eq("clinic_id", clinicId).in("request_id", requestIds),
    ]);

    // Fetch patient initials via profiles
    const patientIds = Array.from(new Set((requests ?? []).map((r) => r.patient_id)));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", patientIds);

    const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p.full_name]));
    const requestMap = new Map((requests ?? []).map((r) => [r.id, r]));
    const offerMap = new Map((offers ?? []).map((o) => [o.request_id, o]));

    const built: InboxRow[] = invitations
      .filter((inv) => requestMap.has(inv.request_id))
      .map((inv) => {
        const r = requestMap.get(inv.request_id)!;
        return {
          invitationId: inv.id,
          invitationStatus: inv.status as InvitationStatus,
          distance_km: inv.distance_km as number | null,
          request: {
            id: r.id,
            created_at: r.created_at,
            track: r.track,
            treatment_free_text: r.treatment_free_text,
            selected_teeth: (r.selected_teeth ?? []) as string[],
            description: r.description,
            pain_level: r.pain_level,
            symptom: r.symptom,
            status: r.status as RequestStatus,
          },
          patientInitials: initialsFromName(profileMap.get(r.patient_id)),
          myOffer: offerMap.get(r.id) as any,
        };
      });

    setRows(built);
    setLoading(false);
  }, [clinicId]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime subscription for new invitations
  useEffect(() => {
    if (!clinicId) return;
    const channel = supabase
      .channel(`clinic-inbox-${clinicId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "request_clinics", filter: `clinic_id=eq.${clinicId}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [clinicId, load]);

  const handleClaim = async (row: InboxRow) => {
    setActing(row.invitationId);
    try {
      const { data, error } = await supabase.functions.invoke("claim-request", {
        body: { request_id: row.request.id },
      });
      if (error) throw error;
      if (!(data as any)?.success) {
        const reason = (data as any)?.reason;
        if (reason === "request_full") toast.error("Ärendet är redan taget av tre kliniker");
        else toast.error("Kunde inte ta ärendet");
      } else {
        toast.success("Ärendet är ditt — skicka en offert");
      }
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Något gick fel");
    } finally {
      setActing(null);
    }
  };

  const handleSendQuote = async (row: InboxRow) => {
    if (!clinicId || !quoteForm.price) return;
    setActing(row.invitationId);
    try {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + parseInt(quoteForm.validDays, 10));

      const lineItems = quoteForm.items
        .filter((it) => it.label || it.price)
        .map((it) => ({ label: it.label, price: parseInt(it.price || "0", 10) }));

      const { error: offerErr } = await supabase.from("offers").insert({
        request_id: row.request.id,
        clinic_id: clinicId,
        total_price: parseInt(quoteForm.price, 10),
        line_items: lineItems,
        valid_until: validUntil.toISOString().split("T")[0],
        message: quoteForm.note || null,
        status: "pending",
      });
      if (offerErr) throw offerErr;

      // Mark invitation as quoted
      await supabase
        .from("request_clinics")
        .update({ status: "quoted" })
        .eq("id", row.invitationId);

      toast.success("Offert skickad");
      setQuoting(null);
      setQuoteForm({ price: "", validDays: "14", note: "", items: [{ label: "Behandling", price: "" }] });
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Kunde inte skicka offert");
    } finally {
      setActing(null);
    }
  };

  const addItem = () => setQuoteForm((p) => ({ ...p, items: [...p.items, { label: "", price: "" }] }));

  const filtered = rows.filter((r) => {
    if (filter === "all") return true;
    if (filter === "quoted") return r.invitationStatus === "quoted" || !!r.myOffer;
    return r.invitationStatus === filter;
  });

  const counts = {
    all: rows.length,
    invited: rows.filter((r) => r.invitationStatus === "invited").length,
    claimed: rows.filter((r) => r.invitationStatus === "claimed").length,
    quoted: rows.filter((r) => r.invitationStatus === "quoted" || !!r.myOffer).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center">
        <p className="text-sm text-zinc-500">Inga inkommande förfrågningar ännu.</p>
        <p className="text-xs text-zinc-400 mt-1">Du får en notis när nästa patient i ditt område skickar in en förfrågan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {([
          ["all", "Alla"],
          ["invited", "Nya"],
          ["claimed", "Tagna"],
          ["quoted", "Offererade"],
        ] as const).map(([f, label]) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap",
              filter === f ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200",
            )}
          >
            {label}
            <span className="ml-1 opacity-60">({counts[f]})</span>
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {filtered.map((row) => {
          const isExpanded = expandedId === row.invitationId;
          const st = STATUS_MAP[row.invitationStatus] ?? STATUS_MAP.invited;
          const treatmentTitle = row.request.treatment_free_text || row.request.symptom || "Förfrågan";
          const dateStr = new Date(row.request.created_at).toLocaleDateString("sv-SE", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          });
          const isUrgent = (row.request.pain_level ?? 0) >= 7;
          const canClaim = row.invitationStatus === "invited";
          const canQuote = row.invitationStatus === "claimed" && !row.myOffer;

          return (
            <div
              key={row.invitationId}
              className={cn(
                "bg-white border rounded-xl overflow-hidden transition-all duration-200",
                isExpanded ? "border-zinc-300 shadow-sm" : "border-zinc-200",
                row.invitationStatus === "invited" && "ring-1 ring-sky-200",
              )}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : row.invitationId)}
                className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-zinc-50/50 transition-colors"
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    isUrgent ? "bg-red-50 text-red-600 ring-2 ring-red-200" : "bg-zinc-100 text-zinc-600",
                  )}
                >
                  {row.patientInitials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-semibold text-sm text-zinc-900 truncate">{treatmentTitle}</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", st.cls)}>
                      {st.label}
                    </span>
                    {isUrgent && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-500">
                        Brådskande
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 text-[10px] text-zinc-400">
                    <span>{dateStr}</span>
                    {row.distance_km !== null && (
                      <>
                        <span>·</span>
                        <span>{row.distance_km.toFixed(1)} km</span>
                      </>
                    )}
                    {row.request.selected_teeth?.length > 0 && (
                      <>
                        <span>·</span>
                        <span>Tand {row.request.selected_teeth.join(", ")}</span>
                      </>
                    )}
                  </div>
                </div>

                {row.myOffer && (
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-zinc-900">
                      {row.myOffer.total_price.toLocaleString("sv-SE")} kr
                    </div>
                    <div className="text-[10px] text-zinc-400">offert</div>
                  </div>
                )}

                <ChevronDown
                  className={cn("w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200", isExpanded && "rotate-180")}
                />
              </button>

              {isExpanded && (
                <div className="border-t border-zinc-100 px-5 py-4 space-y-4">
                  {row.request.description && (
                    <div className="bg-zinc-50 rounded-lg p-3">
                      <p className="text-[10px] text-zinc-400 font-medium mb-1">Beskrivning</p>
                      <p className="text-xs text-zinc-700 leading-relaxed">{row.request.description}</p>
                    </div>
                  )}

                  {row.myOffer && !quoting && (
                    <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3">
                      <p className="text-[10px] text-amber-600 font-semibold mb-1">Skickad offert</p>
                      <p className="text-sm font-bold text-zinc-900">
                        {row.myOffer.total_price.toLocaleString("sv-SE")} kr
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Status: {row.myOffer.status}
                      </p>
                    </div>
                  )}

                  {quoting === row.invitationId && (
                    <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-3">
                      <p className="text-xs font-semibold text-zinc-700">Skapa offert</p>
                      {quoteForm.items.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            value={item.label}
                            onChange={(e) => {
                              const items = [...quoteForm.items];
                              items[idx] = { ...items[idx], label: e.target.value };
                              setQuoteForm((p) => ({ ...p, items }));
                            }}
                            placeholder="Rad"
                            className="flex-1 text-xs bg-zinc-50 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200 border border-zinc-200"
                          />
                          <input
                            value={item.price}
                            onChange={(e) => {
                              const items = [...quoteForm.items];
                              items[idx] = { ...items[idx], price: e.target.value };
                              setQuoteForm((p) => ({ ...p, items }));
                            }}
                            placeholder="Pris"
                            type="number"
                            className="w-24 text-xs bg-zinc-50 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200 border border-zinc-200"
                          />
                        </div>
                      ))}
                      <button onClick={addItem} className="text-[11px] text-amber-700 font-medium hover:text-amber-800">
                        + Lägg till rad
                      </button>
                      <div className="flex gap-2">
                        <input
                          value={quoteForm.price}
                          onChange={(e) => setQuoteForm((p) => ({ ...p, price: e.target.value }))}
                          placeholder="Totalpris (kr)"
                          type="number"
                          className="w-32 text-xs bg-zinc-50 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200 border border-zinc-200"
                        />
                        <select
                          value={quoteForm.validDays}
                          onChange={(e) => setQuoteForm((p) => ({ ...p, validDays: e.target.value }))}
                          className="text-xs bg-zinc-50 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200 border border-zinc-200"
                        >
                          <option value="7">Giltig 7 dagar</option>
                          <option value="14">Giltig 14 dagar</option>
                          <option value="30">Giltig 30 dagar</option>
                        </select>
                      </div>
                      <textarea
                        value={quoteForm.note}
                        onChange={(e) => setQuoteForm((p) => ({ ...p, note: e.target.value }))}
                        placeholder="Meddelande till patienten (valfritt)"
                        rows={2}
                        className="w-full text-xs bg-zinc-50 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200 border border-zinc-200 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSendQuote(row)}
                          disabled={!quoteForm.price || acting === row.invitationId}
                          className={cn(
                            "flex items-center gap-1.5 px-4 py-2 rounded-md text-[11px] font-semibold transition-colors",
                            quoteForm.price && acting !== row.invitationId
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-zinc-100 text-zinc-300",
                          )}
                        >
                          {acting === row.invitationId ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          Skicka offert
                        </button>
                        <button
                          onClick={() => setQuoting(null)}
                          className="px-4 py-2 rounded-md text-[11px] font-medium border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-colors"
                        >
                          Avbryt
                        </button>
                      </div>
                    </div>
                  )}

                  {!quoting && (
                    <div className="flex flex-wrap items-center gap-2">
                      {canClaim && (
                        <button
                          onClick={() => handleClaim(row)}
                          disabled={acting === row.invitationId}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-sky-600 text-white text-[11px] font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50"
                        >
                          {acting === row.invitationId ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          Ta ärendet
                        </button>
                      )}
                      {canQuote && (
                        <button
                          onClick={() => setQuoting(row.invitationId)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-amber-600 text-white text-[11px] font-semibold hover:bg-amber-700 transition-colors"
                        >
                          <Send className="w-3 h-3" /> Lämna offert
                        </button>
                      )}
                      <button
                        onClick={() => onOpenChat(row.request.id, row.patientInitials)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-zinc-200 text-zinc-600 text-[11px] font-medium hover:bg-zinc-50 transition-colors"
                      >
                        <FileText className="w-3 h-3" /> Chatta
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
