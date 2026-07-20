"use client";

import { CircleNotch, PencilSimple, PaperPlaneTilt, FilePdf } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import Button from "@/ui/Button";
import type { ExpenseReport } from "../../expense-report.types";

interface Props {
  expenseReport: ExpenseReport;
  isDraft: boolean;
  isUnderReview: boolean;
  isApproved: boolean;
  isScheduled: boolean;
  confirming: boolean;
  submitting: boolean;
  rejecting: boolean;
  onStartConfirm: () => void;
  onCancelConfirm: () => void;
  onConfirmSubmit: () => void;
  onEdit: () => void;
  onApprove?: (expenseReport: ExpenseReport) => void;
  onReject?: (expenseReport: ExpenseReport, reason?: string) => Promise<void>;
  onRequestReject: () => void;
  onSchedule?: (expenseReport: ExpenseReport) => void;
  onMarkPaid?: (expenseReport: ExpenseReport) => void;
  onDownloadPdf?: (id: number) => void;
}

export default function AuditActionFooter({
  expenseReport,
  isDraft,
  isUnderReview,
  isApproved,
  isScheduled,
  confirming,
  submitting,
  rejecting,
  onStartConfirm,
  onCancelConfirm,
  onConfirmSubmit,
  onEdit,
  onApprove,
  onReject,
  onRequestReject,
  onSchedule,
  onMarkPaid,
  onDownloadPdf,
}: Props) {
  return (
    <>
      {isDraft && (
        <div className="shrink-0 border-t border-app-border bg-app-surface px-5 py-4">
          {confirming ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/60 p-4 space-y-3">
              <p className="text-body-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                After submission the report will be locked for editing and will move to the auditor for approval.
              </p>
              <div className="flex gap-2 md:justify-end">
                <Button
                  variant="light"
                  size="sm"
                  disabled={submitting}
                  onClick={onCancelConfirm}
                  className="flex-1 md:flex-none"
                >
                  Cancel
                </Button>
                <Button
                  variant="dark"
                  size="sm"
                  disabled={submitting}
                  onClick={onConfirmSubmit}
                  className="flex-1 md:flex-none"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                        className="inline-block"
                      >
                        <CircleNotch size={14} />
                      </motion.span>
                      Submitting…
                    </span>
                  ) : (
                    "Confirm submission"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 md:justify-end">
              <Button variant="outlined" onClick={onEdit} className="flex-1 md:flex-none">
                <PencilSimple size={14} />
                Edit
              </Button>
              <Button variant="dark" onClick={onStartConfirm} className="flex-1 md:flex-none">
                <PaperPlaneTilt size={14} />
                Submit
              </Button>
            </div>
          )}
        </div>
      )}

      {isUnderReview && (onApprove || onReject) && (
        <div className="flex shrink-0 gap-3 border-t border-app-border bg-app-surface px-5 py-4 md:justify-end">
          {onReject && (
            <Button
              variant="outlined"
              onClick={onRequestReject}
              disabled={rejecting}
              className="flex-1 md:flex-none"
            >
              Reject
            </Button>
          )}
          {onApprove && (
            <Button variant="dark" onClick={() => onApprove(expenseReport)} className="flex-1 md:flex-none">
              Approve
            </Button>
          )}
        </div>
      )}

      {isApproved && onSchedule && (
        <div className="flex shrink-0 gap-3 border-t border-app-border bg-app-surface px-5 py-4 md:justify-end">
          <Button variant="dark" onClick={() => onSchedule(expenseReport)} className="flex-1 md:flex-none">
            Schedule Payment
          </Button>
        </div>
      )}

      {isScheduled && onMarkPaid && (
        <div className="flex shrink-0 gap-3 border-t border-app-border bg-app-surface px-5 py-4 md:justify-end">
          <Button variant="dark" onClick={() => onMarkPaid(expenseReport)} className="flex-1 md:flex-none">
            Mark as Paid
          </Button>
        </div>
      )}

      {expenseReport.status >= 4 && expenseReport.status !== 7 && onDownloadPdf && (
        <div className="flex shrink-0 border-t border-app-border bg-app-surface px-5 py-4 md:justify-end">
          <motion.button
            onClick={() => onDownloadPdf(expenseReport.id)}
            whileHover={{ x: 3 }}
            transition={{ duration: 0.12 }}
            className="flex w-full justify-center md:w-auto cursor-pointer items-center gap-2 text-caption font-semibold text-brand hover:underline"
          >
            <FilePdf size={18} />
            Download PDF
          </motion.button>
        </div>
      )}
    </>
  );
}
