import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronDown, MessageSquare, Check, X, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type DbRequestStatus = "open" | "quoted" | "accepted" | "declined" | "closed";

interface DbOffer {
  id: string;
  clinic_id: string;
  total_price: number;
  status: string;
  valid_until: string | null;
  message: string | null;
  created_at: string;
  clinic?: { id: string; name: string; area: string | null; rating: number | null; rating_count: number | null };
}

interface DbRequest {
  id: string;
  created_at: string;
  track: string | null;
  selected_teeth: string[];
  treatment_free_text: string | null;
  description: string | null;
  status: DbRequestStatus;
  accepted_offer_id: string | null;
  offers: DbOffer[];
  invitedCount: number;
  claimedCount: number;
}

const STATUS_LABELS: Record<DbRequestStatus, string> = {
  open: "Väntar på svar",
  quoted: "Offerter inkomna",
  accepted: "Bokad",
  declined: "Avböjd",
  closed: "Stängd",
};

const STATUS_COLORS: Record<DbRequestStatus, string> = {
  open: "bg-sky-50 text-sky-600",
  quoted: "bg-emerald-50 text-emerald-600",
  accepted: "bg-amber-50 text-amber-700",
  declined: "bg-zinc-100 text-zinc-400",
  closed: "bg-zinc-100 text-zinc-400",
};

interface Props {
  onOpenChat: (clinicName: string) => void;
  onViewClinic: (clinicId: string) => void;
}

