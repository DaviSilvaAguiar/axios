"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import ConfirmModal from "@/ui/ConfirmModal";
import StatusTag from "./StatusTag";
import AuditItemsList from "./audit/AuditItemsList";
import AuditAttachmentViewer from "./audit/AuditAttachmentViewer";
import AuditItemDetails from "./audit/AuditItemDetails";
import AuditActionFooter from "./audit/AuditActionFooter";
import LocationViewer from "@/features/geolocation/components/LocationViewer";
import { getAnexoExpenseReportApi } from "../expense-report.api";
import { EXPENSE_REPORT_STATUS_DRAFT, type ExpenseReport } from "../expense-report.types";
import { formatarData } from "@/lib/formatters";

const SPRING = { type: "spring" as const, stiffness: 380, damping: 30 };

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase();
}

interface Props {
  expenseReport: ExpenseReport;
  onClose: () => void;
  onEdit: () => void;
  onSubmit: () => Promise<void>;
  onApprove?: (expenseReport: ExpenseReport) => void;
  onReject?: (expenseReport: ExpenseReport, reason?: string) => Promise<void>;
  onSchedule?: (expenseReport: ExpenseReport) => void;
  onMarkPaid?: (expenseReport: ExpenseReport) => void;
  onDownloadPdf?: (id: number) => void;
  modalOpen?: boolean;
}

