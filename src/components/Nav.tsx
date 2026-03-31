import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SmileMark } from "./ToothIcon";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { to: "/", label: "Hem" },
  { to: "/compare", label: "Exempel" },
  { to: "/kliniker", label: "Kliniker" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] h-[60px] bg-bg-overlay backdrop-blur-[16px] border-b border-border transition-shadow",
        scrolled && "shadow-sm"
      )}
      aria-label="Huvudnavigering"
    >
      <div className="max-w-wide mx-auto h-full px-6 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-[7px] group">
          <SmileMark size={22} className="text-accent group-hover:scale-105 transition-transform" />
          <span className="font-display text-[17px] text-text-primary tracking-[-0.01em]">
            Tandkollen
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "text-sm font-medium py-[6px] border-b-2 transition-colors",
                isActive(to)
                  ? "text-text-primary border-accent"
                  : "text-text-secondary border-transparent hover:text-text-primary"
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/request"
            className="bg-accent hover:bg-accent-hover text-white rounded-full px-5 py-2 text-sm font-semibold transition-colors"
          >
            Kom igång
          </Link>
          <Link
            to="/mina-sidor"
            className={cn(
              "hidden sm:flex w-8 h-8 rounded-full items-center justify-center text-xs font-bold transition-colors",
              isActive("/mina-sidor")
                ? "bg-accent text-white"
                : "bg-accent-soft text-accent hover:bg-accent-medium"
            )}
            title="Mina sidor"
            aria-label="Mina sidor"
          >
            AL
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            aria-label={mobileOpen ? "Stäng meny" : "Öppna meny"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-bg-elevated border-b border-border shadow-lg animate-fade-in">
          <div className="px-6 py-4 flex flex-col gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "py-3 px-3 rounded-md text-sm font-medium transition-colors",
                  isActive(to)
                    ? "text-accent bg-accent-soft"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-sunken"
                )}
              >
                {label}
              </Link>
            ))}
            <Link
              to="/mina-sidor"
              className={cn(
                "py-3 px-3 rounded-md text-sm font-medium transition-colors",
                isActive("/mina-sidor")
                  ? "text-accent bg-accent-soft"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-sunken"
              )}
            >
              Mina sidor
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
