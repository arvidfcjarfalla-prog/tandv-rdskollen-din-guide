import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Clock, MapPin, FileText, Send, Eye } from "lucide-react";

export interface IncomingRequest {
  id: string;
  patientInitials: string;
  patientAge: number;
  date: string;
  treatment: string;
  teeth: string[];
  description: string;
  status: "new" | "quoted" | "accepted" | "declined" | "expired";
  urgency: "normal" | "urgent";
  attachments: number;
  quoteSent?: { price: number; sentAt: string };
}

const STATUS_MAP: Record<IncomingRequest["status"], { label: string; cls: string }> = {
  new: { label: "Ny", cls: "bg-sky-50 text-sky-600" },
  quoted: { label: "Offert skickad", cls: "bg-amber-50 text-amber-700" },
  accepted: { label: "Accepterad", cls: "bg-emerald-50 text-emerald-600" },
  declined: { label: "Avböjd", cls: "bg-zinc-100 text-zinc-400" },
  expired: { label: "Utgången", cls: "bg-zinc-100 text-zinc-400" },
};

export const MOCK_INCOMING: IncomingRequest[] = [
  {
    id: "TK-2026-0847",
    patientInitials: "AH",
    patientAge: 34,
    date: "18 mars 2026, 09:14",
    treatment: "Tandkrona porslin",
    teeth: ["11"],
    description: "Framtand som spruckit, behöver krona. Patientens första krona.",
    status: "new",
    urgency: "normal",
    attachments: 1,
  },
  {
    id: "TK-2026-0839",
    patientInitials: "ML",
    patientAge: 52,
    date: "17 mars 2026, 14:30",
    treatment: "Implantat + krona",
    teeth: ["36"],
    description: "Saknar tand 36 sedan 2 år. Önskar implantat med porslinskrona.",
    status: "new",
    urgency: "urgent",
    attachments: 2,
  },
  {
    id: "TK-2026-0821",
    patientInitials: "ES",
    patientAge: 28,
    date: "15 mars 2026, 11:02",
    treatment: "Rotbehandling",
    teeth: ["46"],
    description: "Akut värk sedan 3 dagar. Remiss från husläkare.",
    status: "quoted",
    urgency: "urgent",
    attachments: 0,
    quoteSent: { price: 4800, sentAt: "15 mars, 13:20" },
  },
  {
    id: "TK-2026-0805",
    patientInitials: "KJ",
    patientAge: 41,
    date: "12 mars 2026, 08:45",
    treatment: "Tandblekning",
    teeth: [],
    description: "Önskar professionell blekning, hela överkäken.",
    status: "accepted",
    urgency: "normal",
    attachments: 0,
    quoteSent: { price: 3200, sentAt: "12 mars, 10:15" },
  },
  {
    id: "TK-2026-0798",
    patientInitials: "BN",
    patientAge: 67,
    date: "10 mars 2026, 16:20",
    treatment: "Helprotes överkäke",
    teeth: [],
    description: "Befintlig protes sliten, önskar ny.",
    status: "declined",
    urgency: "normal",
    attachments: 1,
  },
];

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
  const [expandedId, setExpandedId] = useState<string | null>(MOCK_INCOMING[0].id);
  const [filter, setFilter] = useState<"all" | "new" | "quoted" | "accepted">("all");
  const [quoting, setQuoting] = useState<string | null>(null);
  const [sentQuotes, setSentQuotes] = useState<Record<string, QuoteFormData>>({});
  const [quoteForm, setQuoteForm] = useState<QuoteFormData>({
    price: "",
    validDays: "14",
    note: "",
    items: [{ label: "Behandling", price: "" }],
  });

  const filtered = MOCK_INCOMING.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  const counts = {
    all: MOCK_INCOMING.length,
    new: MOCK_INCOMING.filter((r) => r.status === "new").length,
    quoted: MOCK_INCOMING.filter((r) => r.status === "quoted").length,
    accepted: MOCK_INCOMING.filter((r) => r.status === "accepted").length,
  };

  const handleSendQuote = (reqId: string) => {
    setSentQuotes((prev) => ({ ...prev, [reqId]: { ...quoteForm } }));
    setQuoting(null);
    setQuoteForm({ price: "", validDays: "14", note: "", items: [{ label: "Behandling", price: "" }] });
  };

  const addItem = () => {
    setQuoteForm((prev) => ({
      ...prev,
      items: [...prev.items, { label: "", price: "" }],
    }));
  };

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {(["all", "new", "quoted", "accepted"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap",
              filter === f
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
            )}
          >
            {f === "all" ? "Alla" : f === "new" ? "Nya" : f === "quoted" ? "Offererade" : "Accepterade"}
            <span className="ml-1 opacity-60">({counts[f]})</span>
          </button>
        ))}
      </div>

      {/* Request cards */}
      <div className="space-y-2.5">
        {filtered.map((req) => {
          const isExpanded = expandedId === req.id;
          const hasSentQuote = !!sentQuotes[req.id] || !!req.quoteSent;
          const st = STATUS_MAP[req.status];

          return (
            <div
              key={req.id}
              className={cn(
                "bg-white border rounded-xl overflow-hidden transition-all duration-200",
                isExpanded ? "border-zinc-300 shadow-sm" : "border-zinc-200",
                req.status === "new" && "ring-1 ring-sky-200"
              )}
            >
              {/* Header row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : req.id)}
                className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-zinc-50/50 transition-colors"
              >
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                  req.urgency === "urgent"
                    ? "bg-red-50 text-red-600 ring-2 ring-red-200"
                    : "bg-zinc-100 text-zinc-600"
                )}>
                  {req.patientInitials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm text-zinc-900">{req.treatment}</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", st.cls)}>
                      {st.label}
                    </span>
                    {req.urgency === "urgent" && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-500">
                        Brådskande
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 text-[10px] text-zinc-400">
                    <span>{req.id}</span>
                    <span>·</span>
                    <span>{req.date}</span>
                    {req.teeth.length > 0 && (
                      <>
                        <span>·</span>
                        <span>Tand {req.teeth.join(", ")}</span>
                      </>
                    )}
                  </div>
                </div>

                {hasSentQuote && (
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-zinc-900">
                      {(sentQuotes[req.id]?.price || req.quoteSent?.price || 0).toLocaleString("sv-SE")} kr
                    </div>
                    <div className="text-[10px] text-zinc-400">offert</div>
                  </div>
                )}

                <ChevronDown className={cn("w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200", isExpanded && "rotate-180")} />
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-zinc-100 px-5 py-4 space-y-4">
                  {/* Patient info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-50 rounded-lg p-3">
                      <p className="text-[10px] text-zinc-400 font-medium mb-1">Patient</p>
                      <p className="text-xs font-semibold text-zinc-700">{req.patientInitials}, {req.patientAge} år</p>
                    </div>
                    <div className="bg-zinc-50 rounded-lg p-3">
                      <p className="text-[10px] text-zinc-400 font-medium mb-1">Bilagor</p>
                      <p className="text-xs font-semibold text-zinc-700">{req.attachments} fil{req.attachments !== 1 ? "er" : ""}</p>
                    </div>
                  </div>

                  <div className="bg-zinc-50 rounded-lg p-3">
                    <p className="text-[10px] text-zinc-400 font-medium mb-1">Beskrivning</p>
                    <p className="text-xs text-zinc-700 leading-relaxed">{req.description}</p>
                  </div>

                  {/* Sent quote summary */}
                  {hasSentQuote && !quoting && (
                    <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3">
                      <p className="text-[10px] text-amber-600 font-semibold mb-1">Skickad offert</p>
                      <p className="text-sm font-bold text-zinc-900">
                        {(sentQuotes[req.id]?.price || req.quoteSent?.price || 0).toLocaleString("sv-SE")} kr
                      </p>
                      {req.quoteSent && (
                        <p className="text-[10px] text-zinc-400 mt-0.5">Skickad {req.quoteSent.sentAt}</p>
                      )}
                    </div>
                  )}

                  {/* Quote form */}
                  {quoting === req.id && (
                    <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-3">
                      <p className="text-xs font-semibold text-zinc-700">Skapa offert</p>

                      {quoteForm.items.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            value={item.label}
                            onChange={(e) => {
                              const items = [...quoteForm.items];
                              items[idx] = { ...items[idx], label: e.target.value };
                              setQuoteForm((prev) => ({ ...prev, items }));
                            }}
                            placeholder="Rad (t.ex. Krona porslin)"
                            className="flex-1 text-xs bg-zinc-50 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200 border border-zinc-200"
                          />
                          <input
                            value={item.price}
                            onChange={(e) => {
                              const items = [...quoteForm.items];
                              items[idx] = { ...items[idx], price: e.target.value };
                              setQuoteForm((prev) => ({ ...prev, items }));
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
                          onChange={(e) => setQuoteForm((prev) => ({ ...prev, price: e.target.value }))}
                          placeholder="Totalpris (kr)"
                          type="number"
                          className="w-32 text-xs bg-zinc-50 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200 border border-zinc-200"
                        />
                        <select
                          value={quoteForm.validDays}
                          onChange={(e) => setQuoteForm((prev) => ({ ...prev, validDays: e.target.value }))}
                          className="text-xs bg-zinc-50 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200 border border-zinc-200"
                        >
                          <option value="7">Giltig 7 dagar</option>
                          <option value="14">Giltig 14 dagar</option>
                          <option value="30">Giltig 30 dagar</option>
                        </select>
                      </div>

                      <textarea
                        value={quoteForm.note}
                        onChange={(e) => setQuoteForm((prev) => ({ ...prev, note: e.target.value }))}
                        placeholder="Meddelande till patienten (valfritt)"
                        rows={2}
                        className="w-full text-xs bg-zinc-50 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200 border border-zinc-200 resize-none"
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSendQuote(req.id)}
                          disabled={!quoteForm.price}
                          className={cn(
                            "flex items-center gap-1.5 px-4 py-2 rounded-md text-[11px] font-semibold transition-colors",
                            quoteForm.price
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-zinc-100 text-zinc-300"
                          )}
                        >
                          <Send className="w-3 h-3" /> Skicka offert
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

                  {/* Actions */}
                  {!quoting && (
                    <div className="flex flex-wrap items-center gap-2">
                      {req.status === "new" && (
                        <button
                          onClick={() => setQuoting(req.id)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-amber-600 text-white text-[11px] font-semibold hover:bg-amber-700 transition-colors"
                        >
                          <Send className="w-3 h-3" /> Lämna offert
                        </button>
                      )}
                      <button
                        onClick={() => onOpenChat(req.id, req.patientInitials)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-zinc-200 text-zinc-600 text-[11px] font-medium hover:bg-zinc-50 transition-colors"
                      >
                        <FileText className="w-3 h-3" /> Chatta med patient
                      </button>
                      {req.attachments > 0 && (
                        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-zinc-200 text-zinc-600 text-[11px] font-medium hover:bg-zinc-50 transition-colors">
                          <Eye className="w-3 h-3" /> Visa bilagor
                        </button>
                      )}
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
