import { useEffect, useState, useCallback } from "react";
import { toast } from "@/lib/toast";
import { aprovarExpenseReportComCaixaApi } from "@/features/fund/fund.api";
import {
  listExpenseReportsApi,
  getExpenseReportApi,
  createExpenseReportApi,
  createExpenseReportItemApi,
  updateExpenseReportItemApi,
  adicionarAnexoExpenseReportItemApi,
  updateExpenseReportApi,
  updateStatusExpenseReportApi,
  deleteExpenseReportApi,
} from "../expense-report.api";
import {
  type ExpenseReportItemFormItem,
  type ExpenseReport,
  type ExpenseReportStatus,
  type StoreExpenseReportWithDespesasFormData,
} from "../expense-report.types";

function buildItemFormData(item: ExpenseReportItemFormItem, files: File[]): FormData {
  const fd = new FormData();
  fd.append("expense_date", item.expense_date);
  fd.append("amount", item.amount);
  fd.append("cost_center_id", item.cost_center_id);
  fd.append("description", item.description);
  if (item.expense_category_id) fd.append("expense_category_id", item.expense_category_id);
  if (item.latitude != null) fd.append("latitude", String(item.latitude));
  if (item.longitude != null) fd.append("longitude", String(item.longitude));
  if (item.address) fd.append("address", item.address);
  if (item.description_supplier) fd.append("description_supplier", item.description_supplier);
  if (item.supplier_tax_id) fd.append("supplier_tax_id", item.supplier_tax_id.replace(/\D/g, ""));
  if (item.supplier_id) fd.append("supplier_id", item.supplier_id);
  for (const file of files) fd.append("attachments[]", file);
  return fd;
}

export interface ExpenseReportFilters {
  requester: string;
  status: string;
  startDate: string;
  endDate: string;
}

