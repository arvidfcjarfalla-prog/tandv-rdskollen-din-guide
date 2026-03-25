import { cn } from "@/lib/utils";

/**
 * Anatomically-styled interactive tooth selector.
 * FDI notation (ISO 3950) with realistic SVG tooth shapes and gum line.
 *
 *   Upper:  18 17 16 15 14 13 12 11 | 21 22 23 24 25 26 27 28
 *   Lower:  48 47 46 45 44 43 42 41 | 31 32 33 34 35 36 37 38
 */

interface ToothSelectorProps {
  selected: string[];
  onToggle: (tooth: string) => void;
  disabled?: boolean;
}

/* ── Tooth geometry ───────────────────────────────────────────────── */

/** Each tooth: FDI number, x-offset, width, and SVG crown path (relative to tooth origin) */
interface ToothDef {
  fdi: string;
  x: number;
  w: number;
  crown: string;  // SVG path for crown (occlusal view)
  root: string;   // SVG path for root
}

// Tooth position index (1=central incisor → 8=wisdom tooth)
function pos(fdi: string): number { return parseInt(fdi[1]); }

function toothLabel(fdi: string): string {
  const names: Record<number, string> = {
    1: "Mittincisiv", 2: "Lateralincisiv", 3: "Hörntand",
    4: "Premolar 1", 5: "Premolar 2",
    6: "Molar 1", 7: "Molar 2", 8: "Visdomstand",
  };
  const q = parseInt(fdi[0]);
  const jaw = q <= 2 ? "överkäke" : "underkäke";
  const side = q === 1 || q === 4 ? "hö" : "vä";
  return `${names[pos(fdi)]} ${jaw} ${side} (${fdi})`;
}

/**
 * Generate anatomical crown and root paths for a tooth.
 * All coordinates relative to (0, 0) at top-left of tooth bounding box.
 */
