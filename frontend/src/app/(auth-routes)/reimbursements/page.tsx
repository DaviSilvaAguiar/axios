"use client";

import { useEffect, useState, useCallback } from "react";
import { List, SquaresFour, Plus, FunnelSimple } from "@phosphor-icons/react";
import DatePicker from "@/ui/DatePicker";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/ui/Button";
import { toast } from "@/lib/toast";
import Loading from "@/ui/Loading";
import Card from "@/ui/Card";
import Combobox from "@/ui/Combobox";
import KanbanView from "@/features/reimbursement/components/KanbanView";
import ListView from "@/features/reimbursement/components/ListView";
import AuditView from "@/features/reimbursement/components/AuditView";
import FormReimbursement from "@/features/reimbursement/components/FormReimbursement";
import SchedulingModal from "@/features/reimbursement/components/SchedulingModal";
import RejectionModal from "@/features/reimbursement/components/RejectionModal";
import ConfirmModal from "@/ui/ConfirmModal";
import {
  listReimbursementsApi,
  createReimbursementApi,
  updateReimbursementApi,
  createReimbursementItemApi,
  updateReimbursementItemApi,
  deleteReimbursementItemApi,
  adicionarAnexoReimbursementApi,
  deleteAnexoEspecificoReimbursementApi,
  updateStatusReimbursementApi,
  downloadPdfReimbursementApi,
  deleteReimbursementApi,
} from "@/features/reimbursement/reimbursement.api";
import { usePaginatedList } from "@/lib/usePaginatedList";
import {
  REIMBURSEMENT_STATUS_LABEL,
  type Reimbursement,
  type ReimbursementStatus,
  type StoreReimbursementWithDespesasFormData,
} from "@/features/reimbursement/reimbursement.types";
import type { AttachmentToAdd, AttachmentToDelete } from "@/features/reimbursement/components/FormReimbursement";

type ViewMode = "kanban" | "list";

