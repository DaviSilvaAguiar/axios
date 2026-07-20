"use client";

import { useQuery } from "@tanstack/react-query";
import { useInfiniteList } from "@/lib/useInfiniteList";
import { queryKeys } from "@/lib/queryKeys";
import { listSubmissionsApi } from "./provider.api";
import type { Submission, SubmissionFilter } from "./provider.types";

export function useSubmissions(filter: SubmissionFilter, perPage = 15) {
  return useInfiniteList<Submission>(
    queryKeys.submissions.list(filter),
    (page, size, signal) => listSubmissionsApi(filter, page, size, signal),
    { perPage },
  );
}

export function useRecentSubmissions() {
  return useQuery({
    queryKey: queryKeys.submissions.recent,
    queryFn: ({ signal }) => listSubmissionsApi("all", 1, 3, signal),
    select: (result) => result.data,
  });
}

export function usePendingReimbursementTotal() {
  return useQuery({
    queryKey: queryKeys.submissions.summary("reimbursement"),
    queryFn: ({ signal }) => listSubmissionsApi("reimbursement", 1, 50, signal),
    select: (result) =>
      result.data
        .filter((r) => r.status === 1 || r.status === 2 || r.status === 3)
        .reduce((s, r) => s + Number(r.total_amount), 0),
  });
}

export function useDraftExpenseReportCount() {
  return useQuery({
    queryKey: queryKeys.submissions.summary("expense_report"),
    queryFn: ({ signal }) => listSubmissionsApi("expense_report", 1, 50, signal),
    select: (result) => result.data.filter((r) => r.status === 1).length,
  });
}
