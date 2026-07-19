"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  type Icon,
  X,
  Image,
  ImageBroken,
  FileX,
  ArrowRight,
  ArrowLeft,
  CircleNotch,
  PencilSimple,
  PaperPlaneTilt,
  MapPin,
  FilePdf,
} from "@phosphor-icons/react";
import Button from "@/ui/Button";
import ConfirmModal from "@/ui/ConfirmModal";
import StatusTag from "./StatusTag";
import LocationViewer from "@/features/geolocation/components/LocationViewer";
import { getAnexoExpenseReportApi, getExpenseReportApi } from "../expense-report.api";
import { EXPENSE_REPORT_STATUS_DRAFT, type ExpenseReportItem, type ExpenseReport } from "../expense-report.types";
import { formatarData, formatarMoeda } from "@/lib/formatters";

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

function AttachmentPlaceholder({ icon: PhosphorIcon, label }: { icon: Icon; label: string }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2 text-app-text-subtle"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18 }}
    >
      <PhosphorIcon size={44} weight="thin" />
      <p className="text-small">{label}</p>
    </motion.div>
  );
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

export default function AuditView({ expenseReport: initialExpenseReport, onClose, onEdit, onSubmit, onApprove, onReject, onSchedule, onMarkPaid, onDownloadPdf, modalOpen = false }: Props) {
  const [expenseReport, setExpenseReport] = useState<ExpenseReport>(initialExpenseReport);
  const items = expenseReport.items ?? [];
  const [selectedItem, setSelectedItem] = useState<ExpenseReportItem | null>(items[0] ?? null);
  const [mobilePanel, setMobilePanel] = useState<"list" | "detail">("list");
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewLocation, setViewLocation] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (viewLocation || confirming || confirmReject || modalOpen) return;
      onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [viewLocation, confirming, confirmReject, modalOpen, onClose]);

  useEffect(() => {
    setExpenseReport(initialExpenseReport);
    const newItems = initialExpenseReport.items ?? [];
    setSelectedItem((current) => current ? (newItems.find((d) => d.id === current.id) ?? newItems[0] ?? null) : (newItems[0] ?? null));
  }, [initialExpenseReport]);

  useEffect(() => {
    getExpenseReportApi(initialExpenseReport.id)
      .then((updated) => {
        setExpenseReport(updated);
        const newItems = updated.items ?? [];
        setSelectedItem((current) => current ? (newItems.find((d) => d.id === current.id) ?? newItems[0] ?? null) : (newItems[0] ?? null));
      })
      .catch(() => { });
  }, [initialExpenseReport.id]);

  const total = items.reduce((acc, d) => acc + parseFloat(d.amount ?? "0"), 0);

  const attachment = selectedItem?.attachments?.[0] ?? null;
  const path = attachment?.path ?? null;
  const isPdf = path?.toLowerCase().endsWith(".pdf") ?? false;
  const isImage = path ? /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(path) : false;

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadingAttachment, setLoadingAttachment] = useState(false);
  const [imgError, setImgError] = useState(false);
  const prevBlobUrl = useRef<string | null>(null);

  useEffect(() => {
    setImgError(false);
    setBlobUrl(null);

    if (prevBlobUrl.current) {
      URL.revokeObjectURL(prevBlobUrl.current);
      prevBlobUrl.current = null;
    }

    if (!attachment || !selectedItem) return;

    let cancelled = false;
    setLoadingAttachment(true);

    getAnexoExpenseReportApi(expenseReport.id, selectedItem.id, attachment.id)
      .then((blob) => {
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        prevBlobUrl.current = url;
        setBlobUrl(url);
      })
      .catch(() => {
        if (!cancelled) setImgError(true);
      })
      .finally(() => {
        if (!cancelled) setLoadingAttachment(false);
      });

    return () => { cancelled = true; };
  }, [selectedItem?.id, attachment?.id]);

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
          <div className={`flex flex-col border-b md:border-b-0 md:border-r border-app-border md:w-2/5 ${mobilePanel === "detail" ? "hidden md:flex" : "flex"}`}>
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <p className="p-6 text-center text-body-sm text-app-text-muted">
                  No items recorded.
                </p>
              ) : (
                <ul>
                  {items.map((d) => (
                    <li key={d.id} className="relative">
                      {selectedItem?.id === d.id && (
                        <motion.div
                          layoutId="active-indicator-expenseReport"
                          className="absolute inset-0 border-l-2 border-l-brand bg-app-nav-active"
                          transition={SPRING}
                        />
                      )}
                      <motion.button
                        onClick={() => { setSelectedItem(d); setMobilePanel("detail"); }}
                        whileHover={{ x: selectedItem?.id === d.id ? 0 : 2 }}
                        transition={{ duration: 0.12 }}
                        className="relative z-10 w-full border-b border-app-border-subtle px-5 py-4 text-left"
                      >
                        <p className="line-clamp-1 text-caption font-semibold text-app-text">
                          {d.description}
                        </p>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-small text-app-text-muted">
                            {formatarData(d.expense_date)}
                          </span>
                          <span className="text-caption font-semibold text-app-text">
                            {d.amount ? formatarMoeda(parseFloat(d.amount)) : "—"}
                          </span>
                        </div>
                        {d.cost_center && (
                          <p className="mt-0.5 truncate text-small text-app-text-subtle">
                            {d.cost_center.description}
                          </p>
                        )}
                      </motion.button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="flex shrink-0 items-center justify-between border-t border-app-border bg-app-surface px-5 py-3">
                <span className="text-small text-app-text-muted">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
                <span className="text-caption font-semibold text-app-text">
                  {formatarMoeda(total)}
                </span>
              </div>
            )}
          </div>

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
                    <div className="relative flex h-80 items-center justify-center overflow-hidden border-b border-app-border bg-app-surface-raised/20">
                      <AnimatePresence mode="wait">
                        {loadingAttachment ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="flex flex-col items-center gap-2 text-app-text-subtle"
                          >
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                              className="inline-block"
                            >
                              <CircleNotch size={32} weight="thin" />
                            </motion.span>
                          </motion.div>
                        ) : !path ? (
                          <AttachmentPlaceholder key="empty" icon={Image} label="No attachment available" />
                        ) : isPdf && blobUrl ? (
                          <motion.iframe
                            key="pdf"
                            src={blobUrl}
                            className="h-full w-full"
                            title="PDF attachment"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          />
                        ) : isImage && blobUrl && !imgError ? (
                          <motion.img
                            key="img"
                            src={blobUrl}
                            alt={`Attachment — ${selectedItem.description}`}
                            className="h-full w-full object-contain"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onError={() => setImgError(true)}
                          />
                        ) : imgError ? (
                          <AttachmentPlaceholder key="error" icon={ImageBroken} label="Could not load the attachment" />
                        ) : (
                          <AttachmentPlaceholder key="unsupported" icon={FileX} label="Unsupported file format" />
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-3 p-5">
                      <div className="grid grid-cols-2 gap-3">
                        {(
                          [
                            { label: "Date", value: formatarData(selectedItem.expense_date) },
                            { label: "Amount", value: selectedItem.amount ? formatarMoeda(parseFloat(selectedItem.amount)) : "—" },
                            { label: "Category", value: selectedItem.expense_category?.description ?? "—" },
                            { label: "Cost Center", value: selectedItem.cost_center?.description ?? "—" },
                          ] as const
                        ).map(({ label, value }) => (
                          <div key={label} className="rounded-xl bg-app-surface-raised/30 p-3">
                            <p className="mb-0.5 text-small text-app-text-muted">{label}</p>
                            <p className="line-clamp-2 text-caption font-semibold text-app-text">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl bg-app-surface-raised/30 p-3">
                        <p className="mb-0.5 text-small text-app-text-muted">Description</p>
                        <p className="text-body-sm text-app-text">{selectedItem.description}</p>
                      </div>

                      {selectedItem.latitude != null && selectedItem.longitude != null ? (
                        <button
                          type="button"
                          onClick={() => setViewLocation(true)}
                          className="w-full text-left rounded-xl bg-app-surface-raised/30 p-3 hover:bg-app-surface-raised/60 transition-colors cursor-pointer"
                        >
                          <p className="mb-0.5 flex items-center gap-1.5 text-small text-app-text-muted">
                            <MapPin size={12} />
                            Location — click to view on map
                          </p>
                          <p className="text-body-sm text-app-text">
                            {selectedItem.address ?? `${Number(selectedItem.latitude).toFixed(6)}, ${Number(selectedItem.longitude).toFixed(6)}`}
                          </p>
                        </button>
                      ) : null}
                    </div>

                    <div className="px-5 pb-4">
                      <div className="rounded-2xl border border-app-border bg-app-surface-raised/40 p-4 space-y-3">
                        <h3 className="text-caption font-semibold text-app-text-muted uppercase tracking-wide">
                          Requester
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-small text-app-text-muted">Name</p>
                            <p className="text-body-sm text-app-text">{expenseReport.requester_description ?? "—"}</p>
                          </div>
                          <div>
                            <p className="text-small text-app-text-muted">Department</p>
                            <p className="text-body-sm text-app-text">{expenseReport.requester_department ?? "—"}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-small text-app-text-muted">Tax ID</p>
                            <p className="text-body-sm text-app-text">{expenseReport.requester_tax_id ?? "—"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {expenseReport.notes && (
                      <div className="px-5 pb-4">
                        <div className="rounded-2xl border border-app-border bg-app-surface-raised/40 p-4 space-y-2">
                          <h3 className="text-caption font-semibold text-app-text-muted uppercase tracking-wide">
                            Notes
                          </h3>
                          <p className="text-body-sm text-app-text whitespace-pre-line">{expenseReport.notes}</p>
                        </div>
                      </div>
                    )}

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
                    onClick={() => setConfirming(false)}
                    className="flex-1 md:flex-none"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="dark"
                    size="sm"
                    disabled={submitting}
                    onClick={handleConfirm}
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
                <Button variant="dark" onClick={() => setConfirming(true)} className="flex-1 md:flex-none">
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
                onClick={() => setConfirmReject(true)}
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