export default function ReimbursementsPage() {
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

  const fetcher = useCallback((page: number, perPage: number) => {
    return listReimbursementsApi(page, perPage, debouncedFilters);
  }, [debouncedFilters]);

  const {
    items: reimbursements,
    setItems: setReimbursements,
    loading,
    error: error,
    hasMore,
    loadingMore,
    reload: reload,
    loadMore: loadMore,
  } = usePaginatedList(fetcher);

  useEffect(() => {
    reload();
  }, [debouncedFilters, reload]);

  function updateReimbursementLocal(id: number, patch: Partial<Reimbursement>) {
    setReimbursements((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setSelectedReimbursement((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));
  }

  async function handleConfirmDelete() {
    if (!reimbursementToDelete) return;
    setDeleting(true);
    try {
      await deleteReimbursementApi(reimbursementToDelete.id);
      setReimbursements((prev) => prev.filter((r) => r.id !== reimbursementToDelete.id));
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
        const { reimbursement } = await createReimbursementApi(header);
        reimbursementId = reimbursement.id;
      }

      for (const id of deleteItemIds) {
        await deleteReimbursementItemApi(reimbursementId, id);
      }

      for (const { itemId, attachmentId } of deleteAttachments) {
        await deleteAnexoEspecificoReimbursementApi(reimbursementId, itemId, attachmentId);
      }

      for (const { itemId, file } of addAttachments) {
        await adicionarAnexoReimbursementApi(reimbursementId, itemId, file);
      }

      for (const item of items) {
        if (item.itemId) {
          await updateReimbursementItemApi(reimbursementId, item.itemId, {
            expense_date: item.expense_date,
            amount: item.amount,
            cost_center_id: item.cost_center_id,
            description: item.description,
            expense_category_id: item.expense_category_id || undefined,
            latitude: item.latitude ?? null,
            longitude: item.longitude ?? null,
            address: item.address ?? null,
            description_supplier: item.description_supplier || undefined,
            supplier_tax_id: item.supplier_tax_id || undefined,
            supplier_id: item.supplier_id || undefined,
          });
        } else {
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
          const files = (item.anexo as File[] | undefined) ?? [];
          files.forEach((f) => fd.append("attachments[]", f));
          await createReimbursementItemApi(reimbursementId, fd);
        }
      }

      closeForm();
      toast.success(reimbursementToEdit ? "Request updated successfully!" : "Request created successfully!");
      reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error saving the request.";
      toast.error(message);
    }
  }

  if (selectedReimbursement) {
    return (
      <div className="flex h-full flex-col p-4">
        <AuditView
          reimbursement={selectedReimbursement}
          onClose={() => setSelectedReimbursement(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onDownloadPdf={handleDownloadPdf}
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 p-6">

        <Card>
          <div className="flex items-center justify-between px-5 py-4">
            <h1 className="text-feature-title text-app-text">Reimbursements</h1>
            <Button variant="dark" size="sm" onClick={() => setShowForm(true)}>
              <Plus size={14} />
              New Request
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 border-t border-app-border px-5 py-4">
            <div className="flex rounded-xl border border-app-border bg-app-surface overflow-hidden self-start">
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1.5 px-3 py-2 text-caption font-semibold transition-colors cursor-pointer ${viewMode === "kanban"
                  ? "bg-app-surface-raised text-app-text"
                  : "text-app-text-muted hover:bg-app-hover"
                  }`}
              >
                <SquaresFour size={16} />
                Kanban
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-2 text-caption font-semibold transition-colors cursor-pointer ${viewMode === "list"
                  ? "bg-app-surface-raised text-app-text"
                  : "text-app-text-muted hover:bg-app-hover"
                  }`}
              >
                <List size={16} />
                List
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:ml-auto flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FunnelSimple size={16} className="hidden sm:block text-app-text-muted shrink-0" />
                <input
                  type="text"
                  placeholder="Employee"
                  value={filters.employee}
                  onChange={(e) => setFilters((f) => ({ ...f, employee: e.target.value }))}
                  className="h-10 rounded-xl border border-app-border bg-app-surface px-3 text-body-sm text-app-text placeholder:text-app-text-subtle focus:border-brand focus:outline-none w-full sm:w-52"
                />
              </div>
              <Combobox
                placeholder="Status"
                searchPlaceholder="Search status…"
                value={filters.status}
                onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
                className="w-full sm:w-44"
                options={[
                  { value: "1", label: REIMBURSEMENT_STATUS_LABEL[1] },
                  { value: "2", label: REIMBURSEMENT_STATUS_LABEL[2] },
                  { value: "3", label: REIMBURSEMENT_STATUS_LABEL[3] },
                  { value: "4", label: REIMBURSEMENT_STATUS_LABEL[4] },
                  { value: "5", label: REIMBURSEMENT_STATUS_LABEL[5] },
                  { value: "6", label: REIMBURSEMENT_STATUS_LABEL[6] },
                ]}
              />
              <div className="flex gap-2">
                <DatePicker
                  size="sm"
                  placeholder="From"
                  value={filters.startDate}
                  onChange={(v) => setFilters((f) => ({ ...f, startDate: v }))}
                  className="flex-1 sm:w-36"
                />
                <DatePicker
                  size="sm"
                  placeholder="To"
                  align="right"
                  value={filters.endDate}
                  onChange={(v) => setFilters((f) => ({ ...f, endDate: v }))}
                  className="flex-1 sm:w-36"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5">
            {loading ? (
              <Loading />
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4">
                <p className="text-body-sm text-red-700">{error}</p>
                <button
                  onClick={reload}
                  className="mt-2 text-caption font-semibold text-brand hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewMode}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  {viewMode === "kanban" ? (
                    <KanbanView
                      reimbursements={reimbursements}
                      onMoveReimbursement={handleMoveReimbursement}
                      onRequestScheduling={(reimbursement) => setSchedulingModal(reimbursement)}
                      onRequestRejection={(reimbursement) => setRejectionModal(reimbursement)}
                      onOpenAudit={setSelectedReimbursement}
                      onDownloadPdf={handleDownloadPdf}
                      onEditReimbursement={handleEditReimbursement}
                      onDeleteReimbursement={setReimbursementToDelete}
                    />
                  ) : (
                    <ListView
                      reimbursements={reimbursements}
                      onSelectReimbursement={setSelectedReimbursement}
                      loading={loading}
                      onLoadMore={loadMore}
                      hasMore={hasMore}
                      loadingMore={loadingMore}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </Card>

      </div>

      <AnimatePresence>
        {showForm && (
          <FormReimbursement
            initialReimbursement={reimbursementToEdit ?? undefined}
            onSave={handleSaveForm}
            onClose={closeForm}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {schedulingModal && (
          <SchedulingModal
            onConfirm={handleConfirmScheduling}
            onCancel={() => setSchedulingModal(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rejectionModal && (
          <RejectionModal
            onConfirm={handleConfirmRejection}
            onCancel={() => setRejectionModal(null)}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        open={!!reimbursementToDelete}
        title="Delete Reimbursement?"
        description={reimbursementToDelete ? `This action cannot be undone. The reimbursement "${reimbursementToDelete.title}" and all linked items will be permanently removed.` : undefined}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => { if (!deleting) setReimbursementToDelete(null); }}
      />
    </>
  );
}
