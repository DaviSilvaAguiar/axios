import { useAuth } from "@/contexts/AuthContext";

export function useModulo() {
  const { modulosHabilitados } = useAuth();

  function temAcesso(slug: string): boolean {
    return modulosHabilitados.includes(slug);
  }

  return { temAcesso };
}
