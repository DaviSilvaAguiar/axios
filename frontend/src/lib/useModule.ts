import { useAuth } from "@/contexts/AuthContext";

export function useModule() {
  const { enabledModules } = useAuth();

  function hasAccess(slug: string): boolean {
    return enabledModules.includes(slug);
  }

  return { hasAccess };
}
