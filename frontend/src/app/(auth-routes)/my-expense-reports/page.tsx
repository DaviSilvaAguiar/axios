"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Receipt, CalendarDots } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/ui/Card";
import Loading from "@/ui/Loading";
import EmptyState from "@/ui/EmptyState";
import Button from "@/ui/Button";
import ExpenseReportForm from "@/features/expense-report/components/ExpenseReportForm";
import StatusTag from "@/features/expense-report/components/StatusTag";
import { toast } from "@/lib/toast";
import {
  listExpenseReportsApi,
  createExpenseReportApi,
  createExpenseReportItemApi,
  getExpenseReportApi,
} from "@/features/expense-report/expense-report.api";
import {
  EXPENSE_REPORT_STATUS_LABEL,
  type ExpenseReportItemFormItem,
  type ExpenseReport,
  type ExpenseReportStatus,
  type StoreExpenseReportWithDespesasFormData,
} from "@/features/expense-report/expense-report.types";

type StatusFilter = "" | ExpenseReportStatus;

const STATUS_CHIPS: { label: string; value: StatusFilter }[] = [
  { label: "All",                       value: "" },
  { label: EXPENSE_REPORT_STATUS_LABEL[1],         value: 1 },
  { label: EXPENSE_REPORT_STATUS_LABEL[2],         value: 2 },
  { label: EXPENSE_REPORT_STATUS_LABEL[3],         value: 3 },
  { label: EXPENSE_REPORT_STATUS_LABEL[4],         value: 4 },
  { label: EXPENSE_REPORT_STATUS_LABEL[5],         value: 5 },
  { label: EXPENSE_REPORT_STATUS_LABEL[6],         value: 6 },
  { label: EXPENSE_REPORT_STATUS_LABEL[7],         value: 7 },
];

const STATUS_BORDER: Record<number, string> = {
  1: "border-l-blue-400",
  2: "border-l-orange-400",
  3: "border-l-amber-400",
  4: "border-l-green-400",
  5: "border-l-purple-400",
  6: "border-l-app-border",
  7: "border-l-red-400",
};

function fmtAmount(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
}

function calcTotal(expenseReport: ExpenseReport) {
  return (expenseReport.items ?? []).reduce((acc, d) => acc + Number(d.amount ?? 0), 0);
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
  for (const file of files) fd.append("attachments[]", file);
  return fd;
}

interface ExpenseReportCardProps {
  expenseReport: ExpenseReport;
}

function ExpenseReportCard({ expenseReport }: ExpenseReportCardProps) {
  const total = calcTotal(expenseReport);
  const count = (expenseReport.items ?? []).length;
  const border = STATUS_BORDER[expenseReport.status] ?? "border-l-app-border";

  return (
    <Link href={`/my-expense-reports/${expenseReport.id}`}>
      <motion.div whileTap={{ scale: 0.98 }} transition={{ duration: 0.12 }}>
        <Card className={`p-0 border-l-4 ${border} overflow-hidden hover:shadow-md transition-all cursor-pointer`}>
          <div className="p-4 space-y-2.5">
            <p className="text-body font-semibold text-app-text leading-snug line-clamp-2">
              {expenseReport.description}
            </p>
            <div className="flex items-center justify-between gap-2">
              <StatusTag status={expenseReport.status} />
              <span className="text-caption text-app-text-subtle shrink-0">
                {fmtDate(expenseReport.created_at)}
              </span>
            </div>
            {expenseReport.period_start_date && expenseReport.period_end_date && (
              <div className="flex items-center gap-1.5 text-small text-app-text-muted">
                <CalendarDots size={13} weight="bold" className="shrink-0" />
                <span>
                  {fmtDate(expenseReport.period_start_date)} → {fmtDate(expenseReport.period_end_date)}
                </span>
              </div>
            )}
          </div>
          <div className="border-t border-app-border-subtle px-4 py-2.5 flex items-center justify-between bg-app-surface-raised/40">
            <p className="text-body font-bold text-app-text">{fmtAmount(total)}</p>
            <span className="text-caption text-app-text-subtle">
              {count} {count === 1 ? "item" : "items"}
            </span>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}

export default function MyExpenseReportsPage() {
  return (
    <Suspense fallback={<Loading size="sm" />}>
      <MyExpenseReportsContent />
    </Suspense>
  );
}

function MyExpenseReportsContent() {
  const params = useSearchParams();
  const [rdcs, setExpenseReports] = useState<ExpenseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listExpenseReportsApi();
      setExpenseReports(data);
    } catch {
      setError("Could not load the reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (params.get("novo") === "1") setShowForm(true);
  }, [params]);

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

      const fullExpenseReport = await getExpenseReportApi(created.id);
      setExpenseReports((prev) => [fullExpenseReport, ...prev]);
      setShowForm(false);
      toast.success("Report created successfully!");
    } catch (err) {
      if (newId !== null) {
        setShowForm(false);
        toast.success("Report created. Refresh if the item does not appear.");
        load();
        return;
      }
      toast.error(err instanceof Error ? err.message : "Could not save.");
    }
  }

  return (
    <>
      <div className="flex flex-col min-h-full pb-24">
        <div className="sticky top-0 z-10 bg-app-bg/95 backdrop-blur-sm border-b border-app-border-subtle">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <h1 className="text-feature-title text-app-text">My Expense Reports</h1>
            <button
              onClick={() => setShowForm(true)}
              className="hidden sm:block"
            >
              <Button variant="dark" size="sm">
                <Plus size={14} weight="bold" />
                New Report
              </Button>
            </button>
          </div>

          <div className="flex gap-2 px-4 sm:px-6 pb-3 overflow-x-auto scrollbar-none">
            {STATUS_CHIPS.map((chip) => (
              <button
                key={chip.value}
                onClick={() => setStatusFilter(chip.value)}
                className={[
                  "shrink-0 rounded-full px-3.5 py-1.5 text-small font-semibold transition-colors whitespace-nowrap",
                  statusFilter === chip.value
                    ? "bg-brand text-white"
                    : "bg-app-surface border border-app-border text-app-text-muted hover:border-brand/40 hover:text-app-text",
                ].join(" ")}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 px-4 sm:px-6 pt-4">
          {loading ? (
            <Loading />
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center">
              <p className="text-small text-red-700">{error}</p>
              <button
                onClick={load}
                className="mt-2 text-caption font-semibold text-brand hover:underline"
              >
                Try again
              </button>
            </div>
          ) : filteredExpenseReports.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No reports found"
              description={
                statusFilter
                  ? "There are no records with this status."
                  : "Open your first report to record expenses."
              }
              action={
                statusFilter
                  ? { label: "View all", onClick: () => setStatusFilter("") }
                  : { label: "New Report", onClick: () => setShowForm(true) }
              }
            />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={statusFilter}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
              >
                {filteredExpenseReports.map((expenseReport) => (
                  <ExpenseReportCard key={expenseReport.id} expenseReport={expenseReport} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <ExpenseReportForm
            onSave={handleCreate}
            onClose={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
