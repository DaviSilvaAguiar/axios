"use client";

import { useQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useInfiniteList } from "@/lib/useInfiniteList";
import { queryKeys } from "@/lib/queryKeys";
import type { Paginated } from "@/lib/pagination";
import { listReimbursementsApi, getReimbursementApi } from "./reimbursement.api";
import type { Reimbursement } from "./reimbursement.types";

export interface ReimbursementFilters {
  employee: string;
  status: string;
  startDate: string;
  endDate: string;
}

export function useReimbursements(filters: ReimbursementFilters) {
  return useInfiniteList<Reimbursement>(
    queryKeys.reimbursements.list(filters),
    (page, perPage, signal) => listReimbursementsApi(page, perPage, filters, signal),
  );
}

export function useReimbursement(id: number | null) {
  return useQuery({
    queryKey: queryKeys.reimbursements.detail(id ?? 0),
    queryFn: ({ signal }) => getReimbursementApi(id as number, signal),
    enabled: id !== null,
  });
}

export function useReimbursementActions(filters: ReimbursementFilters) {
  const queryClient = useQueryClient();
  const listKey = queryKeys.reimbursements.list(filters);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.reimbursements.all });

  const patchInList = (id: number, patch: Partial<Reimbursement>) =>
    queryClient.setQueryData<InfiniteData<Paginated<Reimbursement>>>(listKey, (old) =>
      old
        ? {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((r) => (r.id === id ? { ...r, ...patch } : r)),
            })),
          }
        : old,
    );

  const removeFromList = (id: number) =>
    queryClient.setQueryData<InfiniteData<Paginated<Reimbursement>>>(listKey, (old) =>
      old
        ? {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((r) => r.id !== id),
            })),
          }
        : old,
    );

  return { invalidate, patchInList, removeFromList };
}
