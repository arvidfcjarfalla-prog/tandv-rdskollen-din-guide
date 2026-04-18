import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { searchTreatments, type TlvTreatment } from "@/lib/tlv-treatments";

interface Props {
  selected: TlvTreatment[];
  onSelect: (treatment: TlvTreatment) => void;
  onRemove: (code: string) => void;
  freeText: string;
  onFreeTextChange: (text: string) => void;
  error?: string;
}

export function TreatmentAutocomplete({ selected, onSelect, onRemove, freeText, onFreeTextChange, error }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TlvTreatment[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const r = searchTreatments(query);
    // Filter out already selected
    setResults(r.filter((t) => !selected.some((s) => s.code === t.code)));
    setActiveIdx(-1);
  }, [query, selected]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (t: TlvTreatment) => {
    onSelect(t);
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && activeIdx >= 0) { e.preventDefault(); handleSelect(results[activeIdx]); }
    else if (e.key === "Escape") { setOpen(false); }
  };

  const formatPrice = (p: number | null) => (p != null ? `${p.toLocaleString("sv-SE")} kr` : "–");

  return (
    <div className="space-y-3">
      {/* Selected treatments */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((t) => (
            <div key={t.code} className="flex items-center gap-1.5 bg-accent-soft border border-accent rounded-full pl-3 pr-1.5 py-1">
              <span className="text-xs font-medium text-accent">
                {t.name.length > 40 ? t.name.slice(0, 40) + "…" : t.name}
              </span>
              <button
                onClick={() => onRemove(t.code)}
                className="w-5 h-5 rounded-full bg-accent/10 hover:bg-accent/20 flex items-center justify-center transition-colors"
                aria-label={`Ta bort ${t.name}`}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-accent" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      <div ref={wrapperRef} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { if (query.length >= 2) setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="Sök behandling, t.ex. rotfyllning, krona, implantat..."
          className={cn(
            "w-full p-[10px_14px] border-[1.5px] rounded-md text-sm focus:outline-none transition-all",
            error ? "border-danger" : "border-border focus:border-border-focus focus:shadow-[0_0_0_3px] focus:shadow-accent-soft"
          )}
          aria-label="Sök behandling"
          autoComplete="off"
        />

        {/* Dropdown */}
        {open && results.length > 0 && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-bg-elevated border border-border rounded-lg shadow-lg max-h-[280px] overflow-y-auto">
            {results.map((t, i) => (
              <button
                key={t.code}
                onClick={() => handleSelect(t)}
                onMouseEnter={() => setActiveIdx(i)}
                className={cn(
                  "w-full text-left px-3 py-2.5 transition-colors border-b border-border/50 last:border-0",
                  i === activeIdx ? "bg-accent-soft" : "hover:bg-bg-sunken"
                )}
              >
                <p className="text-sm text-text-primary">{t.name}</p>
                <p className="text-[11px] text-text-secondary mt-0.5">{t.category}</p>
              </button>
            ))}
          </div>
        )}

        {open && query.length >= 2 && results.length === 0 && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-bg-elevated border border-border rounded-lg shadow-lg p-4 text-center">
            <p className="text-sm text-text-secondary">Ingen behandling hittades för "{query}"</p>
            <p className="text-xs text-text-tertiary mt-1">Beskriv behandlingen i fritextfältet nedan</p>
          </div>
        )}
      </div>

      {error && <p className="text-danger text-xs">{error}</p>}

      {/* Free text complement */}
      <div>
        <label className="block text-[11px] font-semibold text-text-secondary tracking-[0.06em] mb-1.5 uppercase">
          Kompletterande beskrivning (valfritt)
        </label>
        <textarea
          value={freeText}
          onChange={(e) => onFreeTextChange(e.target.value)}
          placeholder="Beskriv ytterligare detaljer, t.ex. 'Jag har fått förslag om två kronor på 6:orna'..."
          rows={2}
          className="w-full p-[10px_14px] border-[1.5px] border-border rounded-md text-sm focus:outline-none transition-all focus:border-border-focus focus:shadow-[0_0_0_3px] focus:shadow-accent-soft"
        />
      </div>
    </div>
  );
}
