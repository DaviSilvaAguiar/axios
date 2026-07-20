"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { listExpenseReportsApi, getExpenseReportApi } from "./expense-report.api";
import type { ExpenseReport } from "./expense-report.types";

export function useExpenseReports() {
  return useQuery({
    queryKey: queryKeys.expenseReports.list,
    queryFn: ({ signal }) => listExpenseReportsApi(signal),
  });
}

export function useExpenseReport(id: number | null) {
  return useQuery({
    queryKey: queryKeys.expenseReports.detail(id ?? 0),
    queryFn: ({ signal }) => getExpenseReportApi(id as number, signal),
    enabled: id !== null && Number.isFinite(id),
  });
}

export function useExpenseReportActions() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.expenseReports.all });

  const patchInList = (id: number, patch: Partial<ExpenseReport>) =>
    queryClient.setQueryData<ExpenseReport[]>(queryKeys.expenseReports.list, (old) =>
      old ? old.map((r) => (r.id === id ? { ...r, ...patch } : r)) : old,
    );

  return { invalidate, patchInList };
}
