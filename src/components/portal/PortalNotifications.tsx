import { cn } from "@/lib/utils";
import { ChevronRight, MessageSquare, CalendarCheck, AlertCircle } from "lucide-react";

interface Notification {
  id: number;
  text: string;
  time: string;
  unread: boolean;
  type: "message" | "booking" | "expiry";
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 1, text: "Folktandvården Vasastan har svarat på din förfrågan", time: "2 tim sedan", unread: true, type: "message" },
  { id: 2, text: "Din bokade tid hos Tandläkare Karin Olebratt är imorgon kl 10:00", time: "igår", unread: true, type: "booking" },
  { id: 3, text: "Påminnelse: Din förfrågan TK-2026-0791 har löpt ut", time: "3 dagar sedan", unread: false, type: "expiry" },
  { id: 4, text: "Ny offert från Aqua Dental Odenplan – 7 800 kr", time: "4 dagar sedan", unread: false, type: "message" },
];

const TYPE_ICONS = {
  message: MessageSquare,
  booking: CalendarCheck,
  expiry: AlertCircle,
};

const TYPE_COLORS = {
  message: "text-amber-500",
  booking: "text-emerald-500",
  expiry: "text-zinc-400",
};

export default function PortalNotifications() {
  return (
    <div className="space-y-1">
      {MOCK_NOTIFICATIONS.map((n) => {
        const Icon = TYPE_ICONS[n.type];
        return (
          <div
            key={n.id}
            className={cn(
              "flex items-start gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-colors",
              n.unread ? "bg-amber-50/60" : "hover:bg-zinc-50"
            )}
          >
            <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", TYPE_COLORS[n.type])} />
            <div className="flex-1 min-w-0">
              <p className={cn("text-xs leading-relaxed", n.unread ? "text-zinc-900 font-medium" : "text-zinc-500")}>
                {n.text}
              </p>
              <p className="text-[10px] text-zinc-400 mt-0.5">{n.time}</p>
            </div>
            {n.unread && <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />}
            <ChevronRight className="w-3.5 h-3.5 text-zinc-300 shrink-0 mt-1" />
          </div>
        );
      })}
    </div>
  );
}

export const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;
