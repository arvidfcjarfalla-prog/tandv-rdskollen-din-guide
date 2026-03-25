import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Hero() {
  const [postal, setPostal] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = postal.replace(/\s/g, "");
    if (!/^\d{5}$/.test(trimmed)) {
      setError("Ange ett giltigt postnummer (t.ex. 114 32)");
      return;
    }
    setError("");
    navigate("/request");
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-[calc(60px+96px)] pb-24 text-center overflow-hidden">

      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-bg-base" />

        {/* Gradient blobs — slow drift */}
        <div
          className="absolute w-[700px] h-[700px] rounded-full opacity-[0.12] blur-[100px]"
          style={{
            background: "radial-gradient(circle, #2A5A3F 0%, transparent 70%)",
            top: "10%",
            left: "15%",
            animation: "meshDrift1 18s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.08] blur-[90px]"
          style={{
            background: "radial-gradient(circle, #4A8A6A 0%, transparent 70%)",
            top: "40%",
            right: "10%",
            animation: "meshDrift2 22s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[80px]"
          style={{
            background: "radial-gradient(circle, #D4C5A9 0%, transparent 70%)",
            bottom: "10%",
            left: "40%",
            animation: "meshDrift3 20s ease-in-out infinite",
          }}
        />

        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "256px 256px",
          }}
        />
      </div>

      <div className="w-full max-w-[580px]">
        <p className="text-xs font-semibold text-accent uppercase tracking-[0.14em] animate-fade-up mb-6 text-center">
          Veriferade kliniker i Sverige
        </p>

        <h1 className="font-display text-4xl md:text-[56px] leading-tight text-center mb-6 animate-fade-up [animation-delay:0.1s] opacity-0">
          Något gör ont.
          <br />
          <em className="italic text-accent">Vad kostar det?</em>
        </h1>

        <p className="text-md text-text-secondary text-center mb-10 max-w-[540px] mx-auto animate-fade-up [animation-delay:0.2s] opacity-0">
          Jämför riktiga offerter från kliniker nära dig. Pris, tid och tillgänglighet — på samma villkor.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col items-center mb-8 animate-fade-up [animation-delay:0.3s] opacity-0">
          <div className="flex gap-2 mb-2 w-full max-w-[400px]">
            <input
              type="text"
              placeholder="Postnummer"
              value={postal}
              onChange={(e) => setPostal(e.target.value)}
              maxLength={6}
              inputMode="numeric"
              className={cn(
                "flex-1 px-5 py-4 text-center tracking-[0.08em] border-2 rounded-lg transition-all bg-bg-elevated",
                "focus:outline-none focus:border-border-focus",
                error ? "border-danger" : "border-border"
              )}
            />
            <button
              type="submit"
              className="px-8 py-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors"
            >
              Fortsätt
            </button>
          </div>
          {error && <p className="text-sm text-danger text-center">{error}</p>}
        </form>

        <p className="text-xs text-text-tertiary text-center mb-12 animate-fade-up [animation-delay:0.4s] opacity-0">
          Gratis. Inga förpliktelser. Slutpris sätts av kliniken.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-text-secondary animate-fade-up [animation-delay:0.5s] opacity-0 mt-10">
          <span className="flex items-center gap-[6px]">
            <span className="w-[6px] h-[6px] rounded-full bg-positive shrink-0" />
            2 400+ förfrågningar sedan jan 2026
          </span>
          <span className="w-px h-4 bg-border hidden sm:block" />
          <span className="flex items-center gap-[6px]">
            <span className="w-[6px] h-[6px] rounded-full bg-positive shrink-0" />
            Kliniker i Stockholm, Göteborg, Malmö
          </span>
        </div>
      </div>

      {/* Scroll hint */}
      <button
        onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
        className="flex flex-col items-center gap-[6px] opacity-50 animate-hint-pulse mt-10 cursor-pointer hover:opacity-70 transition-opacity"
      >
        <span className="text-[11px] font-medium text-text-tertiary tracking-[0.04em]">
          Se hur det fungerar
        </span>
        <span className="w-4 h-4 border-r-[1.5px] border-b-[1.5px] border-text-tertiary rotate-45" />
      </button>
    </section>
  );
}
