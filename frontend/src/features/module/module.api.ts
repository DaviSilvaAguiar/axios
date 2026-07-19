import { api } from "@/lib/api";
import { mapModulosUser } from "./module.mapper";
import type { ModulosUserResponse } from "./module.types";

export async function listModulosUserApi(id: number): Promise<ModulosUserResponse> {
  const raw = await api.get(`/v1/users/${id}/modules`);
  return mapModulosUser(raw);
}

export async function updateModulosUserApi(id: number, modules: number[]): Promise<void> {
  await api.put(`/v1/users/${id}/modules`, { modules });
}
