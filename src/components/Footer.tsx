import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="px-6 py-10 border-t border-border bg-bg-base">
      <div className="max-w-wide mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-8">
          <div>
            <span className="font-display text-md text-text-primary">Tandkollen</span>
            <p className="text-xs text-text-tertiary mt-1 max-w-[280px]">
              Jämför tandvårdsofferter från kliniker nära dig. Gratis, transparent, utan förpliktelser.
            </p>
          </div>
          <div className="flex gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.08em]">Tjänster</span>
              <Link to="/request" className="text-xs text-text-secondary hover:text-text-primary transition-colors">Skicka förfrågan</Link>
              <Link to="/kliniker" className="text-xs text-text-secondary hover:text-text-primary transition-colors">Hitta kliniker</Link>
              <Link to="/compare" className="text-xs text-text-secondary hover:text-text-primary transition-colors">Se exempel</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.08em]">Konto</span>
              <Link to="/mina-sidor" className="text-xs text-text-secondary hover:text-text-primary transition-colors">Mina sidor</Link>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-6 border-t border-border">
          <span className="text-[11px] text-text-tertiary">© 2026 Tandkollen. Prisdata: Tandpriskollen (TLV), januari 2026.</span>
          <span className="text-[11px] text-text-tertiary">Stockholm · Göteborg · Malmö · Uppsala</span>
        </div>
      </div>
    </footer>
  );
}
