"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "@/lib/toast";
import {
  createExpenseReportApi,
  createExpenseReportItemApi,
} from "../expense-report.api";
import { useExpenseReports, useExpenseReportActions } from "../expense-report.hooks";
import { buildItemFormData } from "../expense-report.form";
import {
  type ExpenseReportStatus,
  type StoreExpenseReportWithDespesasFormData,
} from "../expense-report.types";

export type StatusFilter = "" | ExpenseReportStatus;

export function useMyExpenseReportsPage() {
  const params = useSearchParams();
  const query = useExpenseReports();
  const { invalidate } = useExpenseReportActions();
  const rdcs = query.data ?? [];
  const loading = query.isLoading;
  const error = query.isError ? "Could not load the reports." : null;
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [showForm, setShowForm] = useState(() => params.get("novo") === "1");

  const load = () => { query.refetch(); };

  const filteredExpenseReports = statusFilter
    ? rdcs.filter((r) => r.status === statusFilter)
    : rdcs;

  async function handleCreate(data: StoreExpenseReportWithDespesasFormData, filesByItem: File[][]) {
    let newId: number | null = null;
    try {
      const { items, ...rdcData } = data;
      const created = await createExpenseReportApi(rdcData);
      newId = created.id;

      for (const [idx, item] of (items ?? []).entries()) {
        await createExpenseReportItemApi(created.id, buildItemFormData(item, filesByItem[idx] ?? []));
      }

      invalidate();
      setShowForm(false);
      toast.success("Report created successfully!");
    } catch (err) {
      if (newId !== null) {
        setShowForm(false);
        toast.success("Report created. Refresh if the item does not appear.");
        invalidate();
        return;
      }
      toast.error(err instanceof Error ? err.message : "Could not save.");
    }
  }

  return {
    loading,
    error,
    load,
    statusFilter,
    setStatusFilter,
    showForm,
    setShowForm,
    filteredExpenseReports,
    handleCreate,
  };
}
