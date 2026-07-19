"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  DotsThreeVertical,
  PencilSimple,
  Trash,
  Paperclip,
  PaperPlaneTilt,
  X,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import Loading from "@/ui/Loading";
import Button from "@/ui/Button";
import ConfirmModal from "@/ui/ConfirmModal";
import ExpenseReportForm from "@/features/expense-report/components/ExpenseReportForm";
import StatusTag from "@/features/expense-report/components/StatusTag";
import { toast } from "@/lib/toast";
import {
  getExpenseReportApi,
  createExpenseReportItemApi,
  adicionarAnexoExpenseReportItemApi,
  updateExpenseReportApi,
  updateStatusExpenseReportApi,
  deleteExpenseReportApi,
} from "@/features/expense-report/expense-report.api";
import {
  EXPENSE_REPORT_STATUS_DRAFT,
  type ExpenseReportItemFormItem,
  type ExpenseReport,
  type StoreExpenseReportWithDespesasFormData,
} from "@/features/expense-report/expense-report.types";

function fmtAmount(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
}

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

export default function ExpenseReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [expenseReport, setExpenseReport] = useState<ExpenseReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getExpenseReportApi(Number(id))
      .then(setExpenseReport)
      .catch(() => toast.error("Could not load the report."))
      .finally(() => setLoading(false));
  }, [id]);

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

      const updated = await getExpenseReportApi(expenseReport.id);
      setExpenseReport(updated);
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
      const updated = await updateStatusExpenseReportApi(expenseReport.id, 2);
      setExpenseReport(updated);
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
        <Button variant="outlined" onClick={() => router.push("/my-expense-reports")}>
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
              onClick={() => router.push("/my-expense-reports")}
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
                `${fmtDate(expenseReport.period_start_date)} → ${fmtDate(expenseReport.period_end_date)}`}
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
            {fmtAmount(total)}
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
                      {fmtDate(item.expense_date)}
                      {item.expense_category && ` · ${item.expense_category.description}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className="text-body font-semibold text-app-text">
                      {fmtAmount(Number(item.amount ?? 0))}
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

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-50"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="absolute bottom-0 inset-x-0 bg-app-surface rounded-t-2xl border-t border-app-border p-4 md:max-w-md md:left-1/2 md:right-auto md:-translate-x-1/2 md:bottom-12 md:rounded-2xl md:border"
              style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
            >
              <div className="flex justify-between items-center mb-3">
                <p className="text-feature-title text-app-text">Actions</p>
                <button
                  aria-label="Close"
                  onClick={() => setMenuOpen(false)}
                  className="h-11 w-11 -mr-2 flex items-center justify-center text-app-text-muted hover:text-app-text"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-app-border bg-app-surface text-body-sm text-left hover:border-brand/30 transition-colors"
                >
                  <PencilSimple size={20} className="text-app-text-muted shrink-0" />
                  <span className="font-semibold text-app-text">Edit</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setDeleteModalOpen(true);
                  }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-app-border bg-app-surface text-body-sm text-left hover:border-red-500/40 transition-colors"
                >
                  <Trash size={20} className="text-red-500 shrink-0" />
                  <span className="font-semibold text-red-500">Delete</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
