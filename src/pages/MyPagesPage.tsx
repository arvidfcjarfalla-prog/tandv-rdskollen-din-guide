import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { FileText, Bell, User, History } from "lucide-react";
import PortalRequestsList, { MOCK_REQUESTS } from "@/components/portal/PortalRequestsList";
import PortalNotifications, { unreadCount } from "@/components/portal/PortalNotifications";
import PortalProfile from "@/components/portal/PortalProfile";
import PortalClinicHistory from "@/components/portal/PortalClinicHistory";
import PortalChat from "@/components/portal/PortalChat";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type Tab = "requests" | "clinics" | "notifications" | "profile";

export default function MyPagesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("requests");
  const [chatClinic, setChatClinic] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ full_name: string | null; created_at: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, created_at")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data as any));
  }, [user]);

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Användare";
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("sv-SE", { month: "long", year: "numeric" })
    : "—";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const offersCount = MOCK_REQUESTS.filter((r) => r.status === "offers").length;

  const tabs: { key: Tab; label: string; icon: typeof FileText; badge: number }[] = [
    { key: "requests", label: "Förfrågningar", icon: FileText, badge: offersCount },
    { key: "clinics", label: "Historik", icon: History, badge: 0 },
    { key: "notifications", label: "Notiser", icon: Bell, badge: unreadCount },
    { key: "profile", label: "Profil", icon: User, badge: 0 },
  ];

  const handleViewClinic = (clinicId: string) => {
    navigate(`/clinic/${clinicId}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-2xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-semibold text-xl text-zinc-900">{displayName}</h1>
            <p className="text-xs text-zinc-400">Medlem sedan {memberSince}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
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
              {badge > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white leading-none">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "requests" && (
          <PortalRequestsList onOpenChat={setChatClinic} onViewClinic={handleViewClinic} />
        )}
        {tab === "clinics" && (
          <PortalClinicHistory onViewClinic={handleViewClinic} onOpenChat={setChatClinic} />
        )}
        {tab === "notifications" && <PortalNotifications />}
        {tab === "profile" && <PortalProfile />}
      </div>

      {/* Chat overlay */}
      <PortalChat clinicName={chatClinic} onClose={() => setChatClinic(null)} />
    </div>
  );
}
