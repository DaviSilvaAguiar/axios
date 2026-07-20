"use client";

import { Plus, FunnelSimple, List, SquaresFour } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/ui/Button";
import Loading from "@/ui/Loading";
import Card from "@/ui/Card";
import Combobox from "@/ui/Combobox";
import DatePicker from "@/ui/DatePicker";
import ConfirmModal from "@/ui/ConfirmModal";
import KanbanView from "@/features/expense-report/components/KanbanView";
import ListView from "@/features/expense-report/components/ListView";
import ExpenseReportForm from "@/features/expense-report/components/ExpenseReportForm";
import AuditView from "@/features/expense-report/components/AuditView";
import ApproveExpenseReportWithFundModal from "@/features/fund/components/ApproveExpenseReportWithFundModal";
import SchedulePaymentModal from "@/features/expense-report/components/SchedulePaymentModal";
import { useExpenseReportPage } from "@/features/expense-report/hooks/useExpenseReportPage";
import { EXPENSE_REPORT_STATUS_LABEL } from "@/features/expense-report/expense-report.types";

export default function ExpenseReportsPage() {
  const {
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
    handleDownloadPdf,
  } = useExpenseReportPage();

  if (selectedExpenseReport && (!isEditing || !editFromKanban)) {
    return (
      <>
        <div className="flex h-full flex-col p-4">
          <AuditView
            expenseReport={selectedExpenseReport}
            onClose={() => setSelectedExpenseReport(null)}
            onEdit={() => setIsEditing(true)}
            onSubmit={handleSubmitExpenseReport}
            onApprove={(expenseReport) => setExpenseReportToApprove(expenseReport)}
            onReject={handleRejectExpenseReport}
            onSchedule={(expenseReport) => setExpenseReportToSchedule(expenseReport)}
            onMarkPaid={handleMarkPaid}
            onDownloadPdf={handleDownloadPdf}
            modalOpen={isEditing || !!rdcToApprove || !!rdcToSchedule}
          />
          <AnimatePresence>
            {isEditing && (
              <ExpenseReportForm
                initialExpenseReport={selectedExpenseReport}
                onSave={handleEditExpenseReport}
                onClose={() => setIsEditing(false)}
              />
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {rdcToApprove && (
            <ApproveExpenseReportWithFundModal
              reportUserId={rdcToApprove.user_id}
              reportCostCenterId={rdcToApprove.cost_center_id}
              totalAmount={(rdcToApprove.items ?? []).reduce((sum, d) => sum + Number(d.amount ?? 0), 0)}
              onConfirm={handleConfirmApproval}
              onClose={() => setExpenseReportToApprove(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {rdcToSchedule && (
            <SchedulePaymentModal
              onConfirm={handleConfirmSchedule}
              onCancel={() => setExpenseReportToSchedule(null)}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 p-6">

        <Card>
          <div className="flex items-center justify-between px-5 py-4">
            <h1 className="text-feature-title text-app-text">Expense Reports</h1>
            <Button variant="dark" size="sm" onClick={() => setShowForm(true)}>
              <Plus size={14} />
              New Report
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-app-border px-5 py-4">
            <div className="flex rounded-xl border border-app-border bg-app-surface overflow-hidden">
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

            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <FunnelSimple size={16} className="text-app-text-muted shrink-0" />
              <input
                type="text"
                placeholder="Requester"
                value={filters.requester}
                onChange={(e) => setFilters((f) => ({ ...f, requester: e.target.value }))}
                className="h-10 rounded-xl border border-app-border bg-app-surface px-3 text-body-sm text-app-text placeholder:text-app-text-subtle focus:border-brand focus:outline-none w-52"
              />
              <Combobox
                placeholder="Status"
                searchPlaceholder="Search status…"
                value={filters.status}
                onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
                className="w-44"
                options={Object.entries(EXPENSE_REPORT_STATUS_LABEL).map(([value, label]) => ({ value, label }))}
              />
              <DatePicker
                size="sm"
                placeholder="From"
                value={filters.startDate}
                onChange={(v) => setFilters((f) => ({ ...f, startDate: v }))}
                className="w-36"
              />
              <DatePicker
                size="sm"
                placeholder="To"
                align="right"
                value={filters.endDate}
                onChange={(v) => setFilters((f) => ({ ...f, endDate: v }))}
                className="w-36"
              />
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
                      rdcs={filteredExpenseReports}
                      onMoveExpenseReport={handleMoveExpenseReport}
                      onSelectExpenseReport={setSelectedExpenseReport}
                      onEditExpenseReport={(expenseReport) => { setSelectedExpenseReport(expenseReport); setIsEditing(true); setEditFromKanban(true); }}
                      onDeleteExpenseReport={setExpenseReportToDelete}
                      onDownloadPdf={handleDownloadPdf}
                    />
                  ) : (
                    <ListView
                      rdcs={filteredExpenseReports}
                      onSelectExpenseReport={setSelectedExpenseReport}
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
          <ExpenseReportForm
            onSave={handleCreateExpenseReport}
            onClose={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedExpenseReport && isEditing && (
          <ExpenseReportForm
            initialExpenseReport={selectedExpenseReport}
            onSave={handleEditExpenseReport}
            onClose={() => {
              setIsEditing(false);
              if (editFromKanban) {
                setSelectedExpenseReport(null);
                setEditFromKanban(false);
              }
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rdcToApprove && (
          <ApproveExpenseReportWithFundModal
            reportUserId={rdcToApprove.user_id}
            reportCostCenterId={rdcToApprove.cost_center_id}
            totalAmount={(rdcToApprove.items ?? []).reduce((sum, d) => sum + Number(d.amount ?? 0), 0)}
            onConfirm={handleConfirmApproval}
            onClose={() => setExpenseReportToApprove(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rdcToSchedule && (
          <SchedulePaymentModal
            onConfirm={handleConfirmSchedule}
            onCancel={() => setExpenseReportToSchedule(null)}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        open={!!rdcToReject}
        title="Reject request?"
        description="The request will be marked as rejected and the provider will need to create a new one to submit again."
        confirmLabel="Reject"
        loadingLabel="Rejecting…"
        loading={rejecting}
        onConfirm={handleConfirmReject}
        onCancel={() => { if (!rejecting) { setExpenseReportToReject(null); setKanbanRejectReason(""); } }}
      >
        <textarea
          value={kanbanRejectReason}
          onChange={(e) => setKanbanRejectReason(e.target.value)}
          placeholder="Reason (optional)"
          rows={3}
          className="w-full rounded-xl border border-app-border bg-app-surface-raised/40 px-3 py-2 text-body-sm text-app-text placeholder:text-app-text-subtle resize-none focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </ConfirmModal>

      <ConfirmModal
        open={!!rdcToDelete}
        title="Delete report?"
        description={rdcToDelete ? `This action cannot be undone. The report "${rdcToDelete.description}" and all its linked items will be permanently removed.` : undefined}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => { if (!deleting) setExpenseReportToDelete(null); }}
      />
    </>
  );
}
