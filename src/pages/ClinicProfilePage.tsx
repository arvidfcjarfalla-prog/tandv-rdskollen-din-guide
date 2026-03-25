import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MapPin, Phone, Globe, Mail, ExternalLink } from "lucide-react";
import {
  clinics,
  prices,
  FEATURED_TREATMENTS,
  getPriceStats,
} from "@/lib/clinic-data";

const TREATMENT_GROUPS = [
  { label: "Undersökning & diagnostik", codes: ["101", "107", "124"] },
  { label: "Behandling & kirurgi", codes: ["301", "401", "501"] },
  { label: "Fyllningar", codes: ["701", "704"] },
  { label: "Kronor", codes: ["800", "801"] },
];

export default function ClinicProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const clinic = clinics.find((c) => c.id === id);

  if (!clinic) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-display text-xl text-text-primary mb-3">Klinik hittades inte</h1>
          <button onClick={() => navigate("/kliniker")} className="text-sm text-accent hover:text-accent-hover underline">Tillbaka till kliniker</button>
        </div>
      </div>
    );
  }

  const reportedPrices = FEATURED_TREATMENTS.filter((t) => prices[clinic.id]?.[t.code]?.[0] != null).length;

  return (
    <div className="min-h-screen bg-bg-base py-12 px-6">
      <div className="max-w-content mx-auto">
        <button onClick={() => navigate(-1)} className="mb-5 text-text-secondary hover:text-text-primary transition-colors text-sm">← Tillbaka</button>

        {/* Header */}
        <div className="bg-bg-elevated rounded-lg p-6 shadow-sm border border-border mb-4">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-lg bg-accent-soft text-accent flex items-center justify-center font-bold text-base shrink-0">
              {clinic.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-xl text-text-primary mb-1">{clinic.name}</h1>
              <p className="text-sm text-text-secondary">{clinic.area} · Stockholm</p>
            </div>
            {clinic.priceLevelPct !== null && (
              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold shrink-0",
                clinic.priceLevelPct < -10 ? "bg-positive-soft text-positive" : clinic.priceLevelPct > 10 ? "bg-warning-soft text-warning" : "bg-bg-sunken text-text-secondary"
              )}>
                {clinic.priceLevelPct > 0 ? "+" : ""}{clinic.priceLevelPct}% vs referens
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <ContactRow icon={MapPin} text={`${clinic.address}, ${clinic.postalCode} Stockholm`} />
            {clinic.phone && <ContactRow icon={Phone} text={clinic.phone} />}
            {clinic.email && <ContactRow icon={Mail} text={clinic.email} />}
            {clinic.website && (
              <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-accent hover:underline">
                <Globe className="w-3.5 h-3.5 text-text-tertiary" />
                {clinic.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatBox value={`${reportedPrices}/${FEATURED_TREATMENTS.length}`} label="Priser rapporterade" />
            <StatBox
              value={clinic.priceLevelPct !== null ? `${clinic.priceLevelPct > 0 ? "+" : ""}${clinic.priceLevelPct}%` : "–"}
              label="vs referenspris"
              color={clinic.priceLevelPct !== null && clinic.priceLevelPct < 0 ? "text-positive" : clinic.priceLevelPct !== null && clinic.priceLevelPct > 10 ? "text-warning" : undefined}
            />
            <StatBox value="jan 2026" label="Senast uppdaterat" />
          </div>
        </div>

        {/* Prices */}
        <div className="bg-bg-elevated rounded-lg p-6 shadow-sm border border-border mb-4">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Behandlingspriser</h2>
          <div className="space-y-4">
            {TREATMENT_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.08em] mb-2">{group.label}</p>
                {group.codes.map((code) => {
                  const t = FEATURED_TREATMENTS.find((ft) => ft.code === code);
                  if (!t) return null;
                  const entry = prices[clinic.id]?.[code];
                  const cp = entry?.[0];
                  const rp = entry?.[1] ?? 0;
                  const stats = getPriceStats(code);
                  return (
                    <div key={code} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <div className="text-xs text-text-primary font-medium">{t.label}</div>
                        <div className="text-[10px] text-text-tertiary">Åtgärd {code} · Ref: {rp.toLocaleString("sv-SE")} kr</div>
                      </div>
                      {cp != null ? (
                        <div className="text-right">
                          <div className="text-sm font-semibold text-text-primary tabular-nums">{cp.toLocaleString("sv-SE")} kr</div>
                          <div className="flex items-center gap-2 justify-end">
                            <span className={cn("text-[10px] font-medium tabular-nums", cp < rp ? "text-positive" : cp > rp ? "text-warning" : "text-text-tertiary")}>
                              {cp === rp ? "= ref" : `${cp > rp ? "+" : ""}${Math.round(((cp - rp) / rp) * 100)}%`}
                            </span>
                            {stats && <span className="text-[9px] text-text-tertiary">Sthlm: {stats.min.toLocaleString("sv-SE")}–{stats.max.toLocaleString("sv-SE")}</span>}
                          </div>
                        </div>
                      ) : <span className="text-[11px] text-text-tertiary italic">Ej rapporterat</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-text-tertiary mt-4">Priser från Tandpriskollen (TLV), jan 2026. Medianpriser baserade på faktiska patientbetalningar.</p>
        </div>

        {/* CTA */}
        <div className="bg-accent-soft border border-accent-medium rounded-lg p-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-sm text-accent mb-0.5">Vill du ha en offert?</h3>
            <p className="text-xs text-text-secondary">Skicka en förfrågan och få personligt pris.</p>
          </div>
          <button onClick={() => navigate("/request")} className="bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-md font-medium text-sm transition-colors whitespace-nowrap shrink-0">
            Skicka förfrågan
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactRow({ icon: Icon, text }: { icon: typeof MapPin; text: string }) {
  return <div className="flex items-center gap-2 text-xs text-text-secondary"><Icon className="w-3.5 h-3.5 text-text-tertiary shrink-0" /><span className="truncate">{text}</span></div>;
}

function StatBox({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div className="bg-bg-sunken rounded-md p-3 text-center">
      <div className={cn("font-semibold text-sm mb-0.5", color || "text-text-primary")}>{value}</div>
      <div className="text-[10px] text-text-tertiary uppercase tracking-[0.04em]">{label}</div>
    </div>
  );
}
