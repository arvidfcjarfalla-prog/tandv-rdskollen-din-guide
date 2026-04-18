import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type AppRole } from "@/hooks/useAuth";

interface Props {
  children: ReactNode;
  requireRole?: AppRole;
  redirectTo?: string;
}

export function ProtectedRoute({ children, requireRole, redirectTo }: Props) {
  const { user, roles, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-secondary text-sm">Laddar…</div>
      </div>
    );
  }

  if (!user) {
    const target = redirectTo ?? (requireRole === "clinic" ? "/klinik/login" : "/auth");
    return <Navigate to={target} state={{ from: location }} replace />;
  }

  if (requireRole && !roles.includes(requireRole) && !roles.includes("admin")) {
    return (
      <div className="min-h-screen pt-[120px] px-6">
        <div className="max-w-md mx-auto bg-bg-elevated border border-border rounded-2xl p-8 text-center">
          <h2 className="font-display text-xl text-text-primary mb-2">Åtkomst nekad</h2>
          <p className="text-sm text-text-secondary">
            Detta område är endast tillgängligt för {requireRole === "clinic" ? "kliniker" : requireRole}.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
