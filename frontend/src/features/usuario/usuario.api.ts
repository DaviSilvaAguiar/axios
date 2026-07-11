import { api } from "@/lib/api";
import { buildPageQuery, type Paginated, PAGE_SIZE } from "@/lib/pagination";
import { mapListarUsuarios, mapUsuarioResponse } from "./usuario.mapper";
import type {
  CriarUsuarioFormData,
  EditarUsuarioFormData,
  Usuario,
  UsuarioResponse,
} from "./usuario.types";

export async function listarUsuariosApi(
  page: number = 1,
  perPage: number = PAGE_SIZE
): Promise<Paginated<Usuario>> {
  const raw = await api.get<unknown>(`/v1/usuarios${buildPageQuery(page, perPage)}`);
  return mapListarUsuarios(raw);
}

export async function buscarUsuarioApi(id: number): Promise<Usuario> {
  const raw = await api.get<unknown>(`/v1/usuarios/${id}`);
  return mapUsuarioResponse(raw).usuario;
}

export async function criarUsuarioApi(dados: CriarUsuarioFormData): Promise<UsuarioResponse> {
  const raw = await api.post<unknown>("/v1/usuarios", dados);
  return mapUsuarioResponse(raw);
}

export async function atualizarUsuarioApi(
  id: number,
  dados: EditarUsuarioFormData
): Promise<UsuarioResponse> {
  const payload: Partial<EditarUsuarioFormData> = { ...dados };
  if (!payload.senha) delete payload.senha;

  const raw = await api.put<unknown>(`/v1/usuarios/${id}`, payload);
  return mapUsuarioResponse(raw);
}

export async function deletarUsuarioApi(id: number): Promise<void> {
  await api.delete(`/v1/usuarios/${id}`);
}
