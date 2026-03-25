import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function StickyCtaBar() {
  const [postal, setPostal] = useState("");
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > window.innerHeight);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = postal.replace(/\s/g, "");
    if (!/^\d{5}$/.test(trimmed)) {
      setError("Ange ett giltigt postnummer (5 siffror)");
      return;
    }
    setError("");
    navigate("/request");
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-bg-overlay backdrop-blur-[16px] border-t border-border px-6 py-4 transition-transform duration-300",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Postnummer"
            value={postal}
            onChange={(e) => setPostal(e.target.value)}
            maxLength={6}
            inputMode="numeric"
            className={cn(
              "flex-1 px-4 py-3 text-center tracking-[0.08em] border-2 rounded-lg transition-all",
              "focus:outline-none focus:border-border-focus",
              error ? "border-danger" : "border-border"
            )}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors"
          >
            Kom igång
          </button>
        </div>
        {error && <p className="text-sm text-danger text-center mt-2">{error}</p>}
      </form>
    </div>
  );
}
