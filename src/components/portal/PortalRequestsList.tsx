import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronDown, MessageSquare, Check, X, Clock, ArrowRight } from "lucide-react";

/* ── Types ──────────────────────────────────────────── */

export type RequestStatus = "active" | "offers" | "booked" | "expired";

const STATUS_LABELS: Record<RequestStatus, string> = {
  active: "Väntar på svar",
  offers: "Offerter inkomna",
  booked: "Bokad",
  expired: "Utgången",
};

const STATUS_COLORS: Record<RequestStatus, string> = {
  active: "bg-sky-50 text-sky-600",
  offers: "bg-emerald-50 text-emerald-600",
  booked: "bg-amber-50 text-amber-700",
  expired: "bg-zinc-100 text-zinc-400",
};

export interface PortalOffer {
  clinic: string;
  clinicId: string;
  area: string;
  price: number;
  responseTime: string;
  validUntil: string;
  rating: number;
  ratingCount: number;
  selected?: boolean;
  declined?: boolean;
}

export interface PortalRequest {
  id: string;
  date: string;
  track: "exam" | "known";
  teeth: string[];
  description: string;
  status: RequestStatus;
  offersCount: number;
  offers: PortalOffer[];
}

/* ── Mock data ──────────────────────────────────────── */

export const MOCK_REQUESTS: PortalRequest[] = [
  {
    id: "TK-2026-0847",
    date: "18 mars 2026",
    track: "known",
    teeth: ["11"],
    description: "Tandkrona porslin, framtand",
    status: "offers",
    offersCount: 3,
    offers: [
      { clinic: "Distriktstandvården Sveavägen", clinicId: "c1", area: "Norrmalm", price: 6200, responseTime: "2 tim", validUntil: "28 mars", rating: 4.6, ratingCount: 128 },
      { clinic: "Aqua Dental Odenplan", clinicId: "c2", area: "Norrmalm", price: 7800, responseTime: "4 tim", validUntil: "30 mars", rating: 4.2, ratingCount: 86 },
      { clinic: "Folktandvården Vasastan", clinicId: "c3", area: "Vasastan", price: 5900, responseTime: "1 dag", validUntil: "31 mars", rating: 4.8, ratingCount: 214, selected: true },
    ],
  },
  {
    id: "TK-2026-0812",
    date: "12 mars 2026",
    track: "exam",
    teeth: ["46", "47"],
    description: "Värk i kindtänder, känslig mot kallt",
    status: "booked",
    offersCount: 2,
    offers: [
      { clinic: "Tandläkare Karin Olebratt", clinicId: "c4", area: "Södermalm", price: 1350, responseTime: "3 tim", validUntil: "22 mars", rating: 4.9, ratingCount: 67, selected: true },
    ],
  },
  {
    id: "TK-2026-0791",
    date: "5 mars 2026",
    track: "exam",
    teeth: [],
    description: "Rutinundersökning + tandstensborttagning",
    status: "expired",
    offersCount: 4,
    offers: [],
  },
];

/* ── Component ──────────────────────────────────────── */

interface Props {
  onOpenChat: (clinicName: string) => void;
  onViewClinic: (clinicId: string) => void;
}

