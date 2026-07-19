"use client";

import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "@/features/dashboard/components/AdminDashboard";

export default function Page() {
  const { user } = useAuth();

  if (user?.role === 3) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-app-border bg-app-surface p-8 text-center">
          <p className="text-feature-title text-app-text">Restricted access</p>
          <p className="text-body-sm text-app-text-muted mt-2">
            This panel is exclusive to auditors and administrators.
          </p>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}
