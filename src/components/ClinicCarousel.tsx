import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { clinics as realClinics, type RealClinic } from "@/lib/clinic-data";

/** Pick a diverse set of real clinics for the carousel */
const CAROUSEL_CLINICS: RealClinic[] = realClinics
  .filter((c) => c.lat && c.lng && c.priceLevelPct !== null)
  .slice(0, 12);

const STATS = [
  { value: String(realClinics.length), label: "Kliniker i Stockholm" },
  { value: "jan 2026", label: "Prisdata uppdaterad" },
  { value: "TLV", label: "Verifierad referensdata" },
  { value: "100%", label: "Gratis att jämföra" },
];

function getPriceBadge(pct: number | null) {
  if (pct === null) return { text: "Ej jämfört", cls: "bg-bg-sunken text-text-tertiary" };
  if (pct < -10) return { text: `${pct}% vs ref`, cls: "bg-positive-soft text-positive" };
  if (pct > 10) return { text: `+${pct}% vs ref`, cls: "bg-warning-soft text-warning" };
  return { text: "Nära referens", cls: "bg-bg-sunken text-text-secondary" };
}

export function ClinicCarousel() {
  const [isVisible, setIsVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -280 : 280,
      behavior: "smooth",
    });
  };

  return (
    <section ref={sectionRef} id="clinics" className="py-24 px-6 bg-bg-base">
      <div className="max-w-wide mx-auto">
        <div className="flex items-center justify-between mb-12">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-[0.12em]">
            Kliniker i nätverket
          </p>
          <button
            onClick={() => navigate("/kliniker")}
            className="text-sm text-accent hover:text-accent-hover font-medium transition-colors"
          >
            Se alla kliniker →
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="bg-bg-elevated border border-border rounded-lg p-6 text-center"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <div className="font-display text-2xl mb-1">{stat.value}</div>
              <div className="text-xs text-text-tertiary">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Carousel */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
          >
            {CAROUSEL_CLINICS.map((clinic, i) => {
              const badge = getPriceBadge(clinic.priceLevelPct);
              return (
                <button
                  key={clinic.id}
                  onClick={() => navigate(`/clinic/${clinic.id}`)}
                  className="flex-shrink-0 w-[260px] bg-bg-elevated border border-border rounded-lg p-5 text-left hover:shadow-md transition-all snap-start"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateX(0)" : "translateX(40px)",
                    transition: "opacity 0.5s ease, transform 0.5s ease",
                    transitionDelay: `${i * 80}ms`,
                  }}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-md bg-accent-soft text-accent flex items-center justify-center text-sm font-bold shrink-0">
                      {clinic.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm mb-1 truncate">{clinic.name}</div>
                      <div className="text-xs text-text-secondary">{clinic.area}</div>
                    </div>
                  </div>

                  <div className={cn("inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mb-3", badge.cls)}>
                    {badge.text}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-xs text-text-tertiary truncate">{clinic.address}</span>
                    <span className="text-xs text-accent font-medium shrink-0 ml-2">Visa →</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation arrows */}
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full border border-border bg-bg-elevated hover:bg-bg-sunken transition-colors flex items-center justify-center"
              aria-label="Scrolla vänster"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full border border-border bg-bg-elevated hover:bg-bg-sunken transition-colors flex items-center justify-center"
              aria-label="Scrolla höger"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
