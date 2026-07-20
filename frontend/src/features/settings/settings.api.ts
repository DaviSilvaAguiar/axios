import { api } from "@/lib/api";
import { mapConfig, mapListarSettings } from "./settings.mapper";
import type { Config, ListSettingsResponse } from "./settings.types";

export async function listSettingsApi(signal?: AbortSignal): Promise<ListSettingsResponse> {
  const raw = await api.get<unknown>("/v1/settings", { signal });
  return mapListarSettings(raw);
}

export async function updateConfigApi(id: number, value: number): Promise<Config> {
  const raw = await api.patch<unknown>(`/v1/settings/${id}`, { value });
  return mapConfig(raw);
}
