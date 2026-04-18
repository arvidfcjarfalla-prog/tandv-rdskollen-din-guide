import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function ClinicAuthPage() {
  usePageTitle("Logga in – Klinik");
  const navigate = useNavigate();
  const { user, roles, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    if (roles.includes("clinic") || roles.includes("admin")) {
      navigate("/klinikportal", { replace: true });
    } else if (roles.length > 0) {
      setError("Detta konto är inte registrerat som klinik. Kontakta admin.");
    }
  }, [user, roles, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-[120px] pb-16 px-6 bg-bg-base">
      <div className="max-w-md mx-auto">
        <div className="bg-bg-elevated border border-border rounded-2xl p-8 shadow-sm">
          <div className="inline-block bg-accent-soft text-accent text-[11px] font-semibold tracking-[0.08em] uppercase rounded-full px-3 py-1 mb-3">
            Klinikportal
          </div>
          <h1 className="font-display text-2xl text-text-primary mb-2">Logga in som klinik</h1>
          <p className="text-sm text-text-secondary mb-6">
            Hantera förfrågningar, skicka offerter och kommunicera med patienter.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="block text-[11px] font-semibold text-text-secondary tracking-[0.06em] mb-1.5 uppercase">
                E-post
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-[10px_14px] border-[1.5px] border-border rounded-md text-sm focus:outline-none focus:border-border-focus"
              />
            </label>
            <label className="block">
              <span className="block text-[11px] font-semibold text-text-secondary tracking-[0.06em] mb-1.5 uppercase">
                Lösenord
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-[10px_14px] border-[1.5px] border-border rounded-md text-sm focus:outline-none focus:border-border-focus"
              />
            </label>

            {error && (
              <div className="bg-danger/10 border border-danger/30 text-danger text-xs rounded-md p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white rounded-md py-3 text-sm font-semibold transition-colors"
            >
              {loading ? "Vänta…" : "Logga in"}
            </button>
          </form>

          <div className="mt-5 text-xs text-text-tertiary bg-bg-sunken rounded-md p-3 leading-relaxed">
            <strong className="text-text-secondary">Inget klinikkonto?</strong> Klinikkonton skapas
            endast av administratör. Kontakta oss på{" "}
            <a href="mailto:partner@tandkollen.se" className="text-accent hover:underline">
              partner@tandkollen.se
            </a>{" "}
            för att ansluta din klinik.
          </div>

          <div className="text-center mt-4 pt-4 border-t border-border">
            <Link to="/auth" className="text-xs text-text-tertiary hover:text-text-secondary">
              ← Är du patient? Logga in här
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
