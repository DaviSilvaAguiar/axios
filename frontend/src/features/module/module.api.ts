import { api } from "@/lib/api";
import { mapUserModules } from "./module.mapper";
import type { UserModulesResponse } from "./module.types";

export async function listUserModulesApi(id: number, signal?: AbortSignal): Promise<UserModulesResponse> {
  const raw = await api.get(`/v1/users/${id}/modules`, { signal });
  return mapUserModules(raw);
}

export async function updateUserModulesApi(id: number, modules: number[]): Promise<void> {
  await api.put(`/v1/users/${id}/modules`, { modules });
}
