import { useEffect, useRef, useState } from "react";

const PILLARS = [
  {
    title: "Priserna är riktmärken",
    description: "Baserat på öppen referensdata — inte ett löfte.",
  },
  {
    title: "Offerter är bindande",
    description: "Kliniken står bakom sitt pris under giltighetstiden.",
  },
  {
    title: "Inget val, ingen kostnad",
    description: "Du betalar ingenting förrän du aktivt väljer klinik.",
  },
  {
    title: "Vi tjänar inget på ditt val",
    description: "Ordningen bestäms av data, inte av vem som betalar.",
  },
];

export function TrustPillars() {
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
    <section ref={sectionRef} id="trust" className="py-24 px-6 bg-bg-base">
      <div className="max-w-wide mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {PILLARS.map((pillar, i) => (
            <div
              key={pillar.title}
              className="text-center"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(20px)",
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <h3 className="font-semibold mb-2 text-text-primary">{pillar.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
