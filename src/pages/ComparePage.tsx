import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronDown, MapPin, Info } from "lucide-react";
import { clinics, prices, FEATURED_TREATMENTS, getPriceStats } from "@/lib/clinic-data";

/* ── Simulated scenario ───────────────────────────────────────────── */

const SCENARIO = {
  treatment: "Undersökning + röntgen + lagning",
  tooth: "Tand 46 (första molar, underkäke höger)",
  submitted: "18 mars 2026",
  responses: "3 av 4 kliniker svarade inom 6 timmar",
};

/** Pick 4 real clinics with varied price levels for demo */
const OFFER_CLINIC_IDS = ["1735", "1401", "1281", "8566"];

interface Offer {
  id: number;
  clinicId: string;
  name: string;
  area: string;
  address: string;
  price: number;
  wait: string;
  responseTime: string;
  badge: "lowest" | "fastest" | null;
  validUntil: string;
  treatments: { code: string; label: string; price: number; ref: number }[];
}

function buildOffers(): Offer[] {
  const codes = ["101", "124", "701"];
  const waits = ["Om 1 dag", "Imorgon", "Om 3 dagar", "Nästa vecka"];
  const responseTimes = ["45 min", "2 tim", "6 tim", "1 dag"];
  const validDates = ["30 mars 2026", "28 mars 2026", "31 mars 2026", "2 april 2026"];

  const offers: Offer[] = [];
  OFFER_CLINIC_IDS.forEach((cid, i) => {
    const c = clinics.find((cl) => cl.id === cid);
    if (!c) return;
    const treatments: Offer["treatments"] = [];
    let total = 0;
    for (const code of codes) {
      const e = prices[cid]?.[code];
      if (e?.[0] != null) {
        treatments.push({ code, label: FEATURED_TREATMENTS.find((t) => t.code === code)?.label || code, price: e[0], ref: e[1] });
        total += e[0];
      }
    }
    if (!treatments.length) return;
    offers.push({ id: i + 1, clinicId: cid, name: c.name, area: c.area, address: c.address, price: total, wait: waits[i], responseTime: responseTimes[i], badge: null, validUntil: validDates[i], treatments });
  });

  if (offers.length) {
    offers.reduce((a, b) => (a.price < b.price ? a : b)).badge = "lowest";
    const fastest = offers.reduce((a, b) => {
      const order = ["45 min", "2 tim", "6 tim", "1 dag"];
      return order.indexOf(a.responseTime) <= order.indexOf(b.responseTime) ? a : b;
    });
    if (!fastest.badge) fastest.badge = "fastest";
  }
  return offers;
}

const OFFERS = buildOffers();
const refTotal = ["101", "124", "701"].reduce((s, c) => s + (getPriceStats(c)?.ref ?? 0), 0);

/* ── Page ─────────────────────────────────────────────────────────── */

type SortMode = "price" | "response";

