"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { listSettingsApi } from "@/features/settings/settings.api";
import type { Config } from "@/features/settings/settings.types";

interface SettingsContextValue {
  configs: Config[];
  loading: boolean;
  reload: () => Promise<void>;
  isEnabled: (parametro: string) => boolean;
}

const ConfigContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [configs, setSettings] = useState<Config[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listSettingsApi();
      setSettings(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setSettings([]);
      return;
    }
    reload().catch(() => {});
  }, [user, reload]);

  const isEnabled = useCallback(
    (param: string) => configs.some((c) => c.parameter === param && c.value === 1),
    [configs],
  );

  return (
    <ConfigContext.Provider value={{ configs, loading, reload, isEnabled }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useSettings must be used within <SettingsProvider>");
  return ctx;
}