export function useExpenseReportPage() {
  const [rdcs, setExpenseReports] = useState<ExpenseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [filters, setFilters] = useState<ExpenseReportFilters>({
    requester: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  const [selectedExpenseReport, setSelectedExpenseReport] = useState<ExpenseReport | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFromKanban, setEditFromKanban] = useState(false);

  const [rdcToApprove, setExpenseReportToApprove] = useState<ExpenseReport | null>(null);
  const [rdcToReject, setExpenseReportToReject] = useState<ExpenseReport | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [kanbanRejectReason, setKanbanRejectReason] = useState("");
  const [rdcToSchedule, setExpenseReportToSchedule] = useState<ExpenseReport | null>(null);
  const [rdcToDelete, setExpenseReportToDelete] = useState<ExpenseReport | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await listExpenseReportsApi();
      setExpenseReports(data);
      setError(null);
    } catch {
      setError("Could not load the reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function reload() {
    setLoading(true);
    setError(null);
    load();
  }

  const filteredExpenseReports = rdcs.filter((r) => {
    if (filters.requester && !(r.requester_description ?? "").toLowerCase().includes(filters.requester.toLowerCase())) return false;
    if (filters.status && String(r.status) !== filters.status) return false;
    if (filters.startDate && r.created_at.slice(0, 10) < filters.startDate) return false;
    if (filters.endDate && r.created_at.slice(0, 10) > filters.endDate) return false;
    return true;
  });

  function updateExpenseReportLocal(id: number, patch: Partial<ExpenseReport>) {
    setExpenseReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function handleMoveExpenseReport(id: number, newStatus: ExpenseReportStatus) {
    const expenseReport = rdcs.find((r) => r.id === id);

    if (newStatus === 3) { if (expenseReport) { setExpenseReportToApprove(expenseReport); return; } }
    if (newStatus === 6) { if (expenseReport) { setExpenseReportToReject(expenseReport); return; } }
    if (newStatus === 4) { if (expenseReport) { setExpenseReportToSchedule(expenseReport); return; } }

    try {
      await updateStatusExpenseReportApi(id, newStatus);
      updateExpenseReportLocal(id, { status: newStatus });
    } catch {
      toast.error("Could not move the report. Please try again.");
    }
  }

  async function handleConfirmApproval(fundId: number) {
    if (!rdcToApprove) return;
    try {
      await aprovarExpenseReportComCaixaApi(rdcToApprove.id, fundId);
      updateExpenseReportLocal(rdcToApprove.id, { status: 4 });
      if (selectedExpenseReport?.id === rdcToApprove.id) {
        setSelectedExpenseReport((prev) => prev ? { ...prev, status: 4 } : prev);
      }
      setExpenseReportToApprove(null);
      toast.success("Report approved and fund debited.");
    } catch {
      toast.error("Could not approve the report.");
    }
  }

  async function handleRejectExpenseReport(expenseReport: ExpenseReport, reason?: string) {
    const updated = await updateStatusExpenseReportApi(expenseReport.id, 7, reason);
    updateExpenseReportLocal(updated.id, updated);
    if (selectedExpenseReport?.id === expenseReport.id) setSelectedExpenseReport(updated);
    toast.success("Report rejected.");
  }

  async function handleConfirmReject() {
    if (!rdcToReject) return;
    setRejecting(true);
    try {
      await handleRejectExpenseReport(rdcToReject, kanbanRejectReason || undefined);
      setExpenseReportToReject(null);
      setKanbanRejectReason("");
    } catch (err) {
      console.error("Error rejecting report:", err);
      toast.error(err instanceof Error ? err.message : "Could not reject the report.");
    } finally {
      setRejecting(false);
    }
  }

  async function handleConfirmSchedule(paymentDate: string) {
    if (!rdcToSchedule) return;
    try {
      const updated = await updateStatusExpenseReportApi(rdcToSchedule.id, 5, undefined, paymentDate);
      updateExpenseReportLocal(updated.id, updated);
      if (selectedExpenseReport?.id === rdcToSchedule.id) setSelectedExpenseReport(updated);
      setExpenseReportToSchedule(null);
      toast.success("Payment scheduled successfully!");
    } catch {
      toast.error("Could not schedule the payment.");
    }
  }

  async function handleMarkPaid(expenseReport: ExpenseReport) {
    try {
      const updated = await updateStatusExpenseReportApi(expenseReport.id, 6);
      updateExpenseReportLocal(updated.id, updated);
      if (selectedExpenseReport?.id === expenseReport.id) setSelectedExpenseReport(updated);
      toast.success("Report marked as paid.");
    } catch {
      toast.error("Could not mark it as paid.");
    }
  }

  async function handleCreateExpenseReport(data: StoreExpenseReportWithDespesasFormData, filesByItem: File[][]) {
    let newId: number | null = null;
    try {
      const { items, ...rdcData } = data;
      const created = await createExpenseReportApi(rdcData);
      newId = created.id;

      for (const [idx, item] of (items ?? []).entries()) {
        await createExpenseReportItemApi(created.id, buildItemFormData(item, filesByItem[idx] ?? []));
      }

      const fullExpenseReport = await getExpenseReportApi(created.id);
      setExpenseReports((prev) => [fullExpenseReport, ...prev]);
      setShowForm(false);
      toast.success("Report created successfully!");
    } catch (err) {
      console.error("Error creating report:", err);
      if (newId !== null) {
        setShowForm(false);
        toast.success("Report created. Refresh the list if the item does not appear.");
        load();
        return;
      }
      toast.error(err instanceof Error ? err.message : "Could not save the report.");
    }
  }

  async function handleEditExpenseReport(data: StoreExpenseReportWithDespesasFormData, files: File[][] = []) {
    if (!selectedExpenseReport) return;
    try {
      const { items, ...rdcData } = data;
      await updateExpenseReportApi(selectedExpenseReport.id, rdcData);

      const existingItems = selectedExpenseReport.items ?? [];
      const existingCount = existingItems.length;
      const formItems = items ?? [];

      for (let idx = 0; idx < existingCount; idx++) {
        const originalItem = existingItems[idx];
        const formItem = formItems[idx];
        if (!originalItem || !formItem) continue;
        await updateExpenseReportItemApi(selectedExpenseReport.id, originalItem.id, formItem);
      }

      await Promise.all(
        existingItems.flatMap((originalItem, idx) =>
          (files[idx] ?? []).map((file) =>
            adicionarAnexoExpenseReportItemApi(selectedExpenseReport.id, originalItem.id, file)
          )
        )
      );

      const newItems = formItems.slice(existingCount);
      for (const [i, item] of newItems.entries()) {
        await createExpenseReportItemApi(selectedExpenseReport.id, buildItemFormData(item, files[existingCount + i] ?? []));
      }

      const fullExpenseReport = await getExpenseReportApi(selectedExpenseReport.id);
      updateExpenseReportLocal(fullExpenseReport.id, fullExpenseReport);

      if (editFromKanban) {
        setSelectedExpenseReport(null);
        setEditFromKanban(false);
      } else {
        setSelectedExpenseReport(fullExpenseReport);
      }
      setIsEditing(false);
      toast.success("Report updated successfully!");
    } catch (err) {
      console.error("Error updating report:", err);
      toast.error(err instanceof Error ? err.message : "Could not save the changes.");
    }
  }

  async function handleSubmitExpenseReport() {
    if (!selectedExpenseReport) return;
    const updated = await updateStatusExpenseReportApi(selectedExpenseReport.id, 2);
    updateExpenseReportLocal(updated.id, updated);
    setSelectedExpenseReport(null);
    toast.success("Report sent for approval!");
  }

  async function handleConfirmDelete() {
    if (!rdcToDelete) return;
    setDeleting(true);
    try {
      await deleteExpenseReportApi(rdcToDelete.id);
      setExpenseReports((prev) => prev.filter((r) => r.id !== rdcToDelete.id));
      setExpenseReportToDelete(null);
      toast.success("Report deleted successfully!");
    } catch (err) {
      console.error("Error deleting report:", err);
      toast.error(err instanceof Error ? err.message : "Could not delete the report.");
    } finally {
      setDeleting(false);
    }
  }

  return {
    rdcs,
    filteredExpenseReports,
    loading,
    error,
    reload,

    showForm,
    setShowForm,
    viewMode,
    setViewMode,
    filters,
    setFilters,

    selectedExpenseReport,
    setSelectedExpenseReport,
    isEditing,
    setIsEditing,
    editFromKanban,
    setEditFromKanban,

    rdcToApprove,
    setExpenseReportToApprove,
    rdcToReject,
    setExpenseReportToReject,
    rejecting,
    kanbanRejectReason,
    setKanbanRejectReason,
    rdcToSchedule,
    setExpenseReportToSchedule,
    rdcToDelete,
    setExpenseReportToDelete,
    deleting,

    handleMoveExpenseReport,
    handleCreateExpenseReport,
    handleEditExpenseReport,
    handleSubmitExpenseReport,
    handleConfirmApproval,
    handleRejectExpenseReport,
    handleConfirmReject,
    handleConfirmSchedule,
    handleMarkPaid,
    handleConfirmDelete,
  };
}
