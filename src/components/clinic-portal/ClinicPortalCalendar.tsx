import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Clock, User } from "lucide-react";

interface CalendarEvent {
  id: string;
  date: number; // day of month
  time: string;
  patient: string;
  treatment: string;
  type: "booked" | "tentative" | "blocked";
}

const MOCK_EVENTS: CalendarEvent[] = [
  { id: "1", date: 20, time: "09:00", patient: "AH", treatment: "Tandkrona porslin", type: "tentative" },
  { id: "2", date: 20, time: "14:00", patient: "ES", treatment: "Rotbehandling", type: "booked" },
  { id: "3", date: 22, time: "10:00", patient: "KJ", treatment: "Tandblekning", type: "booked" },
  { id: "4", date: 24, time: "08:30", patient: "ML", treatment: "Implantat konsultation", type: "tentative" },
  { id: "5", date: 25, time: "13:00", patient: "—", treatment: "Lunchpaus", type: "blocked" },
  { id: "6", date: 27, time: "09:00", patient: "BN", treatment: "Kontroll", type: "booked" },
];

const TYPE_STYLES: Record<CalendarEvent["type"], { dot: string; label: string }> = {
  booked: { dot: "bg-emerald-500", label: "Bokad" },
  tentative: { dot: "bg-amber-400", label: "Preliminär" },
  blocked: { dot: "bg-zinc-300", label: "Blockerad" },
};

const DAYS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

export default function ClinicPortalCalendar() {
  const [selectedDay, setSelectedDay] = useState<number | null>(20);
  const today = 19; // mock "today"

  // Generate a simple March 2026 grid (starts on Sunday → shift)
  // March 1 2026 = Sunday, so offset = 6 (Mon-based)
  const daysInMonth = 31;
  const startOffset = 6; // March 1, 2026 is Sunday → 6 in Mon-based

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const dayEvents = selectedDay ? MOCK_EVENTS.filter((e) => e.date === selectedDay) : [];

  return (
    <div className="space-y-4">
      {/* Month header */}
      <div className="flex items-center justify-between">
        <button className="p-1.5 rounded-full hover:bg-zinc-100 transition-colors">
          <ChevronLeft className="w-4 h-4 text-zinc-400" />
        </button>
        <h3 className="text-sm font-semibold text-zinc-900">Mars 2026</h3>
        <button className="p-1.5 rounded-full hover:bg-zinc-100 transition-colors">
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white border border-zinc-200 rounded-xl p-3">
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-medium text-zinc-400 py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const hasEvents = MOCK_EVENTS.some((e) => e.date === day);
            const isToday = day === today;
            const isSelected = day === selectedDay;
            const isPast = day < today;

            return (
              <button
                key={i}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "relative w-full aspect-square flex items-center justify-center rounded-lg text-xs transition-all",
                  isSelected
                    ? "bg-amber-600 text-white font-bold"
                    : isToday
                    ? "bg-amber-50 text-amber-700 font-semibold ring-1 ring-amber-300"
                    : isPast
                    ? "text-zinc-300"
                    : "text-zinc-700 hover:bg-zinc-50"
                )}
              >
                {day}
                {hasEvents && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4">
        {(Object.entries(TYPE_STYLES) as [CalendarEvent["type"], typeof TYPE_STYLES["booked"]][]).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", val.dot)} />
            <span className="text-[10px] text-zinc-400">{val.label}</span>
          </div>
        ))}
      </div>

      {/* Events for selected day */}
      {selectedDay && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            {selectedDay} mars
          </p>
          {dayEvents.length === 0 ? (
            <div className="bg-zinc-50 rounded-lg p-4 text-center">
              <p className="text-xs text-zinc-400">Inga bokningar denna dag</p>
            </div>
          ) : (
            dayEvents.map((ev) => {
              const style = TYPE_STYLES[ev.type];
              return (
                <div key={ev.id} className="bg-white border border-zinc-200 rounded-lg p-3 flex items-center gap-3">
                  <div className={cn("w-1 h-8 rounded-full", style.dot)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-900">{ev.treatment}</span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[9px] font-medium",
                        ev.type === "booked" ? "bg-emerald-50 text-emerald-600" :
                        ev.type === "tentative" ? "bg-amber-50 text-amber-600" :
                        "bg-zinc-100 text-zinc-400"
                      )}>
                        {style.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-400">
                      <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {ev.time}</span>
                      <span className="flex items-center gap-0.5"><User className="w-2.5 h-2.5" /> {ev.patient}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
