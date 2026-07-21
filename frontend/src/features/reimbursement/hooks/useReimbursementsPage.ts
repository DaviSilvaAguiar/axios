import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";
import {
  createReimbursementApi,
  updateReimbursementApi,
  updateStatusReimbursementApi,
  downloadPdfReimbursementApi,
  deleteReimbursementApi,
} from "../reimbursement.api";
import { useReimbursements, useReimbursementActions } from "../reimbursement.hooks";
import { persistReimbursementItems } from "../reimbursement.persist";
import {
  type Reimbursement,
  type ReimbursementStatus,
  type StoreReimbursementWithDespesasFormData,
} from "../reimbursement.types";
import type { AttachmentToAdd, AttachmentToDelete } from "../components/FormReimbursement";

export type ViewMode = "kanban" | "list";

export function useReimbursementsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [selectedReimbursement, setSelectedReimbursement] = useState<Reimbursement | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [reimbursementToEdit, setReimbursementToEdit] = useState<Reimbursement | null>(null);
  const [schedulingModal, setSchedulingModal] = useState<Reimbursement | null>(null);
  const [rejectionModal, setRejectionModal] = useState<Reimbursement | null>(null);
  const [reimbursementToDelete, setReimbursementToDelete] = useState<Reimbursement | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [filters, setFilters] = useState({
    employee: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFilters(filters), 400);
    return () => clearTimeout(timer);
  }, [filters]);

  const {
    items: reimbursements,
    loading,
    error,
    hasMore,
    loadingMore,
    reload,
    loadMore,
  } = useReimbursements(debouncedFilters);
  const { invalidate, patchInList, removeFromList } = useReimbursementActions(debouncedFilters);

  function updateReimbursementLocal(id: number, patch: Partial<Reimbursement>) {
    patchInList(id, patch);
    setSelectedReimbursement((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));
  }

  async function handleConfirmDelete() {
    if (!reimbursementToDelete) return;
    setDeleting(true);
    try {
      await deleteReimbursementApi(reimbursementToDelete.id);
      removeFromList(reimbursementToDelete.id);
      setSelectedReimbursement((prev) => (prev?.id === reimbursementToDelete.id ? null : prev));
      setReimbursementToDelete(null);
      toast.success("Reimbursement deleted successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete the reimbursement.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleMoveReimbursement(id: number, newStatus: ReimbursementStatus) {
    try {
      await updateStatusReimbursementApi(id, { status: newStatus });
      updateReimbursementLocal(id, { status: newStatus });
    } catch {
    }
  }

  async function handleConfirmRejection(reason: string) {
    if (!rejectionModal) return;
    await updateStatusReimbursementApi(rejectionModal.id, { status: 7, rejection_reason: reason });
    updateReimbursementLocal(rejectionModal.id, { status: 7, rejection_reason: reason });
    setRejectionModal(null);
  }

  async function handleConfirmScheduling(date: string) {
    if (!schedulingModal) return;
    await updateStatusReimbursementApi(schedulingModal.id, {
      status: 5,
      scheduled_payment_date: date,
    });
    updateReimbursementLocal(schedulingModal.id, {
      status: 5,
      scheduled_payment_date: date,
    });
    setSchedulingModal(null);
  }

  async function handleApprove(id: number) {
    await updateStatusReimbursementApi(id, { status: 4 });
    updateReimbursementLocal(id, { status: 4 });
    setSelectedReimbursement(null);
  }

  async function handleReject(id: number, reason: string) {
    await updateStatusReimbursementApi(id, { status: 7, rejection_reason: reason });
    updateReimbursementLocal(id, { status: 7, rejection_reason: reason });
    setSelectedReimbursement(null);
  }

  function closeForm() {
    setShowForm(false);
    setReimbursementToEdit(null);
  }

  function handleEditReimbursement(reimbursement: Reimbursement) {
    setReimbursementToEdit(reimbursement);
    setShowForm(true);
  }

  async function handleDownloadPdf(id: number) {
    try {
      const blob = await downloadPdfReimbursementApi(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reimbursement-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
    }
  }

  async function handleSaveForm(
    data: StoreReimbursementWithDespesasFormData,
    deleteItemIds: number[],
    deleteAttachments: AttachmentToDelete[],
    addAttachments: AttachmentToAdd[]
  ) {
    try {
      const { items, ...header } = data;
      let reimbursementId: number;

      if (reimbursementToEdit) {
        await updateReimbursementApi(reimbursementToEdit.id, header);
        reimbursementId = reimbursementToEdit.id;
      } else {
        const reimbursement = await createReimbursementApi(header);
        reimbursementId = reimbursement.id;
      }

      await persistReimbursementItems(reimbursementId, items, deleteItemIds, deleteAttachments, addAttachments);

      closeForm();
      toast.success(reimbursementToEdit ? "Request updated successfully!" : "Request created successfully!");
      invalidate();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error saving the request.";
      toast.error(message);
    }
  }

  return {
    viewMode,
    setViewMode,
    selectedReimbursement,
    setSelectedReimbursement,
    showForm,
    setShowForm,
    reimbursementToEdit,
    schedulingModal,
    setSchedulingModal,
    rejectionModal,
    setRejectionModal,
    reimbursementToDelete,
    setReimbursementToDelete,
    deleting,
    filters,
    setFilters,

    reimbursements,
    loading,
    error,
    hasMore,
    loadingMore,
    reload,
    loadMore,

    handleConfirmDelete,
    handleMoveReimbursement,
    handleConfirmRejection,
    handleConfirmScheduling,
    handleApprove,
    handleReject,
    closeForm,
    handleEditReimbursement,
    handleDownloadPdf,
    handleSaveForm,
  };
}
