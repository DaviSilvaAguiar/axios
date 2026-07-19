"use client";

import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "@/features/dashboard/components/AdminDashboard";

export default function Page() {
  const { usuario } = useAuth();

  // Prestador não tem acesso ao painel administrativo
  if (usuario?.perfil === 3) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-app-border bg-app-surface p-8 text-center">
          <p className="text-feature-title text-app-text">Acesso restrito</p>
          <p className="text-body-sm text-app-text-muted mt-2">
            Este painel é exclusivo para auditores e administradores.
          </p>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}
