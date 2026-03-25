import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

const TOTAL_SCENES = 5;

export function ProductDemo() {
  const [active, setActive] = useState(-1);
  const [exiting, setExiting] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervals = useRef<ReturnType<typeof setInterval>[]>([]);
  const activeRef = useRef(-1);

  /* ── Scene 0: Postal ── */
  const [typed, setTyped] = useState("");
  const [inputFocus, setInputFocus] = useState(false);
  const [btnPress, setBtnPress] = useState(false);

  /* ── Scene 1: Track ── */
  const [trackPicked, setTrackPicked] = useState(false);

  /* ── Scene 2: Symptom ── */
  const [symText, setSymText] = useState("");
  const [symFocus, setSymFocus] = useState(false);
  const [painW, setPainW] = useState(0);
  const [painN, setPainN] = useState(0);
  const [flagOn, setFlagOn] = useState(false);
  const [triageOn, setTriageOn] = useState(false);

  /* ── Scene 3: Offers ── */
  const [shown, setShown] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);

  /* ── Scene 4: Confirm ── */
  const [checkOn, setCheckOn] = useState(false);
  const [detailOn, setDetailOn] = useState(false);

  /* ── Step indicator ── */
  const [step, setStep] = useState(0);

  /* ── Hint text fade ── */
  const [hintVisible, setHintVisible] = useState(false);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  }, []);

  const clearAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    intervals.current.forEach(clearInterval);
    intervals.current = [];
  }, []);

  const reset = useCallback(() => {
    clearAll();
    setTyped("");
    setInputFocus(false);
    setBtnPress(false);
    setTrackPicked(false);
    setSymText("");
    setSymFocus(false);
    setPainW(0);
    setPainN(0);
    setFlagOn(false);
    setTriageOn(false);
    setShown([]);
    setPicked(null);
    setCheckOn(false);
    setDetailOn(false);
    setHintVisible(false);
  }, [clearAll]);

  const show = useCallback((idx: number) => {
    setExiting(activeRef.current >= 0 ? activeRef.current : null);
    setActive(idx);
    activeRef.current = idx;
    setStep(Math.min(idx, 3));
    setHintVisible(false);
    setTimeout(() => setExiting(null), 650);
    setTimeout(() => setHintVisible(true), 700);
  }, []);

  const run = useCallback(
    (scene: number) => {
      const next = (n: number) => {
        if (n === 0) reset();
        show(n);
        run(n);
      };

      if (scene === 0) {
        const chars = "114 32";
        let ci = 0;
        schedule(() => setInputFocus(true), 800);
        const iv = setInterval(() => {
          if (ci < chars.length) {
            ci++;
            setTyped(chars.substring(0, ci));
          } else {
            clearInterval(iv);
            schedule(() => {
              setInputFocus(false);
              setBtnPress(true);
              schedule(() => {
                setBtnPress(false);
                schedule(() => next(1), 600);
              }, 250);
            }, 900);
          }
        }, 180);
        intervals.current.push(iv);
      }

      if (scene === 1) {
        schedule(() => {
          setTrackPicked(true);
          schedule(() => next(2), 2800);
        }, 1200);
      }

      if (scene === 2) {
        const sym = "Värk i en kindtand sedan igår, känslig mot kallt och varmt...";
        let si = 0;
        schedule(() => {
          setSymFocus(true);
          const iv = setInterval(() => {
            if (si < sym.length) {
              si++;
              setSymText(sym.substring(0, si));
            } else {
              clearInterval(iv);
              setSymFocus(false);
              schedule(() => {
                setPainW(60);
                setPainN(6);
                schedule(() => {
                  setFlagOn(true);
                  schedule(() => {
                    setTriageOn(true);
                    schedule(() => next(3), 2800);
                  }, 800);
                }, 1000);
              }, 800);
            }
          }, 40);
          intervals.current.push(iv);
        }, 600);
      }

      if (scene === 3) {
        schedule(() => setShown([0]), 600);
        schedule(() => setShown([0, 1]), 1400);
        schedule(() => setShown([0, 1, 2]), 2200);
        schedule(() => {
          setPicked(0);
          schedule(() => next(4), 3000);
        }, 3400);
      }

      if (scene === 4) {
        schedule(() => {
          setCheckOn(true);
          schedule(() => {
            setDetailOn(true);
            schedule(() => next(0), 5500);
          }, 700);
        }, 500);
      }
    },
    [schedule, reset, show]
  );

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    show(0);
    run(0);
    return () => clearAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  const jump = (idx: number) => { reset(); show(idx); run(idx); };

  /* ── Style helpers ── */
  const scn = (i: number) => cn(
    "absolute inset-0 flex flex-col",
    "pointer-events-none",
    active === i && "opacity-100 translate-x-0 pointer-events-auto",
    exiting === i && "opacity-0 -translate-x-10",
    active !== i && exiting !== i && "opacity-0 translate-x-10"
  );

  /* Scene transition CSS is on the wrapper via inline style for exact match */
  const scnStyle: React.CSSProperties = {
    transition: "opacity 0.55s ease, transform 0.55s ease",
  };

  const dot = (i: number) => cn(
    "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border-[1.5px] transition-all duration-[400ms]",
    i < step && "border-accent bg-accent-soft text-accent",
    i === step && "border-accent bg-accent text-white",
    i > step && "border-border text-text-tertiary bg-bg-base"
  );

  const Cursor = ({ on }: { on: boolean }) => (
    <span className={cn(
      "inline-block w-[2px] h-4 bg-accent align-text-bottom ml-px",
      on ? "animate-blink" : "opacity-0 w-0"
    )} />
  );

  return (
    <section ref={sectionRef} id="demo" className="px-6 pb-24">
      <div className="max-w-[860px] mx-auto text-center">
        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-[0.12em] mb-6">
          Se hur det fungerar
        </p>

        <div className="bg-bg-elevated border border-border rounded-xl overflow-hidden"
          style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.03)" }}>

          {/* Title bar */}
          <div className="flex items-center gap-2 px-[18px] py-3 bg-bg-sunken border-b border-border">
            <div className="flex gap-[6px]">
              <span className="w-[10px] h-[10px] rounded-full bg-[#FF605C]" />
              <span className="w-[10px] h-[10px] rounded-full bg-[#FFBD44]" />
              <span className="w-[10px] h-[10px] rounded-full bg-[#00CA4E]" />
            </div>
            <span className="flex-1 text-center text-[11px] font-mono text-text-tertiary bg-bg-elevated rounded-sm py-[5px] px-4 mx-8">
              tandskadekollen.se
            </span>
          </div>

          {/* Viewport */}
          <div className="h-[480px] relative overflow-hidden bg-bg-base">
            {/* Mini nav */}
            <div className="flex items-center justify-between px-5 py-[10px] border-b border-border bg-bg-elevated shrink-0">
              <span className="font-bold text-[13px] text-text-primary">Tandkollen</span>
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center">
                    <div className={dot(i)}>{i < step ? "✓" : i + 1}</div>
                    {i < 3 && <div className={cn("w-4 h-[1.5px] transition-colors duration-[400ms]", i < step ? "bg-accent" : "bg-border")} />}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden" style={{ height: "calc(100% - 44px)" }}>

              {/* Scene 0 */}
              <div className={scn(0)} style={scnStyle}>
                <div className="flex-1 flex flex-col items-center justify-center px-8 pb-3">
                  <p className="font-display text-[22px] mb-1">Ange ditt postnummer</p>
                  <p className="text-[13px] text-text-secondary mb-5">Vi visar kliniker nära dig.</p>
                  <div className="flex gap-2 max-w-[320px] w-full">
                    <div className={cn(
                      "flex-1 py-3 px-4 border-[1.5px] rounded-md bg-bg-elevated font-mono text-[15px] text-text-primary text-center tracking-[0.1em]",
                      "transition-[border-color,box-shadow] duration-200",
                      inputFocus ? "border-accent shadow-[0_0_0_3px_rgba(42,90,63,0.08)]" : "border-border"
                    )}>
                      {typed}<Cursor on={inputFocus || typed.length === 0} />
                    </div>
                    <div className={cn(
                      "py-3 px-5 rounded-md bg-accent text-white text-[13px] font-semibold whitespace-nowrap select-none",
                      "transition-[transform,background] duration-[120ms]",
                      btnPress && "scale-95 bg-accent-hover"
                    )}>Fortsätt</div>
                  </div>
                  <span className={cn(
                    "text-[11px] text-text-tertiary italic mt-4",
                    "transition-opacity duration-[400ms]",
                    active === 0 && hintVisible ? "opacity-100" : "opacity-0"
                  )} style={{ transitionDelay: active === 0 && hintVisible ? "0.6s" : "0s" }}>
                    Gratis. Inga förpliktelser.
                  </span>
                </div>
              </div>

              {/* Scene 1 */}
              <div className={scn(1)} style={scnStyle}>
                <div className="flex-1 flex flex-col px-8 pt-7 pb-3">
                <p className="font-display text-[22px] mb-1 text-left">Vad behöver du hjälp med?</p>
                <p className="text-[13px] text-text-secondary mb-5 text-left">Postnummer: <strong>114 32</strong></p>
                <div className="flex gap-[10px]">
                  <div className={cn(
                    "flex-1 p-4 border-2 rounded-md text-left transition-all duration-[350ms] ease-[ease]",
                    trackPicked ? "border-accent bg-accent-soft" : "border-border"
                  )}>
                    <div className={cn("w-7 h-7 rounded-sm flex items-center justify-center text-[11px] font-bold text-accent mb-2", trackPicked ? "bg-accent-medium" : "bg-bg-sunken")}>U</div>
                    <p className="text-[13px] font-semibold mb-[2px]">Jag behöver undersökas</p>
                    <p className="text-[11px] text-text-secondary leading-[1.3]">Undersökning, diagnos, behandling</p>
                  </div>
                  <div className="flex-1 p-4 border-2 border-border rounded-md text-left">
                    <div className="w-7 h-7 rounded-sm bg-bg-sunken flex items-center justify-center text-[11px] font-bold text-accent mb-2">B</div>
                    <p className="text-[13px] font-semibold mb-[2px]">Jag vet vad jag behöver</p>
                    <p className="text-[11px] text-text-secondary leading-[1.3]">Känd diagnos eller behandling</p>
                  </div>
                </div>
                </div>
              </div>

              {/* Scene 2 */}
              <div className={scn(2)} style={scnStyle}>
                <div className="flex-1 flex flex-col px-8 pt-7 pb-3">
                <p className="font-display text-[22px] mb-1 text-left">Beskriv vad som hänt</p>
                <p className="text-[13px] text-text-secondary mb-5 text-left">Spår: Undersökning</p>
                <div className="text-left">
                  <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.06em] mb-[6px]">Symptom</p>
                  <div className={cn(
                    "w-full p-[10px_14px] min-h-[56px] border-[1.5px] rounded-md bg-bg-elevated text-[13px] font-body text-text-primary leading-[1.5]",
                    "transition-[border-color] duration-200",
                    symFocus ? "border-accent" : "border-border"
                  )}>
                    {symText}<Cursor on={symFocus} />
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.06em] min-w-[90px]" style={{ margin: 0 }}>
                      Smärtnivå: <strong className="text-text-primary">{painN}</strong>/10
                    </p>
                    <div className="flex-1 h-1 bg-border rounded-[2px] relative overflow-visible">
                      <div className="h-full bg-accent rounded-[2px]" style={{ width: `${painW}%`, transition: "width 1.2s ease" }} />
                      <div className="absolute top-1/2 w-[14px] h-[14px] rounded-full bg-accent border-2 border-bg-elevated shadow-sm"
                        style={{ left: `${painW}%`, transform: "translate(-50%, -50%)", transition: "left 1.2s ease" }} />
                    </div>
                  </div>

                  <div className="flex gap-[6px] mt-[14px] flex-wrap">
                    {["Svullnad", "Feber", "Blödning", "Utslagen tand"].map((f, i) => (
                      <span key={f} className={cn(
                        "py-[5px] px-3 text-[11px] font-medium border-[1.5px] rounded-full transition-all duration-300",
                        i === 0 && flagOn ? "border-danger bg-danger-soft text-danger" : "border-border text-text-secondary"
                      )}>{f}</span>
                    ))}
                  </div>

                  <div className={cn(
                    "mt-[10px] py-2 px-3 bg-danger-soft rounded-sm text-[11px] font-semibold text-danger transition-[opacity,transform] duration-300",
                    triageOn ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
                  )}>Akutsymptom — din förfrågan prioriteras</div>
                </div>
                </div>
              </div>

              {/* Scene 3 */}
              <div className={scn(3)} style={scnStyle}>
                <div className="flex-1 flex flex-col px-8 pt-7 pb-3">
                <p className="font-display text-[22px] mb-[6px] text-left">Dina offerter</p>
                <div className="flex gap-4 text-[11px] text-text-secondary mb-[14px] text-left">
                  <span><strong className="text-text-primary font-semibold">3</strong> kliniker har svarat</span>
                  <span>Lägst: <strong className="text-text-primary font-semibold">3 200 kr</strong></span>
                  <span>Snabbast: <strong className="text-text-primary font-semibold">Imorgon 08:30</strong></span>
                </div>
                <div className="flex flex-col gap-2 text-left">
                  {OFFERS.map((o, i) => (
                    <div key={i} className={cn(
                      "flex justify-between items-center p-[14px_18px] border-2 rounded-md bg-bg-elevated transition-all duration-500 ease-[ease]",
                      !shown.includes(i) && "opacity-0 translate-y-[10px]",
                      shown.includes(i) && "opacity-100 translate-y-0",
                      picked === i ? "border-accent bg-accent-soft" : "border-border"
                    )}>
                      <div className="flex flex-col gap-[2px]">
                        <div className="text-[14px] font-semibold flex items-center gap-[6px]">
                          {o.name}
                          {o.badge && <span className="text-[8px] font-bold uppercase tracking-[0.06em] py-[2px] px-[6px] rounded text-accent bg-accent-soft">{o.badge}</span>}
                        </div>
                        <p className="text-[11px] text-text-secondary">{o.meta}</p>
                        <div className={cn(
                          "text-[10px] text-text-secondary overflow-hidden transition-all duration-300",
                          picked === i && o.scope ? "max-h-10 mt-1" : "max-h-0"
                        )}>{o.scope}</div>
                        {picked === i && (
                          <div className="mt-2 py-2 px-4 rounded-sm bg-accent text-white text-[11px] font-semibold inline-block">Välj {o.name}</div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-display text-[20px]">{o.price}</div>
                        <div className="text-[10px] text-text-tertiary mt-[1px]">{o.ref}</div>
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              </div>

              {/* Scene 4 */}
              <div className={scn(4)} style={scnStyle}>
                <div className="flex flex-col items-center justify-center flex-1 px-8 pt-7 pb-3">
                  <div className={cn(
                    "w-12 h-12 rounded-full bg-positive-soft border-2 border-positive flex items-center justify-center mb-4",
                    checkOn ? "opacity-100 scale-100" : "opacity-0 scale-50"
                  )} style={{
                    transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}>
                    <div className="border-positive" style={{
                      width: 10, height: 16,
                      borderStyle: "solid",
                      borderWidth: "0 2.5px 2.5px 0",
                      transform: "rotate(45deg) translateY(-2px)",
                    }} />
                  </div>
                  <p className="font-display text-[22px] text-center">Du har valt Citysmile</p>
                  <p className="text-[13px] text-text-secondary text-center">Kliniken kontaktar dig inom 2 timmar</p>
                  <div className={cn(
                    "bg-bg-elevated border border-border rounded-md p-[14px_20px] mt-[14px] text-left w-full max-w-[340px]",
                    detailOn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  )} style={{ transition: "all 0.5s ease 0.4s" }}>
                    {CONFIRM_ROWS.map(([label, val], i) => (
                      <div key={label} className={cn("flex justify-between py-1 text-[12px]", i > 0 && "border-t border-border pt-[6px] mt-[2px]")}>
                        <span className="text-text-secondary">{label}</span>
                        <span className="font-semibold">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Progress: arrows + dots */}
          <div className="flex justify-center items-center gap-3 py-3 border-t border-border bg-bg-elevated">
            <button
              onClick={() => jump((active - 1 + TOTAL_SCENES) % TOTAL_SCENES)}
              className="w-8 h-8 rounded-full border border-border bg-bg-elevated flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-strong transition-all cursor-pointer"
            >
              <span className="text-sm">←</span>
            </button>
            <div className="flex gap-2">
              {Array.from({ length: TOTAL_SCENES }).map((_, i) => (
                <button key={i} onClick={() => jump(i)} className={cn(
                  "w-2 h-2 rounded-full cursor-pointer transition-colors duration-300",
                  active === i ? "bg-accent" : "bg-border hover:bg-border-strong"
                )} />
              ))}
            </div>
            <button
              onClick={() => jump((active + 1) % TOTAL_SCENES)}
              className="w-8 h-8 rounded-full border border-border bg-bg-elevated flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-strong transition-all cursor-pointer"
            >
              <span className="text-sm">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Static data ── */
const OFFERS = [
  { name: "Citysmile", badge: "Lägst pris", meta: "Södermalm, 0.8 km · Imorgon 08:30, 15:00", price: "3 200 kr", ref: "ref: 3 600 kr", scope: "Undersökning, röntgen (2 bilder), akut bedömning" },
  { name: "Östermalms Tandvård", badge: null, meta: "Östermalm, 4.5 km · Om 1 dag 10:00", price: "3 800 kr", ref: "ref: 3 600 kr", scope: "" },
  { name: "Nordtand", badge: null, meta: "Vasastan, 2.1 km · Om 3 dagar", price: "4 100 kr", ref: "ref: 3 600 kr", scope: "" },
] as const;

const CONFIRM_ROWS = [
  ["Offertpris", "3 200 kr"],
  ["Tid", "Imorgon 08:30"],
  ["Plats", "Södermalm, 0.8 km"],
] as const;
