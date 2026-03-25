import { useNavigate } from "react-router-dom";

export function DarkCta() {
  const navigate = useNavigate();

  return (
    <section id="cta" className="py-20 px-6">
      <div className="max-w-content mx-auto text-center">
        <h2 className="font-display text-2xl mb-3">
          Redo att jämföra priser?
        </h2>
        <p className="text-md text-text-secondary mb-8 max-w-[440px] mx-auto">
          Beskriv din behandling, välj område — få offerter från kliniker nära dig. Tar under två minuter.
        </p>

        <button
          onClick={() => navigate("/request")}
          className="px-10 py-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors text-md"
        >
          Skicka en förfrågan
        </button>

        <p className="text-xs text-text-tertiary mt-4">
          Helt gratis · Ingen registrering krävs
        </p>
      </div>
    </section>
  );
}
