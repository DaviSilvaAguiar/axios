import { api } from "@/lib/api";
import { buildPageQuery, type Paginated, PAGE_SIZE } from "@/lib/pagination";
import {
  mapCentroDeCustoResponse,
  mapListarCentrosDeCusto,
} from "./centro-de-custo.mapper";
import type {
  CentroDeCusto,
  CentroDeCustoFormData,
  CentroDeCustoResponse,
} from "./centro-de-custo.types";

export async function listarCentrosDeCustoApi(
  page: number = 1,
  perPage: number = PAGE_SIZE
): Promise<Paginated<CentroDeCusto>> {
  const raw = await api.get<unknown>(`/v1/centro-custo${buildPageQuery(page, perPage)}`);
  return mapListarCentrosDeCusto(raw);
}

export async function buscarCentroDeCustoApi(id: number): Promise<CentroDeCusto> {
  const raw = await api.get<unknown>(`/v1/centro-custo/${id}`);
  return mapCentroDeCustoResponse(raw).centro_custo;
}

export async function criarCentroDeCustoApi(
  dados: CentroDeCustoFormData
): Promise<CentroDeCustoResponse> {
  const raw = await api.post<unknown>("/v1/centro-custo", dados);
  return mapCentroDeCustoResponse(raw);
}

export async function atualizarCentroDeCustoApi(
  id: number,
  dados: Partial<CentroDeCustoFormData>
): Promise<CentroDeCustoResponse> {
  const raw = await api.put<unknown>(`/v1/centro-custo/${id}`, dados);
  return mapCentroDeCustoResponse(raw);
}

export async function deletarCentroDeCustoApi(id: number): Promise<void> {
  await api.delete(`/v1/centro-custo/${id}`);
}
