"use client";

import { Suspense } from "react";
import { Plus, Receipt } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import Loading from "@/ui/Loading";
import EmptyState from "@/ui/EmptyState";
import Button from "@/ui/Button";
import ExpenseReportForm from "@/features/expense-report/components/ExpenseReportForm";
import ExpenseReportListCard from "@/features/expense-report/components/ExpenseReportListCard";
import {
  useMyExpenseReportsPage,
  type StatusFilter,
} from "@/features/expense-report/hooks/useMyExpenseReportsPage";
import { EXPENSE_REPORT_STATUS_LABEL } from "@/features/expense-report/expense-report.types";

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

export default function MyExpenseReportsPage() {
  return (
    <Suspense fallback={<Loading size="sm" />}>
      <MyExpenseReportsContent />
    </Suspense>
  );
}

function MyExpenseReportsContent() {
  const {
    loading,
    error,
    load,
    statusFilter,
    setStatusFilter,
    showForm,
    setShowForm,
    filteredExpenseReports,
    handleCreate,
  } = useMyExpenseReportsPage();

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
                  <ExpenseReportListCard key={expenseReport.id} expenseReport={expenseReport} />
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
