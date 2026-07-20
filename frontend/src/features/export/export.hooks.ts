"use client";

import { useQuery } from "@tanstack/react-query";
import { useInfiniteList } from "@/lib/useInfiniteList";
import { queryKeys } from "@/lib/queryKeys";
import {
  getPendingExpenseReportsApi,
  getPendingReimbursementsApi,
  obterPendingStatsApi,
  obterHistoricoApi,
} from "./export.api";
import type { PendingDocument, BatchHistory } from "./export.types";

export function usePendingStats() {
  return useQuery({
    queryKey: queryKeys.export.pendingStats,
    queryFn: ({ signal }) => obterPendingStatsApi(signal),
  });
}

export function usePendingExpenseReports() {
  return useInfiniteList<PendingDocument>(
    queryKeys.export.pendingExpenseReports,
    (page, perPage, signal) => getPendingExpenseReportsApi(page, perPage, signal),
  );
}

export function usePendingReimbursements() {
  return useInfiniteList<PendingDocument>(
    queryKeys.export.pendingReimbursements,
    (page, perPage, signal) => getPendingReimbursementsApi(page, perPage, signal),
  );
}

export function useExportHistory() {
  return useInfiniteList<BatchHistory>(
    queryKeys.export.history,
    (page, perPage, signal) => obterHistoricoApi(page, perPage, signal),
  );
}
