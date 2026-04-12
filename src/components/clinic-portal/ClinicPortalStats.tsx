import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Nya förfrågningar", value: "2", change: "+1 idag", trend: "up" as const, icon: Clock, color: "text-sky-600 bg-sky-50" },
  { label: "Skickade offerter", value: "8", change: "denna månad", trend: "up" as const, icon: MessageSquare, color: "text-amber-600 bg-amber-50" },
  { label: "Accepterade", value: "5", change: "63% accept", trend: "up" as const, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
  { label: "Avböjda", value: "2", change: "25% avböjd", trend: "down" as const, icon: XCircle, color: "text-zinc-500 bg-zinc-100" },
];

export default function ClinicPortalStats() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-white border border-zinc-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", s.color)}>
              <s.icon className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold text-zinc-900">{s.value}</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">{s.label}</p>
          <div className="flex items-center gap-1 mt-1">
            {s.trend === "up" ? (
              <TrendingUp className="w-3 h-3 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-zinc-400" />
            )}
            <span className="text-[10px] text-zinc-400">{s.change}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
