"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { listarConfigsApi } from "@/features/config/config.api";
import type { Config } from "@/features/config/config.types";

interface ConfigContextValue {
  configs: Config[];
  loading: boolean;
  recarregar: () => Promise<void>;
  isHabilitada: (parametro: string) => boolean;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(false);

  const recarregar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarConfigsApi();
      setConfigs(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!usuario) {
      setConfigs([]);
      return;
    }
    recarregar().catch(() => {});
  }, [usuario, recarregar]);

  const isHabilitada = useCallback(
    (parametro: string) => configs.some((c) => c.parametro === parametro && c.valor === 1),
    [configs],
  );

  return (
    <ConfigContext.Provider value={{ configs, loading, recarregar, isHabilitada }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfigs(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfigs precisa estar dentro de <ConfigProvider>");
  return ctx;
}
