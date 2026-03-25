import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { Search, ChevronDown, X, MapPin, Phone, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  clinics,
  prices,
  FEATURED_TREATMENTS,
  getPriceStats,
  type RealClinic,
} from "@/lib/clinic-data";
import "leaflet/dist/leaflet.css";

/* ── Constants ────────────────────────────────────────────────────── */

const AREAS = [...new Set(clinics.map((c) => c.area).filter(Boolean))].sort();
const STOCKHOLM_CENTER: [number, number] = [59.33, 18.07];
const PAGE_SIZE = 60;

type SortMode = "name" | "cheapest" | "expensive";
const SORT_LABELS: Record<SortMode, string> = { name: "A–Ö", cheapest: "Billigast", expensive: "Dyrast" };

/** Scenario-based treatment chips (patient language, not TLV codes) */
const TREATMENT_CHIPS = [
  { code: "101", label: "Undersökning" },
  { code: "701", label: "Lagning" },
  { code: "800", label: "Krona" },
  { code: "401", label: "Utdragning" },
  { code: "501", label: "Rotfyllning" },
  { code: "704", label: "Lagning kindtand" },
];

const TREATMENT_GROUPS = [
  { label: "Undersökning", codes: ["101", "107", "124"] },
  { label: "Behandling", codes: ["301", "401", "501"] },
  { label: "Fyllning", codes: ["701", "704"] },
  { label: "Krona", codes: ["800", "801"] },
];

/* ── Helpers ──────────────────────────────────────────────────────── */

function getClinicPrice(id: string, code: string): number | null {
  return prices[id]?.[code]?.[0] ?? null;
}

function getRefPrice(code: string): number {
  return getPriceStats(code)?.ref ?? 0;
}

/** Color a marker based on a specific treatment price vs reference (±10% thresholds) */
function treatmentDotColor(clinicId: string, code: string): string {
  const cp = getClinicPrice(clinicId, code);
  const rp = getRefPrice(code);
  if (cp === null || rp === 0) return "#D0CFCB";
  const diff = (cp - rp) / rp;
  if (diff < -0.10) return "#2A7A4B";
  if (diff > 0.10) return "#B8860B";
  return "#6B6B6B";
}

/** Color based on overall price level (±10% thresholds) */
function overallDotColor(pct: number | null): string {
  if (pct === null) return "#6B6B6B";
  if (pct < -10) return "#2A7A4B";
  if (pct > 10) return "#B8860B";
  return "#6B6B6B";
}

/* ── Map flyTo ────────────────────────────────────────────────────── */

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo([lat, lng], 15, { duration: 0.6 }); }, [map, lat, lng]);
  return null;
}

/* ── Page ─────────────────────────────────────────────────────────── */

