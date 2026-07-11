import { api } from "@/lib/api";
import { buildPageQuery, type Paginated, PAGE_SIZE } from "@/lib/pagination";
import { mapPendentesPaginados, mapStatsPendentes, mapHistorico } from "./exportacao.mapper";
import type { DocumentoPendente, LoteHistorico, StatsPendentes } from "./exportacao.types";

export async function obterCaixasPendentesApi(
  page: number = 1,
  perPage: number = PAGE_SIZE
): Promise<Paginated<DocumentoPendente>> {
  const raw = await api.get<unknown>(`/v1/exportacao/pendentes/caixas${buildPageQuery(page, perPage)}`);
  return mapPendentesPaginados(raw);
}

export async function obterRcmsPendentesApi(
  page: number = 1,
  perPage: number = PAGE_SIZE
): Promise<Paginated<DocumentoPendente>> {
  const raw = await api.get<unknown>(`/v1/exportacao/pendentes/rcms${buildPageQuery(page, perPage)}`);
  return mapPendentesPaginados(raw);
}

export async function obterStatsPendentesApi(): Promise<StatsPendentes> {
  const raw = await api.get<unknown>("/v1/exportacao/pendentes/stats");
  return mapStatsPendentes(raw);
}

export async function obterHistoricoApi(
  page: number = 1,
  perPage: number = PAGE_SIZE
): Promise<Paginated<LoteHistorico>> {
  const raw = await api.get<unknown>(`/v1/exportacao/historico${buildPageQuery(page, perPage)}`);
  return mapHistorico(raw);
}
