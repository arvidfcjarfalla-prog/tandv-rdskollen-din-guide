import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const TITLES: Record<string, string> = {
  "/": "Tandkollen — Jämför tandvårdspriser nära dig",
  "/request": "Skicka förfrågan — Tandkollen",
  "/compare": "Jämför offerter — Tandkollen",
  "/confirm": "Bekräftelse — Tandkollen",
  "/kliniker": "Kliniker i Stockholm — Tandkollen",
  "/mina-sidor": "Mina sidor — Tandkollen",
};

export function usePageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const title = TITLES[pathname] ||
      (pathname.startsWith("/clinic/") ? "Klinikprofil — Tandkollen" : "Tandkollen");
    document.title = title;
  }, [pathname]);
}
