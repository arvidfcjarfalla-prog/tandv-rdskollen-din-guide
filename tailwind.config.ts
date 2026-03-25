import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-base": "#FAFAF8",
        "bg-elevated": "#FFFFFF",
        "bg-sunken": "#F2F1EE",
        "bg-overlay": "rgba(250,250,248,0.92)",
        "bg-dark": "#1A1A1A",
        "bg-dark-elevated": "#242424",

        "text-primary": "#1A1A1A",
        "text-secondary": "#6B6B6B",
        "text-tertiary": "#9E9E9E",
        "text-inverse": "#FAFAF8",
        "text-on-accent": "#FFFFFF",

        accent: "#2A5A3F",
        "accent-hover": "#1E4530",
        "accent-soft": "rgba(42,90,63,0.08)",
        "accent-medium": "rgba(42,90,63,0.15)",

        positive: "#2A7A4B",
        "positive-soft": "rgba(42,122,75,0.08)",
        warning: "#B8860B",
        "warning-soft": "rgba(184,134,11,0.08)",
        danger: "#C0392B",
        "danger-soft": "rgba(192,57,43,0.08)",
        info: "#2A5A8F",
        "info-soft": "rgba(42,90,143,0.08)",

        border: "#E5E4E0",
        "border-strong": "#D0CFCB",
        "border-focus": "#2A5A3F",
      },
      fontFamily: {
        display: ["'Instrument Serif'", "Georgia", "serif"],
        body: ["'Outfit'", "-apple-system", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      fontSize: {
        xs: "12px",
        sm: "13px",
        base: "15px",
        md: "17px",
        lg: "20px",
        xl: "24px",
        "2xl": "32px",
        "3xl": "42px",
        "4xl": "56px",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
        full: "9999px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.04)",
        md: "0 2px 8px rgba(0,0,0,0.06)",
        lg: "0 8px 24px rgba(0,0,0,0.08)",
        xl: "0 16px 48px rgba(0,0,0,0.10)",
      },
      spacing: {
        xs: "4px",
        "space-sm": "8px",
        "space-md": "16px",
        "space-lg": "24px",
        "space-xl": "40px",
        "space-2xl": "64px",
        "space-3xl": "96px",
        "space-4xl": "128px",
        nav: "60px",
      },
      maxWidth: {
        content: "680px",
        wide: "960px",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-100%)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        hintPulse: {
          "0%, 100%": { opacity: "0.4", transform: "translateY(0)" },
          "50%": { opacity: "0.7", transform: "translateY(4px)" },
        },
        livePulse: {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(1.8)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out both",
        "fade-in": "fadeIn 0.3s ease-out both",
        blink: "blink 0.9s ease infinite",
        "hint-pulse": "hintPulse 2.5s ease infinite",
        "live-pulse": "livePulse 2s ease infinite",
      },
    },
  },
  plugins: [tailwindAnimate],
};

export default config;