export default function PortalRequestsList({ onOpenChat, onViewClinic }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<DbRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReq, setExpandedReq] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: reqs, error } = await supabase
      .from("requests")
      .select("*")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Kunde inte hämta dina förfrågningar");
      setLoading(false);
      return;
    }

    if (!reqs?.length) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const reqIds = reqs.map((r) => r.id);
    const [{ data: offers }, { data: invites }] = await Promise.all([
      supabase.from("offers").select("*").in("request_id", reqIds),
      supabase.from("request_clinics").select("request_id, status").in("request_id", reqIds),
    ]);

    const clinicIds = Array.from(new Set((offers ?? []).map((o) => o.clinic_id)));
    const { data: clinics } = clinicIds.length
      ? await supabase.from("clinics").select("id, name, area, rating, rating_count").in("id", clinicIds)
      : { data: [] };

    const clinicMap = new Map((clinics ?? []).map((c) => [c.id, c]));

    const built: DbRequest[] = reqs.map((r) => {
      const reqOffers = (offers ?? [])
        .filter((o) => o.request_id === r.id)
        .map((o) => ({ ...o, clinic: clinicMap.get(o.clinic_id) as any }));
      const reqInvites = (invites ?? []).filter((i) => i.request_id === r.id);
      return {
        id: r.id,
        created_at: r.created_at,
        track: r.track,
        selected_teeth: (r.selected_teeth ?? []) as string[],
        treatment_free_text: r.treatment_free_text,
        description: r.description,
        status: r.status as DbRequestStatus,
        accepted_offer_id: r.accepted_offer_id,
        offers: reqOffers as DbOffer[],
        invitedCount: reqInvites.length,
        claimedCount: reqInvites.filter((i) => i.status === "claimed" || i.status === "quoted").length,
      };
    });

    setRequests(built);
    if (built.length > 0 && !expandedReq) setExpandedReq(built[0].id);
    setLoading(false);
  }, [user, expandedReq]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime: refetch when offers/requests change
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`patient-portal-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "offers" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "requests", filter: `patient_id=eq.${user.id}` }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, load]);

  const handleAccept = async (offerId: string) => {
    setActing(offerId);
    try {
      const { data, error } = await supabase.functions.invoke("accept-offer", {
        body: { offer_id: offerId },
      });
      if (error) throw error;
      if (!(data as any)?.success) {
        toast.error("Kunde inte acceptera offerten");
      } else {
        toast.success("Offert accepterad — bokning skapad");
      }
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Något gick fel");
    } finally {
      setActing(null);
    }
  };

  const handleDecline = async (offerId: string) => {
    setActing(offerId);
    try {
      const { error } = await supabase.from("offers").update({ status: "declined" }).eq("id", offerId);
      if (error) throw error;
      toast.success("Offert avböjd");
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Kunde inte avböja");
    } finally {
      setActing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="space-y-3">
        <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center">
          <p className="text-sm text-zinc-500">Du har inga förfrågningar ännu.</p>
        </div>
        <button
          onClick={() => navigate("/request")}
          className="w-full py-3.5 border-2 border-dashed border-zinc-200 rounded-xl text-sm text-zinc-400 hover:border-amber-400 hover:text-amber-700 transition-colors"
        >
          + Skicka första förfrågan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => {
        const isExpanded = expandedReq === req.id;
        const dateStr = new Date(req.created_at).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" });
        const treatmentTitle = req.treatment_free_text || req.description || "Förfrågan";
        const offersCount = req.offers.length;
        const isExpired = req.status === "closed" || req.status === "declined";

        return (
          <div
            key={req.id}
            className={cn(
              "bg-white border rounded-xl overflow-hidden transition-all duration-200",
              isExpanded ? "border-zinc-300 shadow-sm" : "border-zinc-200",
            )}
          >
            <button
              onClick={() => setExpandedReq(isExpanded ? null : req.id)}
              className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-zinc-50/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-sm text-zinc-900">{req.id.slice(0, 8).toUpperCase()}</span>
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", STATUS_COLORS[req.status])}>
                    {STATUS_LABELS[req.status]}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 truncate">{treatmentTitle}</p>
                <div className="flex gap-3 mt-1 text-[10px] text-zinc-400 flex-wrap">
                  <span>{dateStr}</span>
                  {req.selected_teeth.length > 0 && <span>Tand {req.selected_teeth.join(", ")}</span>}
                  <span>{req.invitedCount} kliniker inbjudna</span>
                </div>
              </div>

              {offersCount > 0 && (
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold text-zinc-900">{offersCount}</div>
                  <div className="text-[10px] text-zinc-400">offert{offersCount > 1 ? "er" : ""}</div>
                </div>
              )}

              <ChevronDown className={cn("w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200", isExpanded && "rotate-180")} />
            </button>

            {isExpanded && (
              <div className="border-t border-zinc-100 px-5 py-4 space-y-2.5">
                {offersCount === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-zinc-500 mb-1">Inga offerter ännu</p>
                    <p className="text-[10px] text-zinc-400">
                      {req.claimedCount > 0
                        ? `${req.claimedCount} klinik(er) tittar på din förfrågan`
                        : "Klinikerna har blivit aviserade och brukar svara inom 24 timmar"}
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Inkomna offerter</p>
                    {req.offers.map((offer) => {
                      const isAccepted = offer.id === req.accepted_offer_id || offer.status === "accepted";
                      const isDeclined = offer.status === "declined";
                      return (
                        <div
                          key={offer.id}
                          className={cn(
                            "p-4 rounded-lg border transition-all duration-200",
                            isAccepted
                              ? "border-emerald-300 bg-emerald-50/50"
                              : isDeclined
                              ? "border-zinc-200 bg-zinc-50 opacity-60"
                              : "border-zinc-200 hover:border-zinc-300 hover:shadow-sm",
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <button
                                  onClick={() => onViewClinic(offer.clinic?.id ?? offer.clinic_id)}
                                  className="font-semibold text-xs text-zinc-900 hover:text-amber-700 transition-colors truncate"
                                >
                                  {offer.clinic?.name ?? "Klinik"}
                                </button>
                                {isAccepted && (
                                  <span className="flex items-center gap-0.5 text-[9px] text-emerald-600 font-semibold">
                                    <Check className="w-3 h-3" /> Accepterad
                                  </span>
                                )}
                                {isDeclined && <span className="text-[9px] text-zinc-400 font-semibold">Avböjd</span>}
                              </div>

                              {offer.clinic?.rating ? (
                                <div className="flex items-center gap-1.5 mb-1">
                                  <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <svg
                                        key={s}
                                        className={cn(
                                          "w-3 h-3",
                                          s <= Math.round(offer.clinic!.rating ?? 0) ? "text-amber-400" : "text-zinc-200",
                                        )}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                    <span className="text-[10px] text-zinc-500 ml-0.5">{offer.clinic.rating}</span>
                                    <span className="text-[10px] text-zinc-400">({offer.clinic.rating_count})</span>
                                  </div>
                                </div>
                              ) : null}

                              <div className="flex items-center gap-2 text-[10px] text-zinc-400 flex-wrap">
                                {offer.clinic?.area && <span>{offer.clinic.area}</span>}
                                {offer.valid_until && (
                                  <>
                                    <span>·</span>
                                    <span className="flex items-center gap-0.5">
                                      <Clock className="w-2.5 h-2.5" /> Giltig t.o.m. {new Date(offer.valid_until).toLocaleDateString("sv-SE")}
                                    </span>
                                  </>
                                )}
                              </div>

                              {offer.message && (
                                <p className="mt-2 text-[11px] text-zinc-600 bg-zinc-50 rounded px-2 py-1.5">{offer.message}</p>
                              )}
                            </div>

                            <div className="text-right shrink-0">
                              <div className="text-base font-bold text-zinc-900">
                                {offer.total_price.toLocaleString("sv-SE")} kr
                              </div>
                            </div>
                          </div>

                          {!isAccepted && !isDeclined && req.status !== "accepted" && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-100">
                              <button
                                onClick={() => handleAccept(offer.id)}
                                disabled={acting === offer.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                              >
                                {acting === offer.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                Acceptera
                              </button>
                              <button
                                onClick={() => handleDecline(offer.id)}
                                disabled={acting === offer.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-200 text-zinc-500 text-[11px] font-medium hover:bg-zinc-50 transition-colors"
                              >
                                <X className="w-3 h-3" /> Avböj
                              </button>
                              <button
                                onClick={() => onOpenChat(offer.clinic?.name ?? "Klinik")}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-200 text-zinc-500 text-[11px] font-medium hover:bg-zinc-50 transition-colors ml-auto"
                              >
                                <MessageSquare className="w-3 h-3" /> Fråga
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}

                {isExpired && (
                  <button
                    onClick={() => navigate("/request")}
                    className="w-full mt-2 text-xs font-medium text-amber-700 border border-amber-300 rounded-lg py-2 hover:bg-amber-50 transition-colors"
                  >
                    Skicka ny förfrågan
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={() => navigate("/request")}
        className="w-full py-3.5 border-2 border-dashed border-zinc-200 rounded-xl text-sm text-zinc-400 hover:border-amber-400 hover:text-amber-700 transition-colors"
      >
        + Ny förfrågan
      </button>
    </div>
  );
}
