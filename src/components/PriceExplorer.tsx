import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  clinics,
  prices,
  FEATURED_TREATMENTS,
  getPriceStats,
} from "@/lib/clinic-data";

const TREATMENTS = FEATURED_TREATMENTS.slice(0, 6); // Show 6 most relevant

const INCLUDES: string[][] = [
  ["Klinisk undersökning", "Oral hälsobedömning", "Behandlingsplan"],
  ["Klinisk undersökning", "Panoramaröntgen", "Utredning", "Behandlingsförslag"],
  ["Bedömning + röntgenbilder", "Panoramaröntgen (helkäke)"],
  ["Undersökning", "Ev. röntgen", "Smärtlindring/medicinering"],
  ["Bedövning", "Extraktion", "Efterkontroll"],
  ["Bedövning", "Rotkanalsbehandling", "Temporär fyllning"],
];

const CONTEXTS = [
  "Vanligaste första besöket. Rekommenderas var 12–24 månad.",
  "Inkluderar undersökning och full röntgen. Inför större behandlingar.",
  "Helkäksröntgen. Ofta del av en undersökning.",
  "Akut smärtlindring eller enklare behandling. Kvällstid +50%.",
  "Enkel extraktion. Kirurgisk visdomstand kostar mer.",
  "En rotkanal, framtand. Kindtänder (2–3 kanaler) kostar mer.",
];

/** Pick the N cheapest + N most expensive clinics that report a price for this code */
function getClinicBars(code: string, count: number) {
  const rows: { id: string; name: string; price: number; ref: number }[] = [];

  for (const c of clinics) {
    const p = prices[c.id]?.[code];
    if (!p || p[0] === null) continue;
    rows.push({ id: c.id, name: c.name, price: p[0], ref: p[1] });
  }

  rows.sort((a, b) => a.price - b.price);
  if (rows.length <= count * 2) return rows;

  // Show cheapest + most expensive + avoid duplicates
  const cheapest = rows.slice(0, count);
  const expensive = rows.slice(-count);
  return [...cheapest, ...expensive];
}

