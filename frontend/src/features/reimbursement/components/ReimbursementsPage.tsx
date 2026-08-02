"use client";

import { List, SquaresFour, Plus, FunnelSimple } from "@phosphor-icons/react";
import DatePicker from "@/ui/DatePicker";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/ui/Button";
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
import { useReimbursementsPage } from "@/features/reimbursement/hooks/useReimbursementsPage";
import { REIMBURSEMENT_STATUS_LABEL } from "@/features/reimbursement/reimbursement.types";

export default function ReimbursementsPage() {
  const {
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
  } = useReimbursementsPage();

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
