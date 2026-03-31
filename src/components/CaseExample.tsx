import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function CaseExample() {
  const [clinics, setClinics] = useState(0);
  const [saved, setSaved] = useState(0);
  const [hours, setHours] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

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

  const startCounters = () => {
    if (hasAnimated) return;
    setHasAnimated(true);
    animateCount(3, 800, setClinics);
    animateCount(1800, 1200, setSaved);
    animateCount(4, 900, setHours);
  };

  return (
    <section id="case" className="py-16 px-6">
      <motion.div
        className="max-w-content mx-auto bg-bg-elevated border border-border rounded-lg p-10 flex flex-col sm:flex-row items-center gap-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        onViewportEnter={startCounters}
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
      </motion.div>
    </section>
  );
}
