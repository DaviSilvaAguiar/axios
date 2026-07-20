"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import {
  createExpenseReportItemApi,
  adicionarAnexoExpenseReportItemApi,
  updateExpenseReportApi,
  updateStatusExpenseReportApi,
  deleteExpenseReportApi,
} from "../expense-report.api";
import { useExpenseReport, useExpenseReportActions } from "../expense-report.hooks";
import { buildItemFormData } from "../expense-report.form";
import { type StoreExpenseReportWithDespesasFormData } from "../expense-report.types";

export function useExpenseReportDetailPage(id: number) {
  const router = useRouter();
  const query = useExpenseReport(id);
  const { invalidate } = useExpenseReportActions();
  const expenseReport = query.data ?? null;
  const loading = query.isLoading;
  const [isEditing, setIsEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleEdit(data: StoreExpenseReportWithDespesasFormData, files: File[][] = []) {
    if (!expenseReport) return;
    try {
      const { items, ...rdcData } = data;
      await updateExpenseReportApi(expenseReport.id, rdcData);

      const existingItems = expenseReport.items ?? [];
      const existingCount = existingItems.length;

      await Promise.all(
        existingItems.flatMap((originalItem, idx) =>
          (files[idx] ?? []).map((file) =>
            adicionarAnexoExpenseReportItemApi(expenseReport.id, originalItem.id, file)
          )
        )
      );

      const newItems = (items ?? []).slice(existingCount);
      for (const [i, item] of newItems.entries()) {
        await createExpenseReportItemApi(expenseReport.id, buildItemFormData(item, files[existingCount + i] ?? []));
      }

      invalidate();
      setIsEditing(false);
      toast.success("Report updated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the changes.");
    }
  }

  async function handleSubmit() {
    if (!expenseReport) return;
    setSubmitting(true);
    try {
      await updateStatusExpenseReportApi(expenseReport.id, 2);
      invalidate();
      toast.success("Report sent for approval!");
    } catch {
      toast.error("Could not send it for approval.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!expenseReport) return;
    setDeleting(true);
    try {
      await deleteExpenseReportApi(expenseReport.id);
      toast.success("Report deleted.");
      router.push("/my-expense-reports");
    } catch {
      toast.error("Could not delete the report.");
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  }

  function goBack() {
    router.push("/my-expense-reports");
  }

  return {
    expenseReport,
    loading,
    isEditing,
    setIsEditing,
    menuOpen,
    setMenuOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    submitting,
    deleting,
    handleEdit,
    handleSubmit,
    handleDelete,
    goBack,
  };
}
