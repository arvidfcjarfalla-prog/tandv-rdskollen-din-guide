import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { CLINICS } from "@/lib/mock-data";

const STATS = [
  { value: "47", label: "Anslutna kliniker" },
  { value: "4.8", label: "Snittbetyg" },
  { value: "3.2h", label: "Snitt svarstid" },
  { value: "94%", label: "Svarar inom 24h" },
];

export function ClinicCarousel() {
  const [isVisible, setIsVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 280;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section ref={sectionRef} id="clinics" className="py-24 px-6 bg-bg-base">
      <div className="max-w-wide mx-auto">
        <div className="flex items-center justify-between mb-12">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-[0.12em]">
            Anslutna kliniker
          </p>
          <div className="flex items-center gap-2 text-sm">
            <div className="relative w-2 h-2">
              <div className="absolute inset-0 bg-positive rounded-full" />
              <div className="absolute inset-0 bg-positive rounded-full animate-live-pulse" />
            </div>
            <span className="text-text-secondary">14 kliniker med lediga tider denna vecka</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="bg-white border border-border rounded-lg p-6 text-center"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(20px)",
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
            style={{ scrollbarWidth: "none" }}
          >
            {CLINICS.map((clinic, i) => (
              <button
                key={clinic.id}
                onClick={() => navigate(`/clinic/${clinic.id}`)}
                className="flex-shrink-0 w-[260px] bg-white border border-border rounded-lg p-5 text-left hover:shadow-md transition-all snap-start"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateX(0)" : "translateX(40px)",
                  transitionDelay: `${i * 100}ms`,
                }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-md bg-accent-soft text-accent flex items-center justify-center text-sm font-bold">
                    {clinic.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold mb-1 truncate">{clinic.name}</div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-3 h-3 fill-current text-warning" />
                      <span className="font-semibold">{clinic.rating}</span>
                      <span className="text-text-tertiary">({clinic.ratingCount})</span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-text-secondary mb-3">{clinic.area}</div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {clinic.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-bg-sunken rounded text-xs text-text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        clinic.available ? "bg-positive" : "bg-text-tertiary"
                      )}
                    />
                    <span className="text-text-secondary">{clinic.availText}</span>
                  </div>
                  <span className="text-sm text-accent">Visa →</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation arrows */}
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full border border-border bg-white hover:bg-bg-sunken transition-colors flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full border border-border bg-white hover:bg-bg-sunken transition-colors flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-text-secondary mt-8">
          Stockholm, Göteborg, Malmö, Uppsala, Västerås
        </p>
      </div>
    </section>
  );
}
