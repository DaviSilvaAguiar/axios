import { api } from "@/lib/api";
import { buildPageQuery, type Paginated, PAGE_SIZE } from "@/lib/pagination";
import {
  mapCategoriaDespesaResponse,
  mapListarCategoriasDespesa,
} from "./categoria-despesa.mapper";
import type {
  CategoriaDespesa,
  CategoriaDespesaFormData,
  CategoriaDespesaResponse,
} from "./categoria-despesa.types";

export async function listarCategoriasDespesaApi(
  page: number = 1,
  perPage: number = PAGE_SIZE
): Promise<Paginated<CategoriaDespesa>> {
  const raw = await api.get<unknown>(`/v1/categoria-despesa${buildPageQuery(page, perPage)}`);
  return mapListarCategoriasDespesa(raw);
}

export async function buscarCategoriaDespesaApi(id: number): Promise<CategoriaDespesa> {
  const raw = await api.get<unknown>(`/v1/categoria-despesa/${id}`);
  return mapCategoriaDespesaResponse(raw).categoria_despesa;
}

export async function criarCategoriaDespesaApi(
  dados: CategoriaDespesaFormData
): Promise<CategoriaDespesaResponse> {
  const raw = await api.post<unknown>("/v1/categoria-despesa", dados);
  return mapCategoriaDespesaResponse(raw);
}

export async function atualizarCategoriaDespesaApi(
  id: number,
  dados: Partial<CategoriaDespesaFormData>
): Promise<CategoriaDespesaResponse> {
  const raw = await api.put<unknown>(`/v1/categoria-despesa/${id}`, dados);
  return mapCategoriaDespesaResponse(raw);
}

export async function deletarCategoriaDespesaApi(id: number): Promise<void> {
  await api.delete(`/v1/categoria-despesa/${id}`);
}
