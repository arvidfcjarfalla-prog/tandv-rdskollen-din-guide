import { User, Mail, Phone, MapPin, Clock, LogOut } from "lucide-react";

const MOCK_USER = {
  name: "Anna Lindström",
  email: "anna.lindstrom@gmail.com",
  phone: "070-123 45 67",
  postalCode: "114 32",
  birthYear: 1985,
  memberSince: "mars 2026",
};

function ProfileRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
      <div className="flex-1 flex justify-between">
        <span className="text-xs text-zinc-500">{label}</span>
        <span className="text-xs text-zinc-900 font-medium">{value}</span>
      </div>
    </div>
  );
}

export { MOCK_USER };

export default function PortalProfile() {
  return (
    <div className="space-y-5">
      {/* Personal info */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <h3 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">Personuppgifter</h3>
        <div className="space-y-3">
          <ProfileRow icon={User} label="Namn" value={MOCK_USER.name} />
          <ProfileRow icon={Mail} label="E-post" value={MOCK_USER.email} />
          <ProfileRow icon={Phone} label="Telefon" value={MOCK_USER.phone} />
          <ProfileRow icon={MapPin} label="Postnummer" value={MOCK_USER.postalCode} />
          <ProfileRow icon={Clock} label="Födelseår" value={String(MOCK_USER.birthYear)} />
        </div>
        <button className="mt-4 text-xs font-medium text-amber-700 hover:text-amber-800 transition-colors">
          Redigera uppgifter
        </button>
      </div>

      {/* Dental */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <h3 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">Tandvårdsprofil</h3>
        <div className="space-y-2.5">
          {[
            ["Högkostnadsskydd", "Under 3 000 kr (100% egeninsats)"],
            ["Åldersgrupp", "24–65 år (300 kr/år i bidrag)"],
            ["Blodförtunnande", "Nej"],
            ["Diabetes", "Nej"],
            ["Allergier", "Nej"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs">
              <span className="text-zinc-500">{k}</span>
              <span className="text-zinc-900 font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <h3 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">Statistik</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            ["3", "Förfrågningar"],
            ["9", "Offerter"],
            ["12 400 kr", "Sparat"],
          ].map(([val, label]) => (
            <div key={label} className="text-center">
              <div className="font-semibold text-lg text-zinc-900">{val}</div>
              <div className="text-[10px] text-zinc-400">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <button className="flex items-center gap-2 text-xs text-zinc-400 hover:text-red-500 transition-colors">
        <LogOut className="w-3.5 h-3.5" />
        Logga ut
      </button>
    </div>
  );
}