function makeToothPaths(p: number, w: number, h: number, isUpper: boolean) {
  const crownH = h * 0.6;
  const rootH = h * 0.4;

  // Crown shapes vary by tooth type
  let crown: string;
  let root: string;

  if (p >= 6) {
    // Molar — wide, flat top with bumps
    const cy = isUpper ? rootH : 0;
    const b1 = w * 0.25, b2 = w * 0.5, b3 = w * 0.75;
    crown = isUpper
      ? `M2,${cy + crownH} C2,${cy + crownH * 0.3} ${w * 0.15},${cy} ${b1},${cy + 2} C${b1 + 2},${cy - 1} ${b2 - 2},${cy - 1} ${b2},${cy + 3} C${b2 + 2},${cy - 1} ${b3 - 2},${cy - 1} ${b3},${cy + 2} C${w * 0.85},${cy} ${w - 2},${cy + crownH * 0.3} ${w - 2},${cy + crownH} Z`
      : `M2,${cy} C2,${cy + crownH * 0.7} ${w * 0.15},${cy + crownH} ${b1},${cy + crownH - 2} C${b1 + 2},${cy + crownH + 1} ${b2 - 2},${cy + crownH + 1} ${b2},${cy + crownH - 3} C${b2 + 2},${cy + crownH + 1} ${b3 - 2},${cy + crownH + 1} ${b3},${cy + crownH - 2} C${w * 0.85},${cy + crownH} ${w - 2},${cy + crownH * 0.7} ${w - 2},${cy} Z`;

    // Two roots for molars
    const ry = isUpper ? 0 : crownH;
    const rEnd = isUpper ? rootH : crownH + rootH;
    const r1x = w * 0.3, r2x = w * 0.7;
    root = isUpper
      ? `M${r1x - 4},${rootH} Q${r1x - 5},${rootH * 0.3} ${r1x},2 Q${r1x + 5},${rootH * 0.3} ${r1x + 4},${rootH} M${r2x - 4},${rootH} Q${r2x - 5},${rootH * 0.3} ${r2x},3 Q${r2x + 5},${rootH * 0.3} ${r2x + 4},${rootH}`
      : `M${r1x - 4},${crownH} Q${r1x - 5},${rEnd - rootH * 0.3} ${r1x},${rEnd - 2} Q${r1x + 5},${rEnd - rootH * 0.3} ${r1x + 4},${crownH} M${r2x - 4},${crownH} Q${r2x - 5},${rEnd - rootH * 0.3} ${r2x},${rEnd - 3} Q${r2x + 5},${rEnd - rootH * 0.3} ${r2x + 4},${crownH}`;
  } else if (p >= 4) {
    // Premolar — medium width, two slight bumps
    const cy = isUpper ? rootH : 0;
    const b1 = w * 0.35, b2 = w * 0.65;
    crown = isUpper
      ? `M3,${cy + crownH} C3,${cy + crownH * 0.25} ${w * 0.2},${cy} ${b1},${cy + 2} C${w * 0.5},${cy - 1} ${w * 0.5},${cy - 1} ${b2},${cy + 2} C${w * 0.8},${cy} ${w - 3},${cy + crownH * 0.25} ${w - 3},${cy + crownH} Z`
      : `M3,${cy} C3,${cy + crownH * 0.75} ${w * 0.2},${cy + crownH} ${b1},${cy + crownH - 2} C${w * 0.5},${cy + crownH + 1} ${w * 0.5},${cy + crownH + 1} ${b2},${cy + crownH - 2} C${w * 0.8},${cy + crownH} ${w - 3},${cy + crownH * 0.75} ${w - 3},${cy} Z`;

    const ry = isUpper ? 0 : crownH;
    const rEnd = isUpper ? rootH : crownH + rootH;
    const cx = w / 2;
    root = isUpper
      ? `M${cx - 3},${rootH} Q${cx - 4},${rootH * 0.2} ${cx},1 Q${cx + 4},${rootH * 0.2} ${cx + 3},${rootH}`
      : `M${cx - 3},${crownH} Q${cx - 4},${rEnd - rootH * 0.2} ${cx},${rEnd - 1} Q${cx + 4},${rEnd - rootH * 0.2} ${cx + 3},${crownH}`;
  } else if (p === 3) {
    // Canine — pointed
    const cy = isUpper ? rootH : 0;
    crown = isUpper
      ? `M3,${cy + crownH} C3,${cy + crownH * 0.3} ${w * 0.2},${cy + 3} ${w * 0.35},${cy + 2} L${w / 2},${cy} L${w * 0.65},${cy + 2} C${w * 0.8},${cy + 3} ${w - 3},${cy + crownH * 0.3} ${w - 3},${cy + crownH} Z`
      : `M3,${cy} C3,${cy + crownH * 0.7} ${w * 0.2},${cy + crownH - 3} ${w * 0.35},${cy + crownH - 2} L${w / 2},${cy + crownH} L${w * 0.65},${cy + crownH - 2} C${w * 0.8},${cy + crownH - 3} ${w - 3},${cy + crownH * 0.7} ${w - 3},${cy} Z`;

    const cx = w / 2;
    const rEnd = isUpper ? rootH : crownH + rootH;
    root = isUpper
      ? `M${cx - 3},${rootH} Q${cx - 5},${rootH * 0.15} ${cx},0 Q${cx + 5},${rootH * 0.15} ${cx + 3},${rootH}`
      : `M${cx - 3},${crownH} Q${cx - 5},${rEnd - rootH * 0.15} ${cx},${rEnd} Q${cx + 5},${rEnd - rootH * 0.15} ${cx + 3},${crownH}`;
  } else {
    // Incisor — narrow, shovel-shaped
    const cy = isUpper ? rootH : 0;
    crown = isUpper
      ? `M3,${cy + crownH} C3,${cy + crownH * 0.2} ${w * 0.25},${cy} ${w / 2},${cy} C${w * 0.75},${cy} ${w - 3},${cy + crownH * 0.2} ${w - 3},${cy + crownH} Z`
      : `M3,${cy} C3,${cy + crownH * 0.8} ${w * 0.25},${cy + crownH} ${w / 2},${cy + crownH} C${w * 0.75},${cy + crownH} ${w - 3},${cy + crownH * 0.8} ${w - 3},${cy} Z`;

    const cx = w / 2;
    const rEnd = isUpper ? rootH : crownH + rootH;
    root = isUpper
      ? `M${cx - 2.5},${rootH} Q${cx - 3},${rootH * 0.15} ${cx},0 Q${cx + 3},${rootH * 0.15} ${cx + 2.5},${rootH}`
      : `M${cx - 2.5},${crownH} Q${cx - 3},${rEnd - rootH * 0.15} ${cx},${rEnd} Q${cx + 3},${rEnd - rootH * 0.15} ${cx + 2.5},${crownH}`;
  }

  return { crown, root };
}

