import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SmileMark } from "./ToothIcon";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] h-[60px] bg-bg-overlay backdrop-blur-[16px] border-b border-border transition-shadow",
        scrolled && "shadow-sm"
      )}
    >
      <div className="max-w-wide mx-auto h-full px-6 flex items-center justify-between gap-6">
        <Link
          to="/"
          className="flex items-center gap-[7px] group"
        >
          <SmileMark size={22} className="text-accent group-hover:scale-105 transition-transform" />
          <span className="font-display text-[17px] text-text-primary tracking-[-0.01em]">
            Tandkollen
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={cn(
              "text-sm font-medium py-[6px] border-b-2 transition-colors",
              isActive("/")
                ? "text-text-primary border-accent"
                : "text-text-secondary border-transparent hover:text-text-primary"
            )}
          >
            Hem
          </Link>
          <Link
            to="/compare"
            className={cn(
              "text-sm font-medium py-[6px] border-b-2 transition-colors",
              isActive("/compare")
                ? "text-text-primary border-accent"
                : "text-text-secondary border-transparent hover:text-text-primary"
            )}
          >
            Exempel
          </Link>
          <Link
            to="/kliniker"
            className={cn(
              "text-sm font-medium py-[6px] border-b-2 transition-colors",
              isActive("/kliniker") || location.pathname.startsWith("/clinic")
                ? "text-text-primary border-accent"
                : "text-text-secondary border-transparent hover:text-text-primary"
            )}
          >
            Kliniker
          </Link>
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
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
              isActive("/mina-sidor")
                ? "bg-accent text-white"
                : "bg-accent-soft text-accent hover:bg-accent-medium"
            )}
            title="Mina sidor"
          >
            AL
          </Link>
        </div>
      </div>
    </nav>
  );
}
