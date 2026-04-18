import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Inbox, BarChart3, CalendarDays, Settings } from "lucide-react";
import ClinicPortalInbox from "@/components/clinic-portal/ClinicPortalInbox";
import ClinicPortalChat from "@/components/clinic-portal/ClinicPortalChat";
import ClinicPortalStats from "@/components/clinic-portal/ClinicPortalStats";
import ClinicPortalCalendar from "@/components/clinic-portal/ClinicPortalCalendar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type Tab = "inbox" | "stats" | "calendar" | "settings";

export default function ClinicPortalPage() {
  const { clinicId } = useAuth();
  const [tab, setTab] = useState<Tab>("inbox");
  const [chatRequest, setChatRequest] = useState<{ requestId: string; patientInitials: string } | null>(null);
  const [clinic, setClinic] = useState<{ name: string; address: string | null; phone: string | null; email: string | null } | null>(null);

  useEffect(() => {
    if (!clinicId) return;
    supabase
      .from("clinics")
      .select("name, address, phone, email")
      .eq("id", clinicId)
      .maybeSingle()
      .then(({ data }) => setClinic(data as any));
  }, [clinicId]);

  const clinicName = clinic?.name || "Min klinik";
  const initials = clinicName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const tabs: { key: Tab; label: string; icon: typeof Inbox; badge?: number }[] = [
    { key: "inbox", label: "Inkorg", icon: Inbox, badge: 2 },
    { key: "stats", label: "Översikt", icon: BarChart3 },
    { key: "calendar", label: "Kalender", icon: CalendarDays },
    { key: "settings", label: "Inställningar", icon: Settings },
  ];

  const handleOpenChat = (requestId: string, patientInitials: string) => {
    setChatRequest({ requestId, patientInitials });
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-2xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-semibold text-xl text-zinc-900">{clinicName}</h1>
            <p className="text-xs text-zinc-400">Klinikportal · Anbudshantering</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-white flex items-center justify-center text-sm font-bold shadow-sm">
            {initials}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-zinc-200 overflow-x-auto scrollbar-hide">
          {tabs.map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
                tab === key ? "text-zinc-900 border-amber-500" : "text-zinc-400 border-transparent hover:text-zinc-600"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {badge && badge > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white leading-none">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "inbox" && <ClinicPortalInbox onOpenChat={handleOpenChat} />}
        {tab === "stats" && <ClinicPortalStats />}
        {tab === "calendar" && <ClinicPortalCalendar />}
        {tab === "settings" && (
          <div className="space-y-4">
            <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-zinc-900">Klinikinformation</h3>
              <div className="grid gap-3">
                <div>
                  <label className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Kliniknamn</label>
                  <input defaultValue={clinicName} className="w-full mt-1 text-xs bg-zinc-50 rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-amber-200 border border-zinc-200" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Adress</label>
                  <input defaultValue="Sveavägen 52, 113 59 Stockholm" className="w-full mt-1 text-xs bg-zinc-50 rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-amber-200 border border-zinc-200" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Telefon</label>
                  <input defaultValue="08-123 456 78" className="w-full mt-1 text-xs bg-zinc-50 rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-amber-200 border border-zinc-200" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">E-post</label>
                  <input defaultValue="info@dtv-sveavagen.se" className="w-full mt-1 text-xs bg-zinc-50 rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-amber-200 border border-zinc-200" />
                </div>
              </div>
              <button className="px-4 py-2 rounded-md bg-zinc-900 text-white text-[11px] font-semibold hover:bg-zinc-800 transition-colors">
                Spara ändringar
              </button>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-zinc-900">Notifikationer</h3>
              <div className="space-y-2">
                {["Nya förfrågningar", "Accepterade offerter", "Meddelanden från patienter"].map((item) => (
                  <label key={item} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-zinc-300 text-amber-600 focus:ring-amber-200" />
                    <span className="text-xs text-zinc-700">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat overlay */}
      <ClinicPortalChat
        requestId={chatRequest?.requestId ?? null}
        patientInitials={chatRequest?.patientInitials ?? null}
        onClose={() => setChatRequest(null)}
      />
    </div>
  );
}
