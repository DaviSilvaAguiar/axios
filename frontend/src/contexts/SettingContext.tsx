"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/queryKeys";
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

  const settingsQuery = useQuery({
    queryKey: queryKeys.settings,
    queryFn: ({ signal }) => listSettingsApi(signal),
    enabled: Boolean(user),
  });

  const configs = useMemo(() => settingsQuery.data ?? [], [settingsQuery.data]);

  const { refetch } = settingsQuery;
  const reload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const isEnabled = useCallback(
    (param: string) => configs.some((c) => c.parameter === param && c.value === 1),
    [configs],
  );

  return (
    <ConfigContext.Provider
      value={{ configs, loading: settingsQuery.isLoading, reload, isEnabled }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useSettings must be used within <SettingsProvider>");
  return ctx;
}
