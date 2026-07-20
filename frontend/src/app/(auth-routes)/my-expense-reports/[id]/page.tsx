"use client";

import { use } from "react";
import {
  ArrowLeft,
  DotsThreeVertical,
  Paperclip,
  PaperPlaneTilt,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import Loading from "@/ui/Loading";
import Button from "@/ui/Button";
import ConfirmModal from "@/ui/ConfirmModal";
import ExpenseReportForm from "@/features/expense-report/components/ExpenseReportForm";
import ExpenseReportActionsSheet from "@/features/expense-report/components/ExpenseReportActionsSheet";
import StatusTag from "@/features/expense-report/components/StatusTag";
import { useExpenseReportDetailPage } from "@/features/expense-report/hooks/useExpenseReportDetailPage";
import { EXPENSE_REPORT_STATUS_DRAFT } from "@/features/expense-report/expense-report.types";
import { formatarData, formatarMoeda } from "@/lib/formatters";

export default function ExpenseReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
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
  } = useExpenseReportDetailPage(Number(id));

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loading />
      </div>
    );
  }

  if (!expenseReport) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <p className="text-body text-app-text-muted">Report not found.</p>
        <Button variant="outlined" onClick={goBack}>
          Back
        </Button>
      </div>
    );
  }

  const isDraft = expenseReport.status === EXPENSE_REPORT_STATUS_DRAFT;
  const items = expenseReport.items ?? [];
  const total = items.reduce((acc, d) => acc + Number(d.amount ?? 0), 0);
  const canSubmit = isDraft && items.length > 0;

  return (
    <>
      <div className={`flex flex-col min-h-full ${isDraft ? "pb-28" : "pb-8"}`}>
        <div className="sticky top-0 z-10 bg-app-bg/95 backdrop-blur-sm border-b border-app-border-subtle">
          <div className="flex items-center gap-2 px-3 py-3 sm:px-4">
            <button
              onClick={goBack}
              aria-label="Back"
              className="rounded-full p-2 text-app-text-muted hover:bg-app-hover transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-feature-title text-app-text truncate">{expenseReport.description}</p>
            </div>
            <StatusTag status={expenseReport.status} />
            {isDraft && (
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="More actions"
                className="rounded-full p-2 text-app-text-muted hover:bg-app-hover transition-colors"
              >
                <DotsThreeVertical size={20} weight="bold" />
              </button>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-6 pt-4 space-y-1">
          {(expenseReport.cost_center || (expenseReport.period_start_date && expenseReport.period_end_date)) && (
            <p className="text-small text-app-text-muted">
              {expenseReport.cost_center?.description}
              {expenseReport.cost_center && expenseReport.period_start_date && expenseReport.period_end_date && " · "}
              {expenseReport.period_start_date && expenseReport.period_end_date &&
                `${formatarData(expenseReport.period_start_date)} → ${formatarData(expenseReport.period_end_date)}`}
            </p>
          )}
          {(expenseReport.requester_description || expenseReport.requester_user) && (
            <p className="text-small text-app-text-muted">
              Requester: {expenseReport.requester_user?.name ?? expenseReport.requester_description}
            </p>
          )}
          {expenseReport.notes && (
            <p className="text-small text-app-text-muted pt-2 leading-relaxed">{expenseReport.notes}</p>
          )}
        </div>

        <div className="px-4 sm:px-6 pt-6">
          <p className="text-caption font-semibold text-app-text-muted uppercase tracking-wide">
            Total
          </p>
          <p className="text-[2rem] leading-tight font-bold text-app-text">
            {formatarMoeda(total)}
          </p>
        </div>

        <div className="px-4 sm:px-6 pt-6 flex-1">
          <p className="text-caption font-semibold text-app-text-muted uppercase tracking-wide mb-1">
            Items
          </p>
          {items.length === 0 ? (
            <p className="text-small text-app-text-muted py-6 text-center">
              No items recorded.
            </p>
          ) : (
            <ul className="divide-y divide-app-border-subtle">
              {items.map((item) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start justify-between gap-3 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-body text-app-text truncate">
                      {item.description}
                    </p>
                    <p className="text-small text-app-text-muted mt-0.5">
                      {formatarData(item.expense_date)}
                      {item.expense_category && ` · ${item.expense_category.description}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className="text-body font-semibold text-app-text">
                      {formatarMoeda(Number(item.amount ?? 0))}
                    </span>
                    {(item.attachments ?? []).length > 0 && (
                      <span className="flex items-center gap-1 text-small text-app-text-subtle">
                        <Paperclip size={11} />
                        {item.attachments!.length}
                      </span>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {isDraft && (
        <div
          className="fixed bottom-0 inset-x-0 z-20 bg-app-bg/95 backdrop-blur-sm border-t border-app-border-subtle px-4 py-3 sm:px-6"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <Button
            variant="dark"
            fullWidth
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
          >
            <PaperPlaneTilt size={16} weight="bold" />
            {submitting ? "Sending…" : "Send for Approval"}
          </Button>
        </div>
      )}

      <ExpenseReportActionsSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onEdit={() => {
          setMenuOpen(false);
          setIsEditing(true);
        }}
        onDelete={() => {
          setMenuOpen(false);
          setDeleteModalOpen(true);
        }}
      />

      <ConfirmModal
        open={deleteModalOpen}
        title="Delete this report?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      <AnimatePresence>
        {isEditing && (
          <ExpenseReportForm
            initialExpenseReport={expenseReport}
            onSave={handleEdit}
            onClose={() => setIsEditing(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
