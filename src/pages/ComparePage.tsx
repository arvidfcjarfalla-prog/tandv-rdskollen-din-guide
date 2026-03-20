import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

type SortMode = "best" | "price" | "speed" | "rating";

type Offer = {
  id: string;
  clinic: string;
  priceMin: number;
  priceMax: number;
  responseHours: number;
  distanceKm: number;
  rating: number;
  earliestSlot: string;
  referenceDeltaPct: number;
  includes: string[];
};

const offers: Offer[] = [
  {
    id: "citydental",
    clinic: "CityDental Odenplan",
    priceMin: 7900,
    priceMax: 9500,
    responseHours: 2,
    distanceKm: 2.4,
    rating: 4.8,
    earliestSlot: "Imorgon 08:30",
    referenceDeltaPct: -6,
    includes: ["Konsultation", "Rontgen", "Akut atgard"],
  },
  {
    id: "norrmalm",
    clinic: "Norrmalm Tandteam",
    priceMin: 8600,
    priceMax: 10200,
    responseHours: 5,
    distanceKm: 3.1,
    rating: 4.7,
    earliestSlot: "Imorgon 11:10",
    referenceDeltaPct: -1,
    includes: ["Konsultation", "Rontgen", "Bedovning"],
  },
  {
    id: "sodermalm",
    clinic: "Sodermalm Oral Care",
    priceMin: 9100,
    priceMax: 11300,
    responseHours: 7,
    distanceKm: 4.9,
    rating: 4.6,
    earliestSlot: "Imorgon 14:40",
    referenceDeltaPct: 3,
    includes: ["Konsultation", "Rotfyllning start", "Eftervard"],
  },
  {
    id: "vasastan",
    clinic: "Vasastan Tandakut",
    priceMin: 8200,
    priceMax: 9800,
    responseHours: 3,
    distanceKm: 6.3,
    rating: 4.5,
    earliestSlot: "Idag 17:20",
    referenceDeltaPct: -4,
    includes: ["Akuttid", "Smartlindring", "Kontroll efter 7 dagar"],
  },
];

function formatMoney(value: number): string {
  return `${new Intl.NumberFormat("sv-SE").format(value)} kr`;
}

function scoreOffer(offer: Offer): number {
  const medianPrice = (offer.priceMin + offer.priceMax) / 2;
  return offer.rating * 30 - offer.responseHours * 3 - offer.distanceKm * 1.2 - medianPrice / 2000;
}

export default function ComparePage() {
  const [sortMode, setSortMode] = useState<SortMode>("best");
  const [maxDistance, setMaxDistance] = useState(8);
  const [maxResponseHours, setMaxResponseHours] = useState(24);

  const filteredOffers = useMemo(
    () => offers.filter((offer) => offer.distanceKm <= maxDistance && offer.responseHours <= maxResponseHours),
    [maxDistance, maxResponseHours],
  );

  const sortedOffers = useMemo(() => {
    const copy = [...filteredOffers];

    if (sortMode === "price") {
      return copy.sort((a, b) => a.priceMin - b.priceMin);
    }

    if (sortMode === "speed") {
      return copy.sort((a, b) => a.responseHours - b.responseHours);
    }

    if (sortMode === "rating") {
      return copy.sort((a, b) => b.rating - a.rating);
    }

    return copy.sort((a, b) => scoreOffer(b) - scoreOffer(a));
  }, [filteredOffers, sortMode]);

  const cheapestId = useMemo(
    () => offers.slice().sort((a, b) => a.priceMin - b.priceMin)[0]?.id,
    [],
  );
  const fastestId = useMemo(
    () => offers.slice().sort((a, b) => a.responseHours - b.responseHours)[0]?.id,
    [],
  );
  const bestRatedId = useMemo(
    () => offers.slice().sort((a, b) => b.rating - a.rating)[0]?.id,
    [],
  );

  const topMatch = sortedOffers[0];

  return (
    <section className="compare-page">
      <section className="card compare-head reveal">
        <div>
          <span className="badge">Jamfor offerter</span>
          <h2>Valklar vy med pris, svarstid och tillganglighet</h2>
          <p>Sortera efter vad som ar viktigast for dig: lagst pris, snabbast svar eller hogst betyg.</p>
        </div>
        <Link className="btn btn-secondary" to="/request">Skicka ny forfragan</Link>
      </section>

      <section className="compare-controls card reveal">
        <label>
          Sortering
          <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
            <option value="best">Basta totalmatch</option>
            <option value="price">Lagst pris</option>
            <option value="speed">Snabbast svar</option>
            <option value="rating">Hogst betyg</option>
          </select>
        </label>

        <label>
          Max avstand: {maxDistance} km
          <input
            type="range"
            min={2}
            max={15}
            step={1}
            value={maxDistance}
            onChange={(event) => setMaxDistance(Number(event.target.value))}
          />
        </label>

        <label>
          Max svarstid: {maxResponseHours} h
          <input
            type="range"
            min={2}
            max={24}
            step={1}
            value={maxResponseHours}
            onChange={(event) => setMaxResponseHours(Number(event.target.value))}
          />
        </label>
      </section>

      {topMatch ? (
        <section className="card best-match reveal">
          <p className="eyebrow">Topmatch just nu</p>
          <h3>{topMatch.clinic}</h3>
          <p>
            {formatMoney(topMatch.priceMin)} - {formatMoney(topMatch.priceMax)} | svar inom {topMatch.responseHours} h | {topMatch.distanceKm} km
          </p>
        </section>
      ) : (
        <section className="card reveal">
          <h3>Inga kliniker matchar filtret</h3>
          <p>Oka avstands- eller svarstidsfilter for att se fler alternativ.</p>
        </section>
      )}

      <section className="offers-grid reveal">
        {sortedOffers.map((offer, index) => {
          const isTop = index === 0;
          const tags = [
            offer.id === cheapestId ? "Billigast" : null,
            offer.id === fastestId ? "Snabbast" : null,
            offer.id === bestRatedId ? "Bast betyg" : null,
          ].filter(Boolean) as string[];

          return (
            <article className={`card offer-card ${isTop ? "offer-top" : ""}`} key={offer.id}>
              <header className="offer-header">
                <h3>{offer.clinic}</h3>
                {isTop && <span className="chip chip-top">Rekommenderad</span>}
              </header>

              <p className="price">
                {formatMoney(offer.priceMin)} - {formatMoney(offer.priceMax)}
              </p>

              <ul className="offer-meta">
                <li>Svarstid: {offer.responseHours} h</li>
                <li>Avstand: {offer.distanceKm} km</li>
                <li>Betyg: {offer.rating}/5</li>
                <li>Tid: {offer.earliestSlot}</li>
                <li>Mot referenspris: {offer.referenceDeltaPct > 0 ? `+${offer.referenceDeltaPct}%` : `${offer.referenceDeltaPct}%`}</li>
              </ul>

              {tags.length > 0 && (
                <div className="chip-row">
                  {tags.map((tag) => (
                    <span className="chip" key={tag}>{tag}</span>
                  ))}
                </div>
              )}

              <p className="mini-title">Vad ingar</p>
              <ul className="includes-list">
                {offer.includes.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>

              <button className="btn btn-primary">Valj klinik</button>
            </article>
          );
        })}
      </section>

      <section className="card compare-footnote reveal">
        <p className="eyebrow">Transparens</p>
        <p>
          Priser visas tillsammans med referensniva och lokal median. Beslutsstodet ar till for att gora skillnader tydliga,
          inte for att pusha ett enskilt val.
        </p>
      </section>
    </section>
  );
}
