"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  type Icon,
  X,
  FilePdf,
  Image,
  ImageBroken,
  FileX,
  CalendarCheck,
  ArrowRight,
  ArrowLeft,
  CircleNotch,
  Package,
  MapPin,
} from "@phosphor-icons/react";
import Button from "@/ui/Button";
import StatusTag from "./StatusTag";
import RejectionModal from "./RejectionModal";
import LocationViewer from "@/features/geolocation/components/LocationViewer";
import { type ReimbursementItem, type Reimbursement } from "../reimbursement.types";
import { getAnexoReimbursementApi } from "../reimbursement.api";
import { formatarData } from "@/lib/formatters";

const SPRING = { type: "spring" as const, stiffness: 380, damping: 30 };

function formatAmount(v: string | number): string {
  return parseFloat(String(v)).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name?: string): string {
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
  reimbursement: Reimbursement;
  onClose: () => void;
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number, reason: string) => Promise<void>;
  onDownloadPdf: (id: number) => Promise<void>;
}

export default function AuditView({ reimbursement, onClose, onApprove, onReject, onDownloadPdf }: Props) {
  const items = reimbursement.items ?? [];
  const [selectedItem, setSelectedItem] = useState<ReimbursementItem | null>(items[0] ?? null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"list" | "detail">("list");
  const [showLocation, setShowLocation] = useState(false);

  const total = items.reduce((acc, d) => acc + parseFloat(d.amount), 0);

  const path = selectedItem?.attachments?.[0]?.path ?? null;
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

    if (!path || !selectedItem) return;

    let cancelled = false;
    setLoadingAttachment(true);

    getAnexoReimbursementApi(reimbursement.id, selectedItem.id)
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
  }, [selectedItem?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleApprove() {
    setLoadingApprove(true);
    try {
      await onApprove(reimbursement.id);
    } finally {
      setLoadingApprove(false);
    }
  }

  async function handleReject(reason: string) {
    await onReject(reimbursement.id, reason);
    setShowRejectionModal(false);
  }

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
              {getInitials(reimbursement.user?.name)}
            </div>
            <div className="min-w-0">
              <h2 className="text-feature-title text-app-text truncate">{reimbursement.title}</h2>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                <span className="text-small text-app-text-muted">{reimbursement.user?.name ?? "—"}</span>
                <span className="text-[10px] text-app-text-subtle">·</span>
                <span className="text-small text-app-text-muted">
                  {formatarData(reimbursement.period_start_date)}
                </span>
                <ArrowRight size={11} className="text-app-text-subtle" />
                <span className="text-small text-app-text-muted">
                  {formatarData(reimbursement.period_end_date)}
                </span>
              </div>
              {reimbursement.lote_exportacao && (
                <div className="mt-1 flex items-center gap-1.5">
                  <Package size={11} className="text-brand" weight="fill" />
                  <span className="text-small text-app-text-muted">
                    Exported in batch #{reimbursement.lote_exportacao.id} on{" "}
                    {formatDateTime(reimbursement.lote_exportacao.created_at)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0">
            <StatusTag status={reimbursement.status} />
            <button
              onClick={onClose}
              className="rounded-full p-2 text-app-text-muted transition-colors hover:bg-app-hover"
            >
              <X size={18} />
            </button>
          </div>
        </div>

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
                          layoutId="active-indicator"
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
                            {formatAmount(d.amount)}
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
                  {formatAmount(total)}
                </span>
              </div>
            )}

            {(reimbursement.bank || reimbursement.branch || reimbursement.account_number || reimbursement.pix_key) && (
              <div className="shrink-0 border-t border-app-border bg-app-surface px-5 py-4 space-y-2">
                <p className="text-small font-semibold text-app-text-muted uppercase tracking-wide">
                  Payment Details
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {reimbursement.bank && (
                    <div>
                      <p className="text-small text-app-text-muted">Bank</p>
                      <p className="text-caption font-semibold text-app-text">{reimbursement.bank}</p>
                    </div>
                  )}
                  {reimbursement.branch && (
                    <div>
                      <p className="text-small text-app-text-muted">Branch</p>
                      <p className="text-caption font-semibold text-app-text">{reimbursement.branch}</p>
                    </div>
                  )}
                  {reimbursement.account_number && (
                    <div>
                      <p className="text-small text-app-text-muted">Account</p>
                      <p className="text-caption font-semibold text-app-text">{reimbursement.account_number}</p>
                    </div>
                  )}
                  {reimbursement.pix_key && (
                    <div className="col-span-2">
                      <p className="text-small text-app-text-muted">Pix Key</p>
                      <p className="text-caption font-semibold text-app-text">{reimbursement.pix_key}</p>
                    </div>
                  )}
                </div>
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
                            { label: "Amount", value: formatAmount(selectedItem.amount) },
                            { label: "Category", value: selectedItem.expense_category?.description ?? "—" },
                            {
                              label: "Cost Center",
                              value: selectedItem.cost_center?.description ?? "—",
                            },
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
                          onClick={() => setShowLocation(true)}
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

                    {reimbursement.status === 5 && reimbursement.scheduled_payment_date && (
                      <div className="mx-5 mb-4 flex items-center gap-3 rounded-2xl border border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/60 px-4 py-3">
                        <CalendarCheck size={18} className="shrink-0 text-purple-600 dark:text-purple-400" />
                        <div>
                          <p className="text-caption font-semibold text-purple-700 dark:text-purple-300">
                            Scheduled Payment
                          </p>
                          <p className="text-small text-purple-600 dark:text-purple-400">
                            {formatarData(reimbursement.scheduled_payment_date)}
                          </p>
                        </div>
                      </div>
                    )}

                    {reimbursement.status === 7 && reimbursement.rejection_reason && (
                      <div className="mx-5 mb-4 rounded-2xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/60 px-4 py-3">
                        <p className="mb-0.5 text-caption font-semibold text-red-700 dark:text-red-300">
                          Rejection Reason
                        </p>
                        <p className="text-small text-red-600 dark:text-red-400">{reimbursement.rejection_reason}</p>
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

        {(reimbursement.status === 2 || reimbursement.status === 3) && (
          <div className="flex shrink-0 gap-3 border-t border-app-border bg-app-surface px-5 py-4 md:justify-end">
            <Button variant="outlined" onClick={() => setShowRejectionModal(true)} className="flex-1 md:flex-none">
              Reject Reimbursement
            </Button>
            <Button variant="dark" onClick={handleApprove} disabled={loadingApprove} className="flex-1 md:flex-none">
              {loadingApprove ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    <CircleNotch size={14} />
                  </motion.span>
                  Approving…
                </span>
              ) : (
                "Approve Reimbursement"
              )}
            </Button>
          </div>
        )}

        {reimbursement.status >= 4 && reimbursement.status !== 7 && (
          <div className="flex shrink-0 border-t border-app-border bg-app-surface px-5 py-4 md:justify-end">
            <motion.button
              onClick={() => onDownloadPdf(reimbursement.id)}
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

      {showRejectionModal && (
        <RejectionModal
          onConfirm={handleReject}
          onCancel={() => setShowRejectionModal(false)}
        />
      )}

      {selectedItem?.latitude != null && selectedItem?.longitude != null && (
        <LocationViewer
          open={showLocation}
          onClose={() => setShowLocation(false)}
          localizacao={{
            latitude: Number(selectedItem.latitude),
            longitude: Number(selectedItem.longitude),
            address: selectedItem.address ?? null,
          }}
        />
      )}
    </>
  );
}
