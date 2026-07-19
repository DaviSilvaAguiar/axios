import type { SubmissionType } from "@/features/provider/provider.types";

const STYLES: Record<SubmissionType, string> = {
  expense_report: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  reimbursement: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
};

const LABELS: Record<SubmissionType, string> = {
  expense_report: "Report",
  reimbursement: "Reimbursement",
};

export default function TypeChip({ type }: { type: SubmissionType }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-small font-semibold ${STYLES[type]}`}
    >
      {LABELS[type]}
    </span>
  );
}