export default function ClinicsPage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [area, setArea] = useState<string | null>(null);
  const [treatment, setTreatment] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>("name");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [compareSet, setCompareSet] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState(false);
  const [openDrop, setOpenDrop] = useState<"area" | "sort" | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);

  const listRef = useRef<HTMLDivElement>(null);

  // Ref price for selected treatment (cached)
  const selectedRef = treatment ? getRefPrice(treatment) : 0;

  /* ── Derived ────────────────────────────────────────────────────── */

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    let list: RealClinic[] = clinics;
    if (q) list = list.filter((c) =>
      c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q) ||
      c.postalCode.includes(q) || c.area.toLowerCase().includes(q)
    );
    if (area) list = list.filter((c) => c.area === area);
    return list;
  }, [query, area]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sort === "name") {
      arr.sort((a, b) => a.name.localeCompare(b.name, "sv"));
    } else {
      const code = treatment || "101";
      const dir = sort === "cheapest" ? 1 : -1;
      arr.sort((a, b) => {
        const pa = getClinicPrice(a.id, code);
        const pb = getClinicPrice(b.id, code);
        if (pa === null && pb === null) return 0;
        if (pa === null) return 1;
        if (pb === null) return -1;
        return (pa - pb) * dir;
      });
    }
    return arr;
  }, [filtered, sort, treatment]);

  const visible = sorted.slice(0, visibleCount);
  const geoFilteredIds = useMemo(() => new Set(filtered.map((c) => c.id)), [filtered]);

  /* ── Effects ────────────────────────────────────────────────────── */

  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMore = useCallback(() => {
    setVisibleCount((v) => Math.min(v + PAGE_SIZE, sorted.length));
  }, [sorted.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) loadMore(); }, { rootMargin: "300px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [query, area, sort, treatment]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-dropdown]")) setOpenDrop(null);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  /* ── Handlers ───────────────────────────────────────────────────── */

  const toggleCompare = (id: string) => {
    setCompareSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 4) next.add(id);
      return next;
    });
  };

  const handleCardClick = (clinic: RealClinic) => {
    setExpandedId(expandedId === clinic.id ? null : clinic.id);
    if (clinic.lat && clinic.lng) setFlyTarget({ lat: clinic.lat, lng: clinic.lng });
  };

  const handleMapMarkerClick = (clinic: RealClinic) => {
    setExpandedId(clinic.id);
    const el = document.getElementById(`clinic-${clinic.id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  /** Get marker color — treatment-specific if selected, otherwise overall */
  const getMarkerColor = (c: RealClinic) => {
    if (treatment) return treatmentDotColor(c.id, treatment);
    return overallDotColor(c.priceLevelPct);
  };

  /* ── Render ─────────────────────────────────────────────────────── */

  return (
    <div className="h-screen flex flex-col pt-nav">
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="hidden md:block flex-1 relative">
          <MapContainer center={STOCKHOLM_CENTER} zoom={12} className="h-full w-full" zoomControl={false} attributionControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            {flyTarget && <FlyTo lat={flyTarget.lat} lng={flyTarget.lng} />}

            {clinics.map((c) => {
              if (!c.lat || !c.lng) return null;
              const isFiltered = geoFilteredIds.has(c.id);
              const isActive = expandedId === c.id;
              const isHovered = hoveredId === c.id;
              const color = getMarkerColor(c);
              const hasPrice = !treatment || getClinicPrice(c.id, treatment) !== null;

              return (
                <CircleMarker
                  key={c.id}
                  center={[c.lat, c.lng]}
                  radius={isActive ? 9 : isHovered ? 7 : 4.5}
                  pathOptions={{
                    color: isActive ? "#1A1A1A" : "white",
                    weight: isActive ? 2.5 : isHovered ? 1.5 : 1,
                    fillColor: isFiltered && hasPrice ? color : "#D0CFCB",
                    fillOpacity: isFiltered && hasPrice ? (isActive ? 1 : 0.85) : 0.2,
                  }}
                  eventHandlers={{
                    click: () => handleMapMarkerClick(c),
                    mouseover: () => setHoveredId(c.id),
                    mouseout: () => setHoveredId(null),
                  }}
                >
                  {(isActive || isHovered) && (
                    <Popup closeButton={false}>
                      <div className="text-xs font-semibold">{c.name}</div>
                      <div className="text-[10px] text-gray-500">{c.area}</div>
                      {treatment && (() => {
                        const p = getClinicPrice(c.id, treatment);
                        return p ? <div className="text-[11px] font-bold mt-0.5">{p.toLocaleString("sv-SE")} kr</div> : null;
                      })()}
                    </Popup>
                  )}
                </CircleMarker>
              );
            })}
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-md px-3 py-2 text-[10px] flex items-center gap-3 shadow-sm z-[400]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-positive" /> {">"}10% under ref</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#6B6B6B]" /> ±10%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning" /> {">"}10% över ref</span>
          </div>
        </div>

        {/* List panel */}
        <div ref={listRef} className="w-full md:w-[420px] lg:w-[460px] shrink-0 bg-bg-base overflow-y-auto border-l border-border">
          <div className="sticky top-0 z-10 bg-bg-base border-b border-border px-4 pt-3 pb-2.5">
            {/* Title + count */}
            <div className="flex items-baseline justify-between mb-2">
              <h1 className="font-display text-md text-text-primary">Kliniker</h1>
              <span className="text-[11px] text-text-tertiary">
                {filtered.length === clinics.length ? `${clinics.length} st` : `${filtered.length} av ${clinics.length}`}
              </span>
            </div>

            {/* Treatment chips — the key UX addition */}
            <div className="flex gap-1.5 mb-2.5 overflow-x-auto scrollbar-hide pb-0.5" style={{ scrollbarWidth: "none" }}>
              {TREATMENT_CHIPS.map((t) => (
                <button
                  key={t.code}
                  onClick={() => {
                    setTreatment(treatment === t.code ? null : t.code);
                    if (sort === "name" && treatment !== t.code) setSort("cheapest");
                  }}
                  className={cn(
                    "whitespace-nowrap px-3 py-[5px] rounded-full text-[11px] font-medium border transition-all shrink-0",
                    treatment === t.code
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-bg-elevated text-text-secondary hover:border-border-strong hover:text-text-primary"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-[13px] h-[13px] text-text-tertiary pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Sök klinik, adress, postnr..."
                className="w-full pl-8 pr-7 py-[6px] bg-bg-elevated border border-border rounded text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-focus transition-colors"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Area + sort dropdowns */}
            <div className="flex items-center gap-1">
              <Dropdown id="area" open={openDrop === "area"} onToggle={() => setOpenDrop(openDrop === "area" ? null : "area")} label={area || "Stadsdel"} active={!!area}>
                <DropItem active={!area} onClick={() => { setArea(null); setOpenDrop(null); }}>Alla</DropItem>
                {AREAS.map((a) => <DropItem key={a} active={area === a} onClick={() => { setArea(a); setOpenDrop(null); }}>{a}</DropItem>)}
              </Dropdown>
              <Dropdown id="sort" open={openDrop === "sort"} onToggle={() => setOpenDrop(openDrop === "sort" ? null : "sort")} label={SORT_LABELS[sort]} active={sort !== "name"}>
                {(Object.keys(SORT_LABELS) as SortMode[]).map((s) => <DropItem key={s} active={sort === s} onClick={() => { setSort(s); setOpenDrop(null); }}>{SORT_LABELS[s]}</DropItem>)}
              </Dropdown>
              {(area || sort !== "name") && (
                <button onClick={() => { setArea(null); setSort("name"); }} className="text-[10px] text-text-tertiary hover:text-accent ml-0.5">Rensa</button>
              )}
            </div>
          </div>

          {/* Compare bar */}
          {compareSet.size > 0 && (
            <div className="sticky top-[140px] z-10 bg-accent text-white px-4 py-2 flex items-center justify-between text-xs">
              <span>{compareSet.size} valda</span>
              <div className="flex gap-2">
                <button onClick={() => setCompareSet(new Set())} className="opacity-70 hover:opacity-100">Rensa</button>
                <button onClick={() => setShowCompare(true)} className="bg-white text-accent font-semibold px-2.5 py-0.5 rounded text-[11px]">Jämför</button>
              </div>
            </div>
          )}

          {/* Clinic list */}
          <div className="flex flex-col">
            {visible.map((clinic) => (
              <ClinicRow
                key={clinic.id}
                clinic={clinic}
                expanded={expandedId === clinic.id}
                onToggle={() => handleCardClick(clinic)}
                comparing={compareSet.has(clinic.id)}
                onCompareToggle={() => toggleCompare(clinic.id)}
                onProfile={() => navigate(`/clinic/${clinic.id}`)}
                hovered={hoveredId === clinic.id}
                onHover={(h) => setHoveredId(h ? clinic.id : null)}
                treatment={treatment}
                treatmentRef={selectedRef}
              />
            ))}
            {visible.length === 0 && <div className="py-16 text-center text-text-tertiary text-xs">Inga kliniker matchar.</div>}
            {visibleCount < sorted.length && <div ref={sentinelRef} className="h-4" />}
          </div>
        </div>
      </div>

      {showCompare && <CompareModal clinicIds={[...compareSet]} onClose={() => setShowCompare(false)} />}
    </div>
  );
}

/* ── Dropdown ─────────────────────────────────────────────────────── */

function Dropdown({ id, open, onToggle, label, active, children }: {
  id: string; open: boolean; onToggle: () => void; label: string; active: boolean; children: React.ReactNode;
}) {
  return (
    <div className="relative" data-dropdown>
      <button onClick={onToggle} className={cn(
        "flex items-center gap-0.5 px-2 py-[4px] rounded-full text-[11px] border transition-colors",
        active ? "border-accent bg-accent-soft text-accent font-medium" : "border-border bg-bg-elevated text-text-secondary hover:border-border-strong"
      )}>
        {label}<ChevronDown className={cn("w-2.5 h-2.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-30 bg-bg-elevated border border-border rounded shadow-lg py-0.5 min-w-[160px] max-h-[240px] overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
}

function DropItem({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("w-full text-left px-2.5 py-[5px] text-[11px] hover:bg-bg-sunken", active && "font-semibold text-accent")}>
      {children}
    </button>
  );
}

/* ── Clinic Row ───────────────────────────────────────────────────── */

function ClinicRow({ clinic, expanded, onToggle, comparing, onCompareToggle, onProfile, hovered, onHover, treatment, treatmentRef }: {
  clinic: RealClinic; expanded: boolean; onToggle: () => void; comparing: boolean;
  onCompareToggle: () => void; onProfile: () => void; hovered: boolean;
  onHover: (h: boolean) => void; treatment: string | null; treatmentRef: number;
}) {
  // If a treatment is selected, show its price in the collapsed row
  const treatPrice = treatment ? getClinicPrice(clinic.id, treatment) : null;
  const treatDiff = treatPrice && treatmentRef ? Math.round(((treatPrice - treatmentRef) / treatmentRef) * 100) : null;

  return (
    <div
      id={`clinic-${clinic.id}`}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={cn(
        "border-b border-border transition-colors duration-100",
        expanded ? "bg-bg-elevated" : hovered ? "bg-bg-sunken/50" : "",
        comparing && "bg-accent-soft"
      )}
    >
      <button onClick={onToggle} className="w-full text-left px-4 py-2.5 flex items-center gap-2.5">
        {/* Compare dot */}
        <div
          onClick={(e) => { e.stopPropagation(); onCompareToggle(); }}
          className={cn(
            "w-[14px] h-[14px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 cursor-pointer transition-colors",
            comparing ? "border-accent bg-accent" : "border-border-strong hover:border-accent"
          )}
        >
          {comparing && <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[12px] text-text-primary truncate leading-tight">{clinic.name}</div>
          <div className="text-[10px] text-text-tertiary truncate leading-tight mt-px">{clinic.area} · {clinic.address}</div>
        </div>

        {/* Price or bar */}
        {treatment && treatPrice ? (
          <div className="shrink-0 text-right">
            <div className="text-[13px] font-semibold text-text-primary tabular-nums leading-tight">
              {treatPrice.toLocaleString("sv-SE")} kr
            </div>
            {treatDiff !== null && (
              <div className={cn(
                "text-[9px] tabular-nums leading-tight",
                treatDiff < -10 ? "text-positive" : treatDiff > 10 ? "text-warning" : "text-text-tertiary"
              )}>
                {treatDiff === 0 ? "= ref" : `${treatDiff > 0 ? "+" : ""}${treatDiff}% vs ref`}
              </div>
            )}
          </div>
        ) : treatment && !treatPrice ? (
          <span className="text-[10px] text-text-tertiary italic shrink-0">–</span>
        ) : (
          <div className="w-[40px] shrink-0">
            <div className="w-full h-[3px] bg-bg-sunken rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{
                width: `${Math.max(5, Math.min(95, ((clinic.priceLevelPct ?? 0) + 55) / 110 * 100))}%`,
                backgroundColor: overallDotColor(clinic.priceLevelPct)
              }} />
            </div>
          </div>
        )}

        <ChevronDown className={cn("w-3 h-3 text-text-tertiary shrink-0 transition-transform duration-150", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="px-4 pb-3">
          {/* Contact */}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 pb-2 text-[10px] text-text-secondary">
            {clinic.phone && <span className="flex items-center gap-0.5"><Phone className="w-[9px] h-[9px] text-text-tertiary" />{clinic.phone}</span>}
            <span className="flex items-center gap-0.5"><MapPin className="w-[9px] h-[9px] text-text-tertiary" />{clinic.address}, {clinic.postalCode}</span>
            {clinic.website && <a href={clinic.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-0.5 text-accent hover:underline"><Globe className="w-[9px] h-[9px]" />Webb</a>}
          </div>

          {/* Grouped prices with reference */}
          <div className="space-y-2">
            {TREATMENT_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-[9px] font-semibold text-text-tertiary uppercase tracking-[0.08em] mb-0.5">{group.label}</p>
                {group.codes.map((code) => {
                  const t = FEATURED_TREATMENTS.find((ft) => ft.code === code);
                  if (!t) return null;
                  const cp = prices[clinic.id]?.[code]?.[0];
                  const rp = prices[clinic.id]?.[code]?.[1] ?? 0;
                  const isHl = treatment === code;
                  return (
                    <div key={code} className={cn("flex items-baseline justify-between py-[2px]", isHl && "bg-accent-soft -mx-1.5 px-1.5 rounded")}>
                      <span className="text-[11px] text-text-secondary">{t.label}</span>
                      {cp != null ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-[11px] font-semibold text-text-primary tabular-nums">{cp.toLocaleString("sv-SE")} kr</span>
                          <span className="text-[9px] text-text-tertiary tabular-nums">ref {rp.toLocaleString("sv-SE")}</span>
                        </div>
                      ) : <span className="text-[10px] text-text-tertiary italic">–</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <button onClick={(e) => { e.stopPropagation(); onProfile(); }}
            className="mt-2 w-full text-[11px] font-medium text-accent border border-accent rounded py-1 hover:bg-accent-soft transition-colors">
            Visa klinikprofil
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Compare Modal ────────────────────────────────────────────────── */

function CompareModal({ clinicIds, onClose }: { clinicIds: string[]; onClose: () => void }) {
  const selected = clinicIds.map((id) => clinics.find((c) => c.id === id)).filter(Boolean) as RealClinic[];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const cols = `120px repeat(${selected.length}, 1fr)`;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-elevated rounded-xl shadow-xl w-full max-w-[600px] max-h-[80vh] overflow-y-auto mx-4">
        <div className="sticky top-0 bg-bg-elevated z-10 px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-md text-text-primary">Jämförelse</h2>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary p-1"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-4 py-3">
          <div className="grid gap-0" style={{ gridTemplateColumns: cols }}>
            <div />
            {selected.map((c) => (
              <div key={c.id} className="text-center px-1 pb-2">
                <div className="text-[10px] font-semibold text-text-primary truncate">{c.name}</div>
                <div className="text-[9px] text-text-tertiary">{c.area}</div>
              </div>
            ))}
          </div>
          {TREATMENT_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="grid bg-bg-sunken -mx-4 px-4 py-0.5 mt-1" style={{ gridTemplateColumns: cols }}>
                <div className="text-[9px] font-semibold text-text-tertiary uppercase tracking-[0.06em]">{group.label}</div>
              </div>
              {group.codes.map((code) => {
                const t = FEATURED_TREATMENTS.find((ft) => ft.code === code);
                if (!t) return null;
                const ref = getRefPrice(code);
                return (
                  <div key={code} className="grid items-center border-b border-border py-[4px]" style={{ gridTemplateColumns: cols }}>
                    <div className="text-[10px] text-text-secondary pr-1">{t.label}</div>
                    {selected.map((c) => {
                      const p = getClinicPrice(c.id, code);
                      if (p === null) return <div key={c.id} className="text-center text-[10px] text-text-tertiary">–</div>;
                      const diff = ref ? Math.round(((p - ref) / ref) * 100) : 0;
                      return (
                        <div key={c.id} className="text-center">
                          <span className="text-[10px] font-semibold text-text-primary tabular-nums">{p.toLocaleString("sv-SE")}</span>
                          {diff !== 0 && <span className={cn("text-[8px] ml-0.5 tabular-nums", diff < 0 ? "text-positive" : "text-warning")}>{diff > 0 ? "+" : ""}{diff}%</span>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
          <div className="grid items-center border-t-2 border-border-strong py-2 mt-1" style={{ gridTemplateColumns: cols }}>
            <div className="text-[10px] font-medium text-text-tertiary">Totalt vs ref</div>
            {selected.map((c) => (
              <div key={c.id} className="text-center text-[10px] font-semibold">
                <span className={cn(c.priceLevelPct != null && c.priceLevelPct < 0 ? "text-positive" : c.priceLevelPct != null && c.priceLevelPct > 0 ? "text-warning" : "text-text-tertiary")}>
                  {c.priceLevelPct != null ? `${c.priceLevelPct > 0 ? "+" : ""}${c.priceLevelPct}%` : "–"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
