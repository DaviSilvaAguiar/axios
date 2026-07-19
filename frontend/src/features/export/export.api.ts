import { api } from "@/lib/api";
import { buildPageQuery, type Paginated, PAGE_SIZE } from "@/lib/pagination";
import { mapPendingDocuments, mapPendingStats, mapHistorico } from "./export.mapper";
import type { PendingDocument, BatchHistory, PendingStats } from "./export.types";

export async function getPendingExpenseReportsApi(
  page: number = 1,
  perPage: number = PAGE_SIZE
): Promise<Paginated<PendingDocument>> {
  const raw = await api.get<unknown>(`/v1/export/pending/expense-reports${buildPageQuery(page, perPage)}`);
  return mapPendingDocuments(raw);
}

export async function getPendingReimbursementsApi(
  page: number = 1,
  perPage: number = PAGE_SIZE
): Promise<Paginated<PendingDocument>> {
  const raw = await api.get<unknown>(`/v1/export/pending/reimbursements${buildPageQuery(page, perPage)}`);
  return mapPendingDocuments(raw);
}

export async function obterPendingStatsApi(): Promise<PendingStats> {
  const raw = await api.get<unknown>("/v1/export/pending/stats");
  return mapPendingStats(raw);
}

export async function obterHistoricoApi(
  page: number = 1,
  perPage: number = PAGE_SIZE
): Promise<Paginated<BatchHistory>> {
  const raw = await api.get<unknown>(`/v1/export/history${buildPageQuery(page, perPage)}`);
  return mapHistorico(raw);
}