export default function PortalRequestsList({ onOpenChat, onViewClinic }: Props) {
  const navigate = useNavigate();
  const [expandedReq, setExpandedReq] = useState<string | null>(MOCK_REQUESTS[0].id);
  const [offerStates, setOfferStates] = useState<Record<string, Record<number, "accepted" | "declined">>>({});

  const handleAccept = (reqId: string, idx: number) => {
    setOfferStates((prev) => ({
      ...prev,
      [reqId]: { ...(prev[reqId] ?? {}), [idx]: "accepted" },
    }));
  };

  const handleDecline = (reqId: string, idx: number) => {
    setOfferStates((prev) => ({
      ...prev,
      [reqId]: { ...(prev[reqId] ?? {}), [idx]: "declined" },
    }));
  };

  return (
    <div className="space-y-3">
      {MOCK_REQUESTS.map((req) => {
        const isExpanded = expandedReq === req.id;
        return (
          <div
            key={req.id}
            className={cn(
              "bg-white border rounded-xl overflow-hidden transition-all duration-200",
              isExpanded ? "border-zinc-300 shadow-sm" : "border-zinc-200"
            )}
          >
            {/* Header */}
            <button
              onClick={() => setExpandedReq(isExpanded ? null : req.id)}
              className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-zinc-50/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-zinc-900">{req.id}</span>
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", STATUS_COLORS[req.status])}>
                    {STATUS_LABELS[req.status]}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 truncate">{req.description}</p>
                <div className="flex gap-3 mt-1 text-[10px] text-zinc-400">
                  <span>{req.date}</span>
                  {req.teeth.length > 0 && <span>Tand {req.teeth.join(", ")}</span>}
                  <span>{req.track === "exam" ? "Undersökning" : "Känd behandling"}</span>
                </div>
              </div>

              {req.offersCount > 0 && (
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold text-zinc-900">{req.offersCount}</div>
                  <div className="text-[10px] text-zinc-400">offert{req.offersCount > 1 ? "er" : ""}</div>
                </div>
              )}

              <ChevronDown className={cn("w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200", isExpanded && "rotate-180")} />
            </button>

            {/* Expanded offers */}
            {isExpanded && req.offers.length > 0 && (
              <div className="border-t border-zinc-100 px-5 py-4 space-y-2.5">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Inkomna offerter
                </p>
                {req.offers.map((offer, i) => {
                  const state = offerStates[req.id]?.[i] ?? (offer.selected ? "accepted" : undefined);
                  const isDeclined = state === "declined" || offer.declined;
                  const isAccepted = state === "accepted";

                  return (
                    <div
                      key={i}
                      className={cn(
                        "p-4 rounded-lg border transition-all duration-200",
                        isAccepted ? "border-emerald-300 bg-emerald-50/50" :
                        isDeclined ? "border-zinc-200 bg-zinc-50 opacity-60" :
                        "border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <button
                              onClick={() => onViewClinic(offer.clinicId)}
                              className="font-semibold text-xs text-zinc-900 hover:text-amber-700 transition-colors truncate"
                            >
                              {offer.clinic}
                            </button>
                            {isAccepted && (
                              <span className="flex items-center gap-0.5 text-[9px] text-emerald-600 font-semibold">
                                <Check className="w-3 h-3" /> Accepterad
                              </span>
                            )}
                            {isDeclined && (
                              <span className="text-[9px] text-zinc-400 font-semibold">Avböjd</span>
                            )}
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <svg key={s} className={cn("w-3 h-3", s <= Math.round(offer.rating) ? "text-amber-400" : "text-zinc-200")} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="text-[10px] text-zinc-500 ml-0.5">{offer.rating}</span>
                              <span className="text-[10px] text-zinc-400">({offer.ratingCount})</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                            <span>{offer.area}</span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {offer.responseTime}</span>
                            <span>·</span>
                            <span>Giltig t.o.m. {offer.validUntil}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-base font-bold text-zinc-900">{offer.price.toLocaleString("sv-SE")} kr</div>
                        </div>
                      </div>

                      {/* Action bar */}
                      {!isAccepted && !isDeclined && req.status === "offers" && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-100">
                          <button
                            onClick={() => handleAccept(req.id, i)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 transition-colors"
                          >
                            <Check className="w-3 h-3" /> Acceptera
                          </button>
                          <button
                            onClick={() => handleDecline(req.id, i)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-200 text-zinc-500 text-[11px] font-medium hover:bg-zinc-50 transition-colors"
                          >
                            <X className="w-3 h-3" /> Avböj
                          </button>
                          <button
                            onClick={() => onOpenChat(offer.clinic)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-200 text-zinc-500 text-[11px] font-medium hover:bg-zinc-50 transition-colors ml-auto"
                          >
                            <MessageSquare className="w-3 h-3" /> Ställ fråga
                          </button>
                        </div>
                      )}

                      {isAccepted && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-emerald-100">
                          <button
                            onClick={() => onOpenChat(offer.clinic)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-emerald-200 text-emerald-700 text-[11px] font-medium hover:bg-emerald-50 transition-colors"
                          >
                            <MessageSquare className="w-3 h-3" /> Skicka meddelande
                          </button>
                          <button
                            onClick={() => onViewClinic(offer.clinicId)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-200 text-zinc-500 text-[11px] font-medium hover:bg-zinc-50 transition-colors ml-auto"
                          >
                            Se klinikprofil <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {req.status === "offers" && (
                  <button
                    onClick={() => navigate("/compare")}
                    className="w-full mt-2 text-xs font-medium text-amber-700 border border-amber-300 rounded-lg py-2 hover:bg-amber-50 transition-colors"
                  >
                    Jämför alla offerter
                  </button>
                )}
              </div>
            )}

            {isExpanded && req.offers.length === 0 && req.status === "expired" && (
              <div className="border-t border-zinc-100 px-5 py-5 text-center">
                <p className="text-xs text-zinc-400 mb-2">Denna förfrågan har löpt ut.</p>
                <button
                  onClick={() => navigate("/request")}
                  className="text-xs font-medium text-amber-700 hover:text-amber-800"
                >
                  Skicka ny förfrågan →
                </button>
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
