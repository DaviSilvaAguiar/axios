import { api } from "@/lib/api";
import { buildPageQuery, type Paginated, PAGE_SIZE } from "@/lib/pagination";
import {
  mapContaBancariaResponse,
  mapListarContasBancarias,
} from "./conta-bancaria.mapper";
import type {
  ContaBancaria,
  ContaBancariaFormData,
  ContaBancariaResponse,
} from "./conta-bancaria.types";

export async function listarContasBancariasApi(
  page: number = 1,
  perPage: number = PAGE_SIZE
): Promise<Paginated<ContaBancaria>> {
  const raw = await api.get<unknown>(`/v1/conta-bancaria${buildPageQuery(page, perPage)}`);
  return mapListarContasBancarias(raw);
}

export async function buscarContaBancariaApi(id: number): Promise<ContaBancaria> {
  const raw = await api.get<unknown>(`/v1/conta-bancaria/${id}`);
  return mapContaBancariaResponse(raw).conta_bancaria;
}

export async function criarContaBancariaApi(
  dados: ContaBancariaFormData
): Promise<ContaBancariaResponse> {
  const raw = await api.post<unknown>("/v1/conta-bancaria", dados);
  return mapContaBancariaResponse(raw);
}

export async function atualizarContaBancariaApi(
  id: number,
  dados: Partial<ContaBancariaFormData>
): Promise<ContaBancariaResponse> {
  const raw = await api.put<unknown>(`/v1/conta-bancaria/${id}`, dados);
  return mapContaBancariaResponse(raw);
}

export async function deletarContaBancariaApi(id: number): Promise<void> {
  await api.delete(`/v1/conta-bancaria/${id}`);
}
