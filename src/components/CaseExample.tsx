import { useEffect, useRef, useState, useCallback } from "react";

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function CaseExample() {
  const [isVisible, setIsVisible] = useState(false);
  const [clinics, setClinics] = useState(0);
  const [saved, setSaved] = useState(0);
  const [hours, setHours] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.4 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const animateCount = useCallback(
    (target: number, duration: number, setter: (v: number) => void) => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        setter(Math.round(target * easeOutCubic(p)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
    []
  );

  useEffect(() => {
    if (!isVisible || animatedRef.current) return;
    animatedRef.current = true;
    animateCount(3, 800, setClinics);
    animateCount(1800, 1200, setSaved);
    animateCount(4, 900, setHours);
  }, [isVisible, animateCount]);

  return (
    <section ref={sectionRef} id="case" className="py-16 px-6">
      <div
        className="max-w-content mx-auto bg-bg-elevated border border-border rounded-lg p-10 flex flex-col sm:flex-row items-center gap-10"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <div className="flex-1">
          <p className="font-display text-lg italic leading-[1.4] mb-4">
            "Jag hade tandvärk och ingen aning om vad det skulle kosta. Fick tre offerter på en eftermiddag."
          </p>
          <p className="text-sm text-text-secondary leading-[1.5]">
            Anna, 34, Södermalm. Jämförde 3 kliniker för en akutundersökning med röntgen. Valde den närmaste kliniken med lägst pris och fick tid redan dagen efter.
          </p>
        </div>

        <div className="flex sm:flex-col gap-6 sm:gap-4 shrink-0">
          <div className="text-center min-w-[100px]">
            <div className="font-display text-2xl text-accent leading-none">{clinics}</div>
            <div className="text-[11px] text-text-tertiary mt-1">Offerter</div>
          </div>
          <div className="text-center min-w-[100px]">
            <div className="font-display text-2xl text-accent leading-none">
              {saved.toLocaleString("sv-SE")} kr
            </div>
            <div className="text-[11px] text-text-tertiary mt-1">Sparade</div>
          </div>
          <div className="text-center min-w-[100px]">
            <div className="font-display text-2xl text-accent leading-none">{hours}h</div>
            <div className="text-[11px] text-text-tertiary mt-1">Till bokad tid</div>
          </div>
        </div>
      </div>
    </section>
  );
}
