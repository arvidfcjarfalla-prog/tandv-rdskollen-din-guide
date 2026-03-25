import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronDown, Clock, FileText, User, Bell, LogOut, MapPin, Phone, Mail, ChevronRight, Star } from "lucide-react";

/* ── Mock data ────────────────────────────────────────────────────── */

const MOCK_USER = {
  name: "Anna Lindström",
  email: "anna.lindstrom@gmail.com",
  phone: "070-123 45 67",
  postalCode: "114 32",
  birthYear: 1985,
  memberSince: "mars 2026",
};

type RequestStatus = "active" | "offers" | "booked" | "expired";

const STATUS_LABELS: Record<RequestStatus, string> = {
  active: "Väntar på svar",
  offers: "Offerter inkomna",
  booked: "Bokad",
  expired: "Utgången",
};

const STATUS_COLORS: Record<RequestStatus, string> = {
  active: "bg-info-soft text-info",
  offers: "bg-positive-soft text-positive",
  booked: "bg-accent-soft text-accent",
  expired: "bg-bg-sunken text-text-tertiary",
};

interface MockRequest {
  id: string;
  date: string;
  track: "exam" | "known";
  teeth: string[];
  description: string;
  status: RequestStatus;
  offersCount: number;
  offers: MockOffer[];
}

interface MockOffer {
  clinic: string;
  area: string;
  price: number;
  responseTime: string;
  validUntil: string;
  selected?: boolean;
}