export default function AuditView({ expenseReport, onClose, onEdit, onSubmit, onApprove, onReject, onSchedule, onMarkPaid, onDownloadPdf, modalOpen = false }: Props) {
  const items = expenseReport.items ?? [];
  const [selectedItemId, setSelectedItemId] = useState<number | null>(items[0]?.id ?? null);
  const selectedItem = items.find((d) => d.id === selectedItemId) ?? items[0] ?? null;
  const [mobilePanel, setMobilePanel] = useState<"list" | "detail">("list");
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewLocation, setViewLocation] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [erroredItemId, setErroredItemId] = useState<number | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (viewLocation || confirming || confirmReject || modalOpen) return;
      onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [viewLocation, confirming, confirmReject, modalOpen, onClose]);

  const total = items.reduce((acc, d) => acc + parseFloat(d.amount ?? "0"), 0);

  const attachment = selectedItem?.attachments?.[0] ?? null;
  const path = attachment?.path ?? null;
  const isPdf = path?.toLowerCase().endsWith(".pdf") ?? false;
  const isImage = path ? /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(path) : false;

  const attachmentQuery = useQuery({
    queryKey: ["expense-report-attachment", expenseReport.id, selectedItem?.id],
    queryFn: ({ signal }) => getAnexoExpenseReportApi(expenseReport.id, selectedItem!.id, attachment!.id, signal),
    enabled: Boolean(path && selectedItem && attachment),
  });

  const blob = attachmentQuery.data;
  const blobUrl = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const loadingAttachment = attachmentQuery.isFetching;
  const imgError = attachmentQuery.isError || erroredItemId === selectedItem?.id;

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await onSubmit();
      setConfirming(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmReject() {
    if (!onReject) return;
    setRejecting(true);
    try {
      await onReject(expenseReport, rejectReason || undefined);
      setConfirmReject(false);
      setRejectReason("");
    } finally {
      setRejecting(false);
    }
  }

  const isDraft = expenseReport.status === EXPENSE_REPORT_STATUS_DRAFT;
  const isUnderReview = expenseReport.status === 2 || expenseReport.status === 3;
  const isApproved = expenseReport.status === 4;
  const isScheduled = expenseReport.status === 5;
  const period = expenseReport.period_start_date && expenseReport.period_end_date
    ? { start: expenseReport.period_start_date, end: expenseReport.period_end_date }
    : null;

  const currentLocation = selectedItem?.latitude != null && selectedItem?.longitude != null
    ? {
      latitude: Number(selectedItem.latitude),
      longitude: Number(selectedItem.longitude),
      address: selectedItem.address ?? null,
    }
    : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-app-border bg-app-surface"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-app-border px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-app-surface-raised font-ui text-[11px] font-semibold text-app-text-muted">
              {getInitials(expenseReport.requester_description)}
            </div>
            <div className="min-w-0">
              <h2 className="text-feature-title text-app-text truncate">{expenseReport.description}</h2>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                <span className="text-small text-app-text-muted">
                  {expenseReport.requester_description ?? "—"}
                </span>
                {period && (
                  <>
                    <span className="text-[10px] text-app-text-subtle">·</span>
                    <span className="text-small text-app-text-muted">
                      {formatarData(period.start)}
                    </span>
                    <ArrowRight size={11} className="text-app-text-subtle" />
                    <span className="text-small text-app-text-muted">
                      {formatarData(period.end)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0">
            <StatusTag status={expenseReport.status} />
            <button
              onClick={onClose}
              className="rounded-full p-2 text-app-text-muted transition-colors hover:bg-app-hover"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {expenseReport.status === 7 && expenseReport.rejection_reason && (
          <div className="shrink-0 border-b border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/60 px-6 py-3 space-y-0.5">
            <p className="text-small font-semibold text-red-700 dark:text-red-300 uppercase tracking-wide">
              Rejection Reason
            </p>
            <p className="text-body-sm text-red-600 dark:text-red-400 whitespace-pre-line break-words">
              {expenseReport.rejection_reason}
            </p>
          </div>
        )}

        {(expenseReport.status === 5 || expenseReport.status === 6) && expenseReport.paid_at && (
          <div className="shrink-0 border-b border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/60 px-6 py-3 space-y-0.5">
            <p className="text-small font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
              {expenseReport.status === 6 ? "Payment Date" : "Payment Scheduled For"}
            </p>
            <p className="text-body-sm text-emerald-700 dark:text-emerald-300 font-semibold">
              {formatarData(expenseReport.paid_at)}
            </p>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          <AuditItemsList
            items={items}
            selectedItem={selectedItem}
            mobilePanel={mobilePanel}
            total={total}
            onSelectItem={(id) => { setSelectedItemId(id); setMobilePanel("detail"); }}
          />

          <div className={`flex flex-col overflow-hidden md:w-3/5 ${mobilePanel === "list" ? "hidden md:flex" : "flex"}`}>
            <button
              onClick={() => setMobilePanel("list")}
              className="md:hidden flex items-center gap-1.5 px-4 py-2.5 border-b border-app-border text-small font-semibold text-app-text-muted hover:bg-app-hover transition-colors"
            >
              <ArrowLeft size={15} />
              Back to items
            </button>

            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {selectedItem ? (
                  <motion.div
                    key={selectedItem.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <AuditAttachmentViewer
                      loadingAttachment={loadingAttachment}
                      path={path}
                      isPdf={isPdf}
                      isImage={isImage}
                      blobUrl={blobUrl}
                      imgError={imgError}
                      description={selectedItem.description}
                      onImgError={() => selectedItem && setErroredItemId(selectedItem.id)}
                    />

                    <AuditItemDetails
                      expenseReport={expenseReport}
                      selectedItem={selectedItem}
                      onViewLocation={() => setViewLocation(true)}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex min-h-[240px] items-center justify-center text-app-text-muted"
                  >
                    <p className="text-body-sm">Select an item</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

        <AuditActionFooter
          expenseReport={expenseReport}
          isDraft={isDraft}
          isUnderReview={isUnderReview}
          isApproved={isApproved}
          isScheduled={isScheduled}
          confirming={confirming}
          submitting={submitting}
          rejecting={rejecting}
          onStartConfirm={() => setConfirming(true)}
          onCancelConfirm={() => setConfirming(false)}
          onConfirmSubmit={handleConfirm}
          onEdit={onEdit}
          onApprove={onApprove}
          onReject={onReject}
          onRequestReject={() => setConfirmReject(true)}
          onSchedule={onSchedule}
          onMarkPaid={onMarkPaid}
          onDownloadPdf={onDownloadPdf}
        />
      </motion.div>
      {currentLocation && (
        <LocationViewer
          open={viewLocation}
          onClose={() => setViewLocation(false)}
          localizacao={currentLocation}
        />
      )}

      <ConfirmModal
        open={confirmReject}
        title="Reject request?"
        description="The request will be marked as rejected and the provider will need to create a new one to submit again."
        confirmLabel="Reject"
        loadingLabel="Rejecting…"
        loading={rejecting}
        onConfirm={handleConfirmReject}
        onCancel={() => { if (!rejecting) { setConfirmReject(false); setRejectReason(""); } }}
      >
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Reason (optional)"
          rows={3}
          className="w-full rounded-xl border border-app-border bg-app-surface-raised/40 px-3 py-2 text-body-sm text-app-text placeholder:text-app-text-subtle resize-none focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </ConfirmModal>
    </>
  );
}
