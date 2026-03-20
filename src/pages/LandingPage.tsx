import { Link } from "react-router-dom";

type OfferPreview = {
  clinic: string;
  price: string;
  responseTime: string;
  distance: string;
  rating: string;
  slot: string;
  includes: string[];
};

const offerPreview: OfferPreview[] = [
  {
    clinic: "CityDental Odenplan",
    price: "7 900 - 9 500 kr",
    responseTime: "2 h",
    distance: "2.4 km",
    rating: "4.8/5",
    slot: "Imorgon 08:30",
    includes: ["Konsultation", "Rontgen", "Akut atgard"],
  },
  {
    clinic: "Norrmalm Tandteam",
    price: "8 600 - 10 200 kr",
    responseTime: "5 h",
    distance: "3.1 km",
    rating: "4.7/5",
    slot: "Imorgon 11:10",
    includes: ["Konsultation", "Rontgen", "Bedovning"],
  },
  {
    clinic: "Sodermalm Oral Care",
    price: "9 100 - 11 300 kr",
    responseTime: "7 h",
    distance: "4.9 km",
    rating: "4.6/5",
    slot: "Imorgon 14:40",
    includes: ["Konsultation", "Rotfyllning start", "Eftervard"],
  },
];

const faq = [
  {
    q: "Kostar det nagot att skicka forfragan?",
    a: "Nej. Det ar kostnadsfritt att skicka forfragan och jamfora offerter.",
  },
  {
    q: "Hur snabbt far jag svar?",
    a: "De flesta far minst ett svar inom 6 timmar pa vardagar.",
  },
  {
    q: "Ar klinikerna verifierade?",
    a: "Ja, alla anslutna kliniker verifieras innan de kan svara pa forfragningar.",
  },
  {
    q: "Hur jams priset mot referenspris?",
    a: "Vi visar klinikens offert bredvid referenspris och lokal median for tydlig jamforelse.",
  },
  {
    q: "Kan jag avbryta utan att boka?",
    a: "Ja. Du valjer sjalv om du vill ga vidare med en klinik eller inte.",
  },
];

export default function LandingPage() {
  return (
    <section className="landing">
      <section className="hero card reveal">
        <div>
          <span className="badge">Verifierade kliniker + benchmark-data</span>
          <h1>Fa flera offerter for tandskada inom 24 timmar</h1>
          <p className="hero-sub">
            En forfragan. Flera svar. Jamfor totalpris, svarstid, tillgangliga tider och avstand innan du valjer klinik.
          </p>

          <div className="hero-actions">
            <Link className="btn btn-primary" to="/request">
              Skapa forfragan
            </Link>
            <Link className="btn btn-secondary" to="/compare">
              Se exempelofferter
            </Link>
          </div>

          <ul className="trust-row" aria-label="Trygghetssignaler">
            <li>Snittsvar: 6h</li>
            <li>Verifierade kliniker</li>
            <li>Kostnadsfritt att jamfora</li>
          </ul>
        </div>

        <aside className="hero-panel" aria-label="Exempel pa case-status">
          <p className="eyebrow">Exempel pa inkommet case</p>
          <h3>Fraktur framtand, postnummer 113 45</h3>
          <dl>
            <div>
              <dt>Offerter inkomna</dt>
              <dd>3 st</dd>
            </div>
            <div>
              <dt>Prisintervall</dt>
              <dd>7 900 - 11 300 kr</dd>
            </div>
            <div>
              <dt>Tidigaste tid</dt>
              <dd>Imorgon 08:30</dd>
            </div>
            <div>
              <dt>Snittsvarstid</dt>
              <dd>4 h 40 min</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="kpi-grid reveal" aria-label="Nyckeltal">
        <article className="kpi-card card">
          <p className="kpi-value">140+</p>
          <p className="kpi-label">Anslutna kliniker</p>
        </article>
        <article className="kpi-card card">
          <p className="kpi-value">6h</p>
          <p className="kpi-label">Genomsnittlig svarstid</p>
        </article>
        <article className="kpi-card card">
          <p className="kpi-value">18%</p>
          <p className="kpi-label">Median skillnad mellan offertnivaher</p>
        </article>
        <article className="kpi-card card">
          <p className="kpi-value">4.7/5</p>
          <p className="kpi-label">Patientbetyg pa valda kliniker</p>
        </article>
      </section>

      <section className="section reveal" aria-labelledby="steps-heading">
        <div className="section-head">
          <p className="eyebrow">Sa funkar det</p>
          <h2 id="steps-heading">Tre steg fran skada till bokad tid</h2>
        </div>

        <div className="steps-grid">
          <article className="card step-card step-primary">
            <p className="step-no">1</p>
            <h3>Beskriv skadan</h3>
            <p>Fyll i symptom, ladda upp bilder och ange postnummer. Tar cirka 2 minuter.</p>
          </article>
          <article className="card step-card">
            <p className="step-no">2</p>
            <h3>Fa offerter</h3>
            <p>Kliniker skickar svar med prisforslag, tidigaste tid och vad som ingar.</p>
          </article>
          <article className="card step-card">
            <p className="step-no">3</p>
            <h3>Valj klinik</h3>
            <p>Jamfor pris, svarstid, betyg och avstand. Boka endast om du ar nojd.</p>
          </article>
        </div>
      </section>

      <section className="section reveal" aria-labelledby="compare-heading">
        <div className="section-head">
          <p className="eyebrow">Jamforelsepreview</p>
          <h2 id="compare-heading">Se skillnaden mellan klinikernas offerter</h2>
        </div>

        <div className="offers-grid">
          {offerPreview.map((offer) => (
            <article className="card offer-card" key={offer.clinic}>
              <h3>{offer.clinic}</h3>
              <p className="price">{offer.price}</p>

              <ul className="offer-meta">
                <li>Svarstid: {offer.responseTime}</li>
                <li>Avstand: {offer.distance}</li>
                <li>Betyg: {offer.rating}</li>
                <li>Tidigaste tid: {offer.slot}</li>
              </ul>

              <p className="mini-title">Vad ingar</p>
              <ul className="includes-list">
                {offer.includes.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>

              <Link className="btn btn-secondary" to="/compare">
                Se full jamforelse
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section card transparency reveal" aria-labelledby="source-heading">
        <div>
          <p className="eyebrow">Datakallor och transparens</p>
          <h2 id="source-heading">Prisjamforelse byggd for tydlighet</h2>
          <p>
            Tandskadekollen visar klinikens offert tillsammans med referenspris och lokal median, sa att du snabbare ser
            rimlig prisniva.
          </p>
        </div>
        <ul className="source-list">
          <li>Referenspris: statlig benchmark for jamforbarhet</li>
          <li>Lokalt medianpris: dynamisk jamforelse i ditt omrade</li>
          <li>Klinikdata: svarstid, tillganglighet, patientbetyg</li>
        </ul>
      </section>

      <section className="section reveal" aria-labelledby="faq-heading">
        <div className="section-head">
          <p className="eyebrow">Vanliga fragor</p>
          <h2 id="faq-heading">Fragor innan du skickar in</h2>
        </div>

        <div className="faq-list">
          {faq.map((item) => (
            <details className="faq-item card" key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="final-cta card reveal">
        <h2>Redo att jamfora offerter for din tandskada?</h2>
        <p>Skicka en forfragan gratis och fa konkreta svar fran anslutna kliniker.</p>
        <Link className="btn btn-primary" to="/request">
          Starta nu
        </Link>
      </section>
    </section>
  );
}
