import { api } from "@/lib/api";
import { mapConfig, mapListarConfigs } from "./config.mapper";
import type { Config, ListarConfigsResponse } from "./config.types";

export async function listarConfigsApi(): Promise<ListarConfigsResponse> {
  const raw = await api.get<unknown>("/v1/configs");
  return mapListarConfigs(raw);
}

export async function atualizarConfigApi(id: number, valor: number): Promise<Config> {
  const raw = await api.patch<unknown>(`/v1/configs/${id}`, { valor });
  return mapConfig(raw);
}
