import { useState } from "react";
import { cn } from "@/lib/utils";
import { Star, MapPin, Calendar, ArrowRight, MessageSquare } from "lucide-react";

interface ClinicVisit {
  clinicId: string;
  clinic: string;
  area: string;
  date: string;
  treatment: string;
  price: number;
  rating: number | null;
  ratingCount: number;
  avgRating: number;
  myReview: string | null;
  myRating: number | null;
}

const MOCK_VISITS: ClinicVisit[] = [
  {
    clinicId: "c4",
    clinic: "Tandläkare Karin Olebratt",
    area: "Södermalm",
    date: "13 mars 2026",
    treatment: "Undersökning + röntgen",
    price: 1350,
    rating: null,
    ratingCount: 67,
    avgRating: 4.9,
    myReview: null,
    myRating: null,
  },
  {
    clinicId: "c3",
    clinic: "Folktandvården Vasastan",
    area: "Vasastan",
    date: "28 feb 2026",
    treatment: "Tandkrona porslin",
    price: 5900,
    rating: null,
    ratingCount: 214,
    avgRating: 4.8,
    myReview: "Mycket professionell och snabb. Tandkronan blev perfekt. Rekommenderas varmt!",
    myRating: 5,
  },
  {
    clinicId: "c1",
    clinic: "Distriktstandvården Sveavägen",
    area: "Norrmalm",
    date: "10 jan 2026",
    treatment: "Lagning (komposit, 2 ytor)",
    price: 1250,
    rating: null,
    ratingCount: 128,
    avgRating: 4.6,
    myReview: "Bra bemötande, men lite lång väntetid.",
    myRating: 4,
  },
];

interface Props {
  onViewClinic: (id: string) => void;
  onOpenChat: (clinic: string) => void;
}

export default function PortalClinicHistory({ onViewClinic, onOpenChat }: Props) {
  const [reviewingIdx, setReviewingIdx] = useState<number | null>(null);
  const [tempRating, setTempRating] = useState(0);
  const [tempReview, setTempReview] = useState("");

  const handleSubmitReview = (idx: number) => {
    // Mock - in real app would submit to backend
    setReviewingIdx(null);
    setTempRating(0);
    setTempReview("");
  };

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
        Kliniker du besökt
      </p>

      {MOCK_VISITS.map((visit, idx) => (
        <div key={idx} className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3">
          {/* Clinic header */}
          <div className="flex items-start justify-between">
            <div>
              <button
                onClick={() => onViewClinic(visit.clinicId)}
                className="font-semibold text-sm text-zinc-900 hover:text-amber-700 transition-colors"
              >
                {visit.clinic}
              </button>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-400">
                <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> {visit.area}</span>
                <span>·</span>
                <span className="flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" /> {visit.date}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-zinc-900">{visit.price.toLocaleString("sv-SE")} kr</div>
              <div className="text-[10px] text-zinc-400">{visit.treatment}</div>
            </div>
          </div>

          {/* Clinic avg rating */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={cn("w-3 h-3", s <= Math.round(visit.avgRating) ? "text-amber-400 fill-amber-400" : "text-zinc-200")}
                />
              ))}
            </div>
            <span className="text-zinc-500">{visit.avgRating}</span>
            <span className="text-zinc-400">({visit.ratingCount} omdömen)</span>
          </div>

          {/* Existing review */}
          {visit.myReview && (
            <div className="bg-amber-50/60 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-[10px] font-semibold text-zinc-500">Ditt omdöme</span>
                <div className="flex items-center gap-0.5 ml-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn("w-2.5 h-2.5", s <= (visit.myRating ?? 0) ? "text-amber-500 fill-amber-500" : "text-zinc-200")}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">{visit.myReview}</p>
            </div>
          )}

          {/* Review form */}
          {!visit.myReview && reviewingIdx !== idx && (
            <button
              onClick={() => setReviewingIdx(idx)}
              className="flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-800 transition-colors"
            >
              <Star className="w-3.5 h-3.5" /> Lämna omdöme
            </button>
          )}

          {reviewingIdx === idx && (
            <div className="border border-amber-200 rounded-lg p-4 bg-amber-50/30 space-y-3">
              <p className="text-xs font-medium text-zinc-700">Hur var din upplevelse?</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setTempRating(s)} className="p-0.5">
                    <Star className={cn("w-6 h-6 transition-colors", s <= tempRating ? "text-amber-500 fill-amber-500" : "text-zinc-200 hover:text-amber-300")} />
                  </button>
                ))}
              </div>
              <textarea
                value={tempReview}
                onChange={(e) => setTempReview(e.target.value)}
                placeholder="Beskriv din upplevelse (valfritt)..."
                rows={3}
                className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200 resize-none transition-all"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleSubmitReview(idx)}
                  disabled={tempRating === 0}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-[11px] font-semibold transition-colors",
                    tempRating > 0 ? "bg-amber-600 text-white hover:bg-amber-700" : "bg-zinc-100 text-zinc-300"
                  )}
                >
                  Skicka omdöme
                </button>
                <button
                  onClick={() => { setReviewingIdx(null); setTempRating(0); setTempReview(""); }}
                  className="px-3 py-1.5 rounded-md text-[11px] text-zinc-500 hover:bg-zinc-100 transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onOpenChat(visit.clinic)}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <MessageSquare className="w-3 h-3" /> Kontakta
            </button>
            <button
              onClick={() => onViewClinic(visit.clinicId)}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors ml-auto"
            >
              Klinikprofil <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
