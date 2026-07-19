"use client";

import { type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/ui/Loading";
import NoAccess from "@/ui/NoAccess";

interface ModuleGuardProps {
  slug: string;
  children: ReactNode;
}

export default function ModuleGuard({ slug, children }: ModuleGuardProps) {
  const { isLoading, isAuthenticated, hasModule } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!hasModule(slug)) {
    return <NoAccess />;
  }

  return <>{children}</>;
}
