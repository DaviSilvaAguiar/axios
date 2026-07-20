import { api } from "@/lib/api";
import { buildPageQuery, type Paginated, PAGE_SIZE } from "@/lib/pagination";
import { mapPendingDocuments, mapPendingStats, mapHistorico } from "./export.mapper";
import type { PendingDocument, BatchHistory, PendingStats } from "./export.types";

export async function getPendingExpenseReportsApi(
  page: number = 1,
  perPage: number = PAGE_SIZE,
  signal?: AbortSignal
): Promise<Paginated<PendingDocument>> {
  const raw = await api.get<unknown>(`/v1/export/pending/expense-reports${buildPageQuery(page, perPage)}`, { signal });
  return mapPendingDocuments(raw);
}

export async function getPendingReimbursementsApi(
  page: number = 1,
  perPage: number = PAGE_SIZE,
  signal?: AbortSignal
): Promise<Paginated<PendingDocument>> {
  const raw = await api.get<unknown>(`/v1/export/pending/reimbursements${buildPageQuery(page, perPage)}`, { signal });
  return mapPendingDocuments(raw);
}

export async function obterPendingStatsApi(signal?: AbortSignal): Promise<PendingStats> {
  const raw = await api.get<unknown>("/v1/export/pending/stats", { signal });
  return mapPendingStats(raw);
}

export async function obterHistoricoApi(
  page: number = 1,
  perPage: number = PAGE_SIZE,
  signal?: AbortSignal
): Promise<Paginated<BatchHistory>> {
  const raw = await api.get<unknown>(`/v1/export/history${buildPageQuery(page, perPage)}`, { signal });
  return mapHistorico(raw);
}
