import { useEffect, useRef, useState } from "react";
import { Shield, FileCheck, HandCoins, Scale } from "lucide-react";

const PILLARS = [
  {
    icon: Shield,
    title: "Priserna är riktmärken",
    description: "Baserat på öppen referensdata från TLV — inte ett löfte.",
  },
  {
    icon: FileCheck,
    title: "Offerter är bindande",
    description: "Kliniken står bakom sitt pris under giltighetstiden.",
  },
  {
    icon: HandCoins,
    title: "Inget val, ingen kostnad",
    description: "Du betalar ingenting förrän du aktivt väljer klinik.",
  },
  {
    icon: Scale,
    title: "Vi tjänar inget på ditt val",
    description: "Ordningen bestäms av data, inte av vem som betalar.",
  },
];

export function TrustPillars() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="trust" className="py-24 px-6 bg-bg-base">
      <div className="max-w-wide mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="text-center"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(20px)",
                  transition: "opacity 0.5s ease, transform 0.5s ease",
                  transitionDelay: `${i * 100}ms`,
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold mb-2 text-text-primary">{pillar.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