function buildRow(fdis: string[], isUpper: boolean): ToothDef[] {
  const GAP = 2;
  const result: ToothDef[] = [];
  let x = 0;

  for (const fdi of fdis) {
    const p = pos(fdi);
    const w = p >= 6 ? 28 : p >= 4 ? 22 : p === 3 ? 19 : 16;
    const h = 48;
    const { crown, root } = makeToothPaths(p, w, h, isUpper);
    result.push({ fdi, x, w, crown, root });
    x += w + GAP;
  }

  return result;
}

const UPPER_RIGHT = buildRow(["18", "17", "16", "15", "14", "13", "12", "11"], true);
const UPPER_LEFT = buildRow(["21", "22", "23", "24", "25", "26", "27", "28"], true);
const LOWER_RIGHT = buildRow(["48", "47", "46", "45", "44", "43", "42", "41"], false);
const LOWER_LEFT = buildRow(["31", "32", "33", "34", "35", "36", "37", "38"], false);

function rowWidth(teeth: ToothDef[]): number {
  const last = teeth[teeth.length - 1];
  return last.x + last.w;
}

/* ── Gum shape ────────────────────────────────────────────────────── */

function GumPath({ teeth, isUpper, totalW }: { teeth: ToothDef[]; isUpper: boolean; totalW: number }) {
  const h = 48;
  const gumDepth = 14;

  // Wavy gum line that follows the tooth roots
  let d: string;
  if (isUpper) {
    // Gum covers the root area (top)
    d = `M-4,0 L${totalW + 4},0 L${totalW + 4},${gumDepth + 4}`;
    // Scalloped bottom edge
    for (let i = teeth.length - 1; i >= 0; i--) {
      const t = teeth[i];
      const cx = t.x + t.w / 2;
      d += ` Q${t.x + t.w},${gumDepth + 8} ${cx},${gumDepth - 2} Q${t.x},${gumDepth + 8} ${Math.max(t.x - 1, -4)},${gumDepth + 4}`;
    }
    d += ` Z`;
  } else {
    // Gum covers the root area (bottom)
    const rootStart = h * 0.6;
    d = `M-4,${h + 2} L${totalW + 4},${h + 2} L${totalW + 4},${rootStart - 4}`;
    for (let i = teeth.length - 1; i >= 0; i--) {
      const t = teeth[i];
      const cx = t.x + t.w / 2;
      d += ` Q${t.x + t.w},${rootStart - 8} ${cx},${rootStart + 2} Q${t.x},${rootStart - 8} ${Math.max(t.x - 1, -4)},${rootStart - 4}`;
    }
    d += ` Z`;
  }

  return <path d={d} fill="#E8A0A0" opacity={0.35} />;
}

/* ── Single tooth ─────────────────────────────────────────────────── */

