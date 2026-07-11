"use client";

import { type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/ui/Loading";
import SemAcesso from "@/ui/SemAcesso";

interface ModuloGuardProps {
  slug: string;
  children: ReactNode;
}

export default function ModuloGuard({ slug, children }: ModuloGuardProps) {
  const { isLoading, isAuthenticated, temModulo } = useAuth();

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

  if (!temModulo(slug)) {
    return <SemAcesso />;
  }

  return <>{children}</>;
}
