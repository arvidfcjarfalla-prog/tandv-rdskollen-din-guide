import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function AuthPage() {
  usePageTitle("Logga in");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, roles, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">(
    params.get("mode") === "signup" ? "signup" : "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect signed-in user
  useEffect(() => {
    if (authLoading || !user) return;
    if (roles.includes("clinic")) navigate("/klinikportal", { replace: true });
    else navigate("/mina-sidor", { replace: true });
  }, [user, roles, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName, phone },
          },
        });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err: any) {
      setError(err.message || "Något gick fel");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setError(null);
    const { error: err } = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    if (err) setError(err.message);
  };

  return (
    <div className="min-h-screen pt-[120px] pb-16 px-6 bg-bg-base">
      <div className="max-w-md mx-auto">
        <div className="bg-bg-elevated border border-border rounded-2xl p-8 shadow-sm">
          <h1 className="font-display text-2xl text-text-primary mb-2">
            {mode === "login" ? "Välkommen tillbaka" : "Skapa konto"}
          </h1>
          <p className="text-sm text-text-secondary mb-6">
            {mode === "login"
              ? "Logga in för att se dina prisförslag"
              : "Skapa ett patientkonto för att begära offerter"}
          </p>

          {/* Social */}
          <div className="space-y-2 mb-5">
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              className="w-full flex items-center justify-center gap-2 border border-border rounded-md py-2.5 text-sm font-medium hover:bg-bg-sunken transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3c-2 1.4-4.5 2.5-7.3 2.5-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.3 5.3C41.8 35.7 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>
              Fortsätt med Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("apple")}
              className="w-full flex items-center justify-center gap-2 border border-border rounded-md py-2.5 text-sm font-medium hover:bg-bg-sunken transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12.5c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.9-.8-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.5.8 1.1 1.7 2.4 3 2.4 1.2-.1 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.1-1.1 2.9-2.3.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.5-1-2.8-3.9zM14.3 5.5c.7-.8 1.1-1.9 1-3-1 .1-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4z"/></svg>
              Fortsätt med Apple
            </button>
          </div>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-tertiary">eller</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <>
                <Field label="Fullständigt namn">
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full p-[10px_14px] border-[1.5px] border-border rounded-md text-sm focus:outline-none focus:border-border-focus"
                  />
                </Field>
                <Field label="Telefon (valfritt)">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-[10px_14px] border-[1.5px] border-border rounded-md text-sm focus:outline-none focus:border-border-focus"
                  />
                </Field>
              </>
            )}
            <Field label="E-post">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-[10px_14px] border-[1.5px] border-border rounded-md text-sm focus:outline-none focus:border-border-focus"
              />
            </Field>
            <Field label="Lösenord">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full p-[10px_14px] border-[1.5px] border-border rounded-md text-sm focus:outline-none focus:border-border-focus"
              />
            </Field>

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
              {loading ? "Vänta…" : mode === "login" ? "Logga in" : "Skapa konto"}
            </button>
          </form>

          <div className="text-center mt-5 text-sm text-text-secondary">
            {mode === "login" ? (
              <>
                Saknar du konto?{" "}
                <button onClick={() => setMode("signup")} className="text-accent font-medium hover:underline">
                  Skapa konto
                </button>
              </>
            ) : (
              <>
                Har du redan ett konto?{" "}
                <button onClick={() => setMode("login")} className="text-accent font-medium hover:underline">
                  Logga in
                </button>
              </>
            )}
          </div>

          <div className="text-center mt-4 pt-4 border-t border-border">
            <Link to="/klinik/login" className="text-xs text-text-tertiary hover:text-text-secondary">
              Är du tandläkarklinik? Logga in här →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold text-text-secondary tracking-[0.06em] mb-1.5 uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}
