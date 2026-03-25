import { useNavigate, useSearchParams } from "react-router-dom";
import { OFFERS } from "@/lib/mock-data";

export default function ConfirmPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const offerId = searchParams.get("offer");

  const offer = OFFERS.find((o) => o.id === Number(offerId));

  if (!offer) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-6">
        <div className="max-w-[480px] text-center">
          <h1 className="font-display text-2xl text-text-primary mb-4">
            Offert hittades inte
          </h1>
          <button
            onClick={() => navigate("/compare")}
            className="text-accent hover:text-accent-hover underline"
          >
            Tillbaka till jämförelse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-6 py-12">
      <div className="max-w-[480px] w-full">
        {/* Check Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-positive-soft border-2 border-positive flex items-center justify-center">
            <svg
              className="w-8 h-8 text-positive"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl text-text-primary text-center mb-2">
          Du har valt {offer.clinic}
        </h1>
        <p className="text-text-secondary text-base text-center mb-8">
          Kliniken kontaktar dig inom {offer.responseTime} för att bekräfta din tid. Du får en notifikation via e-post.
        </p>

        {/* Details Card */}
        <div className="bg-bg-elevated rounded-lg p-6 shadow-md mb-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start pb-4 border-b border-border">
              <span className="text-text-secondary text-sm">Offertpris</span>
              <span className="font-semibold text-text-primary text-md">
                {offer.price} kr
              </span>
            </div>

            <div className="flex justify-between items-start pb-4 border-b border-border">
              <span className="text-text-secondary text-sm">Vad ingår</span>
              <span className="text-text-primary text-sm text-right max-w-[60%]">
                {offer.scope}
              </span>
            </div>

            <div className="flex justify-between items-start pb-4 border-b border-border">
              <span className="text-text-secondary text-sm">Tidigaste tid</span>
              <span className="text-text-primary text-sm">{offer.wait}</span>
            </div>

            <div className="flex justify-between items-start pb-4 border-b border-border">
              <span className="text-text-secondary text-sm">Plats</span>
              <span className="text-text-primary text-sm text-right">
                {offer.area} · {offer.distance}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-text-secondary text-sm">Offert giltig t.o.m.</span>
              <span className="text-text-primary text-sm">{offer.validUntil}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          <button className="px-6 py-[14px] bg-bg-elevated border-[1.5px] border-border text-text-primary rounded-md font-semibold text-sm hover:border-border-strong hover:bg-bg-sunken transition-all">
            Lägg till i kalender
          </button>
          <button
            onClick={() => navigate("/request")}
            className="px-6 py-[14px] bg-bg-elevated border-[1.5px] border-border text-text-primary rounded-md font-semibold text-sm hover:border-border-strong hover:bg-bg-sunken transition-all"
          >
            Visa förfrågan
          </button>
        </div>

        {/* Footnote */}
        <p className="text-text-tertiary text-xs text-center">
          Ingenting är slutgiltigt förrän kliniken bekräftat tiden med dig.
          <br />
          Har kliniken inte hört av sig?{" "}
          <button className="text-accent underline hover:opacity-70 transition-opacity">
            Kontakta oss
          </button>
          .
        </p>
      </div>
    </div>
  );
}
