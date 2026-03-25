import { useEffect, useRef, useState } from "react";

const STEPS = [
  {
    number: "01",
    title: "Berätta vad som hänt",
    description:
      "Ange postnummer och välj spår. Behöver du undersökning, eller vet du redan vad du behöver? Ingen registrering, inga konton.",
    details: [
      { label: "Tid", value: "Ca 2 minuter" },
      { label: "Kostnad", value: "Gratis" },
      { label: "Du behöver", value: "Postnummer" },
    ],
  },
  {
    number: "02",
    title: "Kliniker svarar med riktiga offerter",
    description:
      "Exakt pris, vad som ingår och närmaste lediga tid. Inte en generell prislista — ett faktiskt erbjudande baserat på just din situation.",
    details: [
      { label: "Svarstid", value: "Inom 24 timmar" },
      { label: "Du får", value: "Pris + tid + scope" },
      { label: "Bindande?", value: "Ja, för kliniken" },
    ],
  },
  {
    number: "03",
    title: "Jämför och välj",
    description:
      "Alla offerter visas med samma fält: pris, tid, avstånd, betyg. Samma format, inga dolda kostnader. Du väljer när du är redo.",
    details: [
      { label: "Format", value: "Standardiserat" },
      { label: "Ordning", value: "Pris, tid, avstånd" },
      { label: "Förpliktelse", value: "Ingen förrän du väljer" },
    ],
  },
];

export function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="how-it-works" className="py-24 px-6 bg-bg-base border-t border-border">
      <div className="max-w-wide mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className="bg-white border border-border rounded-lg p-8 transition-all duration-500 hover:shadow-md hover:-translate-y-0.5"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(20px)",
                transitionDelay: `${i * 150}ms`,
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-mono text-sm font-semibold">
                  {step.number}
                </div>
                <div className="flex-1 h-px bg-border" />
              </div>

              <h3 className="font-display text-lg mb-3">{step.title}</h3>
              <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                {step.description}
              </p>

              <div className="pt-6 border-t border-border space-y-3">
                {step.details.map((detail) => (
                  <div key={detail.label} className="flex justify-between text-sm">
                    <span className="text-text-tertiary">{detail.label}:</span>
                    <span className="font-semibold text-text-primary">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