const MOCK_REQUESTS: MockRequest[] = [
  {
    id: "TK-2026-0847",
    date: "18 mars 2026",
    track: "known",
    teeth: ["11"],
    description: "Tandkrona porslin, framtand",
    status: "offers",
    offersCount: 3,
    offers: [
      { clinic: "Distriktstandvården Sveavägen", area: "Norrmalm", price: 6200, responseTime: "2 tim", validUntil: "28 mars" },
      { clinic: "Aqua Dental Odenplan", area: "Norrmalm", price: 7800, responseTime: "4 tim", validUntil: "30 mars" },
      { clinic: "Folktandvården Vasastan", area: "Vasastan", price: 5900, responseTime: "1 dag", validUntil: "31 mars", selected: true },
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
      { clinic: "Tandläkare Karin Olebratt", area: "Södermalm", price: 1350, responseTime: "3 tim", validUntil: "22 mars", selected: true },
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

const MOCK_NOTIFICATIONS = [
  { id: 1, text: "Folktandvården Vasastan har svarat på din förfrågan", time: "2 tim sedan", unread: true },
  { id: 2, text: "Din bokade tid hos Tandläkare Karin Olebratt är imorgon kl 10:00", time: "igår", unread: true },
  { id: 3, text: "Påminnelse: Din förfrågan TK-2026-0791 har löpt ut", time: "3 dagar sedan", unread: false },
];

/* ── Page ─────────────────────────────────────────────────────────── */

type Tab = "requests" | "profile" | "notifications";

export default function MyPagesPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("requests");
  const [expandedReq, setExpandedReq] = useState<string | null>(MOCK_REQUESTS[0].id);

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-bg-base pt-nav">
      <div className="max-w-content mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-xl text-text-primary">{MOCK_USER.name}</h1>
            <p className="text-xs text-text-tertiary">Medlem sedan {MOCK_USER.memberSince}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold">
            {MOCK_USER.name.split(" ").map((n) => n[0]).join("")}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border">
          {([
            { key: "requests" as Tab, label: "Förfrågningar", icon: FileText, badge: MOCK_REQUESTS.filter((r) => r.status === "offers").length },
            { key: "notifications" as Tab, label: "Notiser", icon: Bell, badge: unreadCount },
            { key: "profile" as Tab, label: "Profil", icon: User, badge: 0 },
          ]).map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                tab === key ? "text-text-primary border-accent" : "text-text-secondary border-transparent hover:text-text-primary"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {badge > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-accent text-white leading-none">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Requests tab ─────────────────────────────────────── */}
        {tab === "requests" && (
          <div className="space-y-3">
            {MOCK_REQUESTS.map((req) => {
              const isExpanded = expandedReq === req.id;
              return (
                <div key={req.id} className={cn("bg-bg-elevated border rounded-lg overflow-hidden transition-all", isExpanded ? "border-border-strong shadow-sm" : "border-border")}>
                  {/* Request header */}
                  <button onClick={() => setExpandedReq(isExpanded ? null : req.id)} className="w-full text-left px-5 py-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-text-primary">{req.id}</span>
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", STATUS_COLORS[req.status])}>
                          {STATUS_LABELS[req.status]}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary truncate">{req.description}</p>
                      <div className="flex gap-3 mt-1 text-[10px] text-text-tertiary">
                        <span>{req.date}</span>
                        {req.teeth.length > 0 && <span>Tand {req.teeth.join(", ")}</span>}
                        <span>{req.track === "exam" ? "Undersökning" : "Känd behandling"}</span>
                      </div>
                    </div>

                    {req.offersCount > 0 && (
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold text-text-primary">{req.offersCount}</div>
                        <div className="text-[10px] text-text-tertiary">offert{req.offersCount > 1 ? "er" : ""}</div>
                      </div>
                    )}

                    <ChevronDown className={cn("w-4 h-4 text-text-tertiary shrink-0 transition-transform", isExpanded && "rotate-180")} />
                  </button>

                  {/* Expanded: offers */}
                  {isExpanded && req.offers.length > 0 && (
                    <div className="border-t border-border px-5 py-3 space-y-2">
                      <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-2">
                        Inkomna offerter
                      </p>
                      {req.offers.map((offer, i) => (
                        <div key={i} className={cn(
                          "flex items-center gap-3 p-3 rounded-md border transition-colors",
                          offer.selected ? "border-accent bg-accent-soft" : "border-border hover:border-border-strong"
                        )}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs text-text-primary truncate">{offer.clinic}</span>
                              {offer.selected && <span className="text-[9px] text-accent font-semibold">✓ Vald</span>}
                            </div>
                            <div className="text-[10px] text-text-tertiary mt-0.5">
                              {offer.area} · Svarstid: {offer.responseTime} · Giltig t.o.m. {offer.validUntil}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-bold text-text-primary">{offer.price.toLocaleString("sv-SE")} kr</div>
                          </div>
                          {!offer.selected && req.status === "offers" && (
                            <button className="text-[10px] font-semibold text-accent hover:text-accent-hover shrink-0">
                              Välj
                            </button>
                          )}
                        </div>
                      ))}

                      {req.status === "offers" && (
                        <button
                          onClick={() => navigate("/compare")}
                          className="w-full mt-2 text-xs font-medium text-accent border border-accent rounded py-1.5 hover:bg-accent-soft transition-colors"
                        >
                          Jämför alla offerter
                        </button>
                      )}
                    </div>
                  )}

                  {isExpanded && req.offers.length === 0 && req.status === "expired" && (
                    <div className="border-t border-border px-5 py-4 text-center">
                      <p className="text-xs text-text-tertiary mb-2">Denna förfrågan har löpt ut.</p>
                      <button
                        onClick={() => navigate("/request")}
                        className="text-xs font-medium text-accent hover:text-accent-hover"
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
              className="w-full py-3 border-2 border-dashed border-border rounded-lg text-sm text-text-secondary hover:border-accent hover:text-accent transition-colors"
            >
              + Ny förfrågan
            </button>
          </div>
        )}

        {/* ── Notifications tab ────────────────────────────────── */}
        {tab === "notifications" && (
          <div className="space-y-1">
            {MOCK_NOTIFICATIONS.map((n) => (
              <div key={n.id} className={cn(
                "flex items-start gap-3 px-4 py-3 rounded-md transition-colors",
                n.unread ? "bg-accent-soft" : "hover:bg-bg-sunken"
              )}>
                <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", n.unread ? "bg-accent" : "bg-transparent")} />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-xs leading-relaxed", n.unread ? "text-text-primary font-medium" : "text-text-secondary")}>{n.text}</p>
                  <p className="text-[10px] text-text-tertiary mt-0.5">{n.time}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-text-tertiary shrink-0 mt-1" />
              </div>
            ))}
            {MOCK_NOTIFICATIONS.length === 0 && (
              <p className="text-center text-xs text-text-tertiary py-12">Inga notiser.</p>
            )}
          </div>
        )}

        {/* ── Profile tab ──────────────────────────────────────── */}
        {tab === "profile" && (
          <div className="space-y-5">
            {/* Personal info */}
            <div className="bg-bg-elevated border border-border rounded-lg p-5">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-3">Personuppgifter</h3>
              <div className="space-y-3">
                <ProfileRow icon={User} label="Namn" value={MOCK_USER.name} />
                <ProfileRow icon={Mail} label="E-post" value={MOCK_USER.email} />
                <ProfileRow icon={Phone} label="Telefon" value={MOCK_USER.phone} />
                <ProfileRow icon={MapPin} label="Postnummer" value={MOCK_USER.postalCode} />
                <ProfileRow icon={Clock} label="Födelseår" value={String(MOCK_USER.birthYear)} />
              </div>
              <button className="mt-4 text-xs font-medium text-accent hover:text-accent-hover">
                Redigera uppgifter
              </button>
            </div>

            {/* Dental info */}
            <div className="bg-bg-elevated border border-border rounded-lg p-5">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-3">Tandvårdsprofil</h3>
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Högkostnadsskydd</span>
                  <span className="text-text-primary font-medium">Under 3 000 kr (100% egeninsats)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Åldersgrupp</span>
                  <span className="text-text-primary font-medium">24–65 år (300 kr/år i bidrag)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Blodförtunnande</span>
                  <span className="text-text-primary font-medium">Nej</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Diabetes</span>
                  <span className="text-text-primary font-medium">Nej</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Allergier</span>
                  <span className="text-text-primary font-medium">Nej</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-bg-elevated border border-border rounded-lg p-5">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-3">Statistik</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="font-display text-lg text-text-primary">3</div>
                  <div className="text-[10px] text-text-tertiary">Förfrågningar</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-lg text-text-primary">9</div>
                  <div className="text-[10px] text-text-tertiary">Offerter</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-lg text-positive">12 400 kr</div>
                  <div className="text-[10px] text-text-tertiary">Sparat vs dyraste</div>
                </div>
              </div>
            </div>

            {/* Logout */}
            <button className="flex items-center gap-2 text-xs text-text-tertiary hover:text-danger transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              Logga ut
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
      <div className="flex-1 flex justify-between">
        <span className="text-xs text-text-secondary">{label}</span>
        <span className="text-xs text-text-primary font-medium">{value}</span>
      </div>
    </div>
  );
}