function Tooth({ def, isUpper, isSelected, onToggle }: {
  def: ToothDef; isUpper: boolean; isSelected: boolean; onToggle: () => void;
}) {
  const h = 48;
  const crownH = h * 0.6;
  const rootH = h * 0.4;
  const labelY = isUpper ? rootH + crownH / 2 + 1 : crownH / 2 + 1;

  return (
    <g
      transform={`translate(${def.x}, 0)`}
      onClick={onToggle}
      className="cursor-pointer group"
      role="button"
      aria-label={toothLabel(def.fdi)}
      aria-pressed={isSelected}
    >
      {/* Root */}
      <path
        d={def.root}
        fill="none"
        className={cn(
          "transition-all duration-150",
          isSelected ? "stroke-accent/40" : "stroke-border/60 group-hover:stroke-accent/20"
        )}
        strokeWidth={1.5}
      />

      {/* Crown */}
      <path
        d={def.crown}
        className={cn(
          "transition-all duration-150",
          isSelected
            ? "fill-accent stroke-accent"
            : "fill-[#F5F3EF] stroke-border-strong group-hover:fill-accent/8 group-hover:stroke-accent/60"
        )}
        strokeWidth={1.2}
      />

      {/* Shadow on crown for depth */}
      {!isSelected && (
        <path
          d={def.crown}
          fill="url(#toothGradient)"
          opacity={0.15}
          className="pointer-events-none"
        />
      )}

      {/* FDI number */}
      <text
        x={def.w / 2}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="central"
        className={cn(
          "text-[7px] font-mono pointer-events-none select-none transition-colors",
          isSelected ? "fill-white font-bold" : "fill-text-tertiary/70"
        )}
      >
        {def.fdi}
      </text>
    </g>
  );
}

/* ── Jaw row ──────────────────────────────────────────────────────── */

function JawRow({ teeth, isUpper, selected, onToggle }: {
  teeth: ToothDef[]; isUpper: boolean; selected: string[]; onToggle: (t: string) => void;
}) {
  const totalW = rowWidth(teeth);
  const h = 48;

  return (
    <svg viewBox={`-4 -2 ${totalW + 8} ${h + 4}`} className="w-full max-w-[280px]" style={{ height: "auto" }}>
      <defs>
        <linearGradient id="toothGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity={isUpper ? 0 : 0.3} />
          <stop offset="100%" stopColor="#000" stopOpacity={isUpper ? 0.3 : 0} />
        </linearGradient>
      </defs>
      <GumPath teeth={teeth} isUpper={isUpper} totalW={totalW} />
      {teeth.map((t) => (
        <Tooth
          key={t.fdi}
          def={t}
          isUpper={isUpper}
          isSelected={selected.includes(t.fdi)}
          onToggle={() => onToggle(t.fdi)}
        />
      ))}
    </svg>
  );
}

/* ── Main component ───────────────────────────────────────────────── */

export function ToothSelector({ selected, onToggle, disabled }: ToothSelectorProps) {
  return (
    <div className={cn("select-none", disabled && "opacity-40 pointer-events-none")}>
      {/* Upper jaw */}
      <div className="flex items-end justify-center gap-1">
        <JawRow teeth={UPPER_RIGHT} isUpper selected={selected} onToggle={onToggle} />
        <div className="w-px h-10 bg-border shrink-0 mb-1" />
        <JawRow teeth={UPPER_LEFT} isUpper selected={selected} onToggle={onToggle} />
      </div>

      {/* Labels */}
      <div className="flex justify-center gap-8 my-0.5">
        <span className="text-[8px] text-text-tertiary uppercase tracking-[0.15em]">Höger</span>
        <span className="text-[8px] text-text-tertiary uppercase tracking-[0.15em]">Vänster</span>
      </div>

      {/* Lower jaw */}
      <div className="flex items-start justify-center gap-1">
        <JawRow teeth={LOWER_RIGHT} isUpper={false} selected={selected} onToggle={onToggle} />
        <div className="w-px h-10 bg-border shrink-0 mt-1" />
        <JawRow teeth={LOWER_LEFT} isUpper={false} selected={selected} onToggle={onToggle} />
      </div>

      {/* Selected teeth */}
      {selected.length > 0 && (
        <div className="mt-3 text-center">
          <span className="text-xs text-text-secondary">
            Valda:{" "}
            {[...selected].sort().map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-0.5 mx-0.5 px-1.5 py-0.5 bg-accent text-white text-[10px] font-mono font-semibold rounded"
              >
                {t}
                <button
                  onClick={() => onToggle(t)}
                  className="hover:opacity-70 ml-0.5 text-[9px]"
                  aria-label={`Ta bort tand ${t}`}
                >
                  ×
                </button>
              </span>
            ))}
          </span>
        </div>
      )}
    </div>
  );
}
