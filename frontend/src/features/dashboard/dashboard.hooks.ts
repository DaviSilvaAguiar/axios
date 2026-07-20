"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { overviewDashboardApi, pendingApprovalApi } from "./dashboard.api";

export function useDashboardOverview(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.dashboard.overview(`${year}-${month}`),
    queryFn: ({ signal }) => overviewDashboardApi(year, month, signal),
  });
}

export function usePendingApproval() {
  return useQuery({
    queryKey: queryKeys.dashboard.pendingApproval,
    queryFn: ({ signal }) => pendingApprovalApi(signal),
  });
}
