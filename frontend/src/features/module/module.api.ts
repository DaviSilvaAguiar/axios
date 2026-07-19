import { api } from "@/lib/api";
import { mapModulosUsuario } from "./modulo.mapper";
import type { ModulosUsuarioResponse } from "./modulo.types";

export async function listarModulosUsuarioApi(id: number): Promise<ModulosUsuarioResponse> {
  const raw = await api.get(`/v1/usuarios/${id}/modulos`);
  return mapModulosUsuario(raw);
}

export async function atualizarModulosUsuarioApi(id: number, modulos: number[]): Promise<void> {
  await api.put(`/v1/usuarios/${id}/modulos`, { modulos });
}