export function PriceExplorer() {
  const [tab, setTab] = useState(0);
  const [vis, setVis] = useState(false);
  const [fade, setFade] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true); },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const pick = (i: number) => {
    if (i === tab) return;
    setFade(false);
    setTimeout(() => { setTab(i); setFade(true); }, 150);
  };

  const code = TREATMENTS[tab].code;
  const stats = useMemo(() => getPriceStats(code), [code]);
  const clinicRows = useMemo(() => getClinicBars(code, 5), [code]);
  const inc = INCLUDES[tab];
  const context = CONTEXTS[tab];

  if (!stats) return null;

  const maxPrice = Math.max(...clinicRows.map((c) => c.price), stats.ref);

  return (
    <section ref={ref} id="prices" className="py-24 px-6 bg-bg-sunken">
      <div
        className="max-w-content mx-auto"
        style={{
          opacity: vis ? 1 : 0,
          transform: vis ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-[0.12em] mb-3">
          Prisöversikt — {stats.count} kliniker i Stockholm
        </p>
        <h3 className="font-display text-lg mb-2">
          Vad tar klinikerna — innan du ens frågar?
        </h3>
        <p className="text-sm text-text-secondary mb-8 max-w-[540px] leading-relaxed">
          Klinikernas <strong className="text-text-primary font-semibold">rapporterade listpriser</strong> från
          Tandpriskollen, jämfört med det statliga referenspriset. Din offert kan skilja sig —
          men här ser du var de brukar ligga.
        </p>

        {/* Tabs */}
        <div className="flex flex-wrap gap-[6px] mb-6">
          {TREATMENTS.map((t, i) => (
            <button
              key={t.code}
              onClick={() => pick(i)}
              className={cn(
                "px-[18px] py-2 rounded-full text-sm font-medium transition-all duration-[250ms] select-none",
                tab === i
                  ? "border-[1.5px] border-accent bg-accent-soft text-accent font-semibold"
                  : "border-[1.5px] border-border bg-bg-elevated text-text-secondary hover:border-border-strong hover:text-text-primary"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 mb-4 text-[13px]">
          <span className="text-text-secondary">
            Billigast: <strong className="text-positive font-semibold">{stats.min.toLocaleString("sv-SE")} kr</strong>
          </span>
          <span className="text-text-secondary">
            Medel: <strong className="text-text-primary font-semibold">{stats.avg.toLocaleString("sv-SE")} kr</strong>
          </span>
          <span className="text-text-secondary">
            Dyrast: <strong className="text-warning font-semibold">{stats.max.toLocaleString("sv-SE")} kr</strong>
          </span>
          <span className="text-text-secondary">
            Referenspris: <strong className="text-text-tertiary font-semibold">{stats.ref.toLocaleString("sv-SE")} kr</strong>
          </span>
        </div>

        {/* Main card */}
        <div
          className="bg-bg-elevated border border-border rounded-lg overflow-hidden"
          style={{ opacity: fade ? 1 : 0, transition: "opacity 0.3s" }}
        >
          {/* Bar chart */}
          <div className="px-6 py-5">
            <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-4">
              5 billigaste + 5 dyraste av {stats.count} kliniker
            </p>
            <div className="flex flex-col gap-3">
              {/* Reference price row */}
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-text-tertiary font-medium w-[160px] shrink-0 truncate">
                  Referenspris (TLV)
                </span>
                <div className="flex-1 h-[6px] bg-bg-sunken rounded-[3px] relative">
                  <div
                    className="h-full rounded-[3px] bg-text-tertiary transition-all duration-[500ms]"
                    style={{
                      width: `${(stats.ref / maxPrice) * 100}%`,
                      transitionTimingFunction: "cubic-bezier(0.25,0.46,0.45,0.94)",
                    }}
                  />
                </div>
                <span className="text-[13px] font-semibold text-text-tertiary w-[70px] text-right shrink-0">
                  {stats.ref.toLocaleString("sv-SE")} kr
                </span>
                <span className="text-[11px] font-semibold w-[50px] text-right shrink-0 text-text-tertiary">
                  ref
                </span>
              </div>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Clinic rows */}
              {clinicRows.map((c, idx) => {
                const diff = Math.round(((c.price - c.ref) / c.ref) * 100);
                const isOver = diff > 0;
                const isUnder = diff < 0;

                return (
                  <div key={`${c.id}-${idx}`} className="flex items-center gap-3">
                    <span className="text-[13px] text-text-primary font-medium w-[160px] shrink-0 truncate" title={c.name}>
                      {c.name}
                    </span>
                    <div className="flex-1 h-[6px] bg-bg-sunken rounded-[3px] relative">
                      <div
                        className="h-full rounded-[3px] transition-all duration-[500ms]"
                        style={{
                          width: `${(c.price / maxPrice) * 100}%`,
                          background: isUnder ? "#2A7A4B" : isOver ? "#B8860B" : "#2A5A3F",
                          transitionTimingFunction: "cubic-bezier(0.25,0.46,0.45,0.94)",
                        }}
                      />
                    </div>
                    <span className="text-[13px] font-semibold text-text-primary w-[70px] text-right shrink-0">
                      {c.price.toLocaleString("sv-SE")} kr
                    </span>
                    <span className={cn(
                      "text-[11px] font-semibold w-[50px] text-right shrink-0",
                      isUnder && "text-positive",
                      isOver && "text-warning",
                      diff === 0 && "text-accent"
                    )}>
                      {diff === 0 ? "= ref" : `${isOver ? "+" : ""}${diff}%`}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4 mt-4 text-[10px] text-text-tertiary">
              <span className="flex items-center gap-1">
                <span className="w-[10px] h-[4px] bg-text-tertiary rounded-full inline-block" /> Referenspris
              </span>
              <span className="flex items-center gap-1">
                <span className="w-[10px] h-[4px] bg-positive rounded-full inline-block" /> Under referens
              </span>
              <span className="flex items-center gap-1">
                <span className="w-[10px] h-[4px] bg-warning rounded-full inline-block" /> Över referens
              </span>
            </div>
          </div>

          {/* What's included */}
          <div className="border-t border-border px-6 py-4 flex flex-col sm:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-3">
                Vad ingår normalt
              </p>
              <div className="flex flex-wrap gap-[6px]">
                {inc.map((item) => (
                  <span key={item} className="px-3 py-[5px] bg-bg-sunken rounded-full text-[12px] text-text-secondary font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="sm:w-[220px] shrink-0">
              <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-3">
                Vad påverkar priset
              </p>
              <p className="text-[13px] text-text-secondary leading-relaxed">{context}</p>
            </div>
          </div>

          {/* CTA */}
          <div className="border-t border-border px-6 py-4 bg-accent-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-[13px] text-accent font-medium">
              Vill du se vad just du får betala? Offerten visas mot samma referenspris.
            </p>
            <button
              onClick={() => navigate("/request")}
              className="px-5 py-[10px] bg-accent text-white text-sm font-semibold rounded-md hover:bg-accent-hover transition-colors whitespace-nowrap shrink-0"
            >
              Jämför priser
            </button>
          </div>
        </div>

        <p className="text-xs text-text-tertiary leading-[1.5] mt-4">
          Klinikpriser: Tandpriskollen, jan 2026 ({stats.count} kliniker i Stockholm). Referenspris: TLV. Offertpris kan avvika från listpris.
        </p>
      </div>
    </section>
  );
}