export default function ComparePage() {
  const navigate = useNavigate();
  const [sortMode, setSortMode] = useState<SortMode>("price");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set([OFFERS[0]?.id]));

  const sorted = [...OFFERS].sort((a, b) =>
    sortMode === "price" ? a.price - b.price : a.responseTime.localeCompare(b.responseTime)
  );

  return (
    <div className="min-h-screen bg-bg-base py-12 px-6">
      <div className="max-w-content mx-auto">
        {/* Back — always goes to previous page or home */}
        <button onClick={() => navigate(-1)} className="mb-5 text-text-secondary hover:text-text-primary transition-colors text-sm">
          ← Tillbaka
        </button>

        {/* Demo context banner */}
        <div className="bg-info-soft border border-info/20 rounded-lg px-5 py-4 mb-6 flex gap-3">
          <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-text-primary mb-1">
              Så här ser det ut när klinikerna svarar
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Det här är ett exempel på hur offertjämförelsen fungerar. Du skickar en förfrågan,
              kliniker nära dig svarar med personliga offerter, och du väljer den som passar bäst.
              Priserna nedan är riktiga klinikpriser från Tandpriskollen.
            </p>
          </div>
        </div>

        <h1 className="font-display text-xl text-text-primary mb-1">Dina offerter</h1>
        <p className="text-sm text-text-secondary mb-2">{SCENARIO.treatment} · {SCENARIO.tooth}</p>

        {/* Scenario summary */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-text-tertiary mb-5">
          <span>Skickad: {SCENARIO.submitted}</span>
          <span>{SCENARIO.responses}</span>
        </div>

        {/* Stats bar */}
        <div className="bg-bg-elevated rounded-lg p-4 border border-border flex flex-wrap gap-4 items-center text-xs mb-4">
          <div><span className="text-text-secondary">Kliniker:</span> <span className="font-semibold text-text-primary">{OFFERS.length} svarade</span></div>
          <div className="h-3 w-px bg-border" />
          <div><span className="text-text-secondary">Lägst:</span> <span className="font-semibold text-positive">{Math.min(...OFFERS.map((o) => o.price)).toLocaleString("sv-SE")} kr</span></div>
          <div className="h-3 w-px bg-border" />
          <div><span className="text-text-secondary">Dyrast:</span> <span className="font-semibold text-warning">{Math.max(...OFFERS.map((o) => o.price)).toLocaleString("sv-SE")} kr</span></div>
          <div className="h-3 w-px bg-border" />
          <div><span className="text-text-secondary">Referens:</span> <span className="font-semibold text-text-primary">{refTotal.toLocaleString("sv-SE")} kr</span></div>
        </div>

        {/* Sort */}
        <div className="flex gap-2 mb-5">
          {(["price", "response"] as SortMode[]).map((s) => (
            <button key={s} onClick={() => setSortMode(s)} className={cn(
              "px-3 py-[6px] rounded-full border-[1.5px] text-xs font-medium transition-all",
              sortMode === s ? "border-accent bg-accent-soft text-accent" : "border-border bg-bg-base text-text-secondary hover:border-border-strong"
            )}>
              {s === "price" ? "Pris" : "Svarstid"}
            </button>
          ))}
        </div>

        {/* Offer cards */}
        <div className="space-y-3">
          {sorted.map((offer) => {
            const isExp = expanded.has(offer.id);
            const isSel = selectedId === offer.id;
            const diff = Math.round(((offer.price - refTotal) / refTotal) * 100);

            return (
              <div key={offer.id} className={cn(
                "bg-bg-elevated rounded-lg border-2 transition-all",
                isSel ? "border-accent shadow-md" : "border-border"
              )}>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <button onClick={() => navigate(`/clinic/${offer.clinicId}`)} className="font-semibold text-sm text-text-primary hover:text-accent transition-colors">
                          {offer.name}
                        </button>
                        {offer.badge === "lowest" && <span className="px-2 py-0.5 rounded-full bg-positive-soft text-positive text-[10px] font-semibold">Lägst pris</span>}
                        {offer.badge === "fastest" && <span className="px-2 py-0.5 rounded-full bg-info-soft text-info text-[10px] font-semibold">Snabbast</span>}
                      </div>
                      <p className="text-xs text-text-secondary flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {offer.area} · {offer.address}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className="font-display text-lg text-text-primary">{offer.price.toLocaleString("sv-SE")} kr</div>
                      <div className={cn("text-[10px] font-medium", diff < 0 ? "text-positive" : diff > 0 ? "text-warning" : "text-text-tertiary")}>
                        {diff === 0 ? "= ref" : `${diff > 0 ? "+" : ""}${diff}% vs ref`}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div><div className="text-[10px] text-text-tertiary uppercase">Tidigaste tid</div><div className="text-xs font-medium text-text-primary">{offer.wait}</div></div>
                    <div><div className="text-[10px] text-text-tertiary uppercase">Svarstid</div><div className="text-xs font-medium text-text-primary">{offer.responseTime}</div></div>
                    <div><div className="text-[10px] text-text-tertiary uppercase">Giltig t.o.m.</div><div className="text-xs font-medium text-text-primary">{offer.validUntil}</div></div>
                  </div>

                  <button onClick={() => setExpanded((prev) => { const n = new Set(prev); n.has(offer.id) ? n.delete(offer.id) : n.add(offer.id); return n; })}
                    className="text-accent hover:text-accent-hover text-xs font-medium flex items-center gap-1">
                    <ChevronDown className={cn("w-3 h-3 transition-transform", isExp && "rotate-180")} />
                    {isExp ? "Dölj detaljer" : "Visa vad som ingår"}
                  </button>

                  {isExp && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.06em] mb-2">Ingår i offerten</p>
                      {offer.treatments.map((t) => (
                        <div key={t.code} className="flex justify-between py-1 text-xs">
                          <span className="text-text-secondary">{t.label}</span>
                          <div className="flex gap-2">
                            <span className="font-semibold text-text-primary tabular-nums">{t.price.toLocaleString("sv-SE")} kr</span>
                            <span className="text-text-tertiary tabular-nums">ref {t.ref.toLocaleString("sv-SE")}</span>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 mt-1 border-t border-border text-xs font-semibold">
                        <span className="text-text-primary">Totalt</span>
                        <span className="text-text-primary tabular-nums">{offer.price.toLocaleString("sv-SE")} kr</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-5 pb-4">
                  {isSel ? (
                    <button onClick={() => navigate(`/confirm?offer=${offer.id}`)}
                      className="w-full bg-accent hover:bg-accent-hover text-white py-2.5 rounded-md font-medium text-sm transition-colors">
                      Välj {offer.name}
                    </button>
                  ) : (
                    <button onClick={() => setSelectedId(offer.id)}
                      className="w-full border-2 border-accent text-accent hover:bg-accent-soft py-2.5 rounded-md font-medium text-sm transition-colors">
                      Välj denna
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <p className="text-sm text-text-secondary mb-3">Vill du prova själv?</p>
          <button onClick={() => navigate("/request")} className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-md font-medium text-sm transition-colors">
            Skicka egen förfrågan
          </button>
        </div>
      </div>
    </div>
  );
}
