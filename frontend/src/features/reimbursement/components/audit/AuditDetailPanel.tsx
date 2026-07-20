"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  type Icon,
  Image,
  ImageBroken,
  FileX,
  CalendarCheck,
  ArrowLeft,
  CircleNotch,
  MapPin,
} from "@phosphor-icons/react";
import { type ReimbursementItem, type Reimbursement } from "../../reimbursement.types";
import { getAnexoReimbursementApi } from "../../reimbursement.api";
import { formatarData, formatarMoeda } from "@/lib/formatters";

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
  selectedItem: ReimbursementItem | null;
  mobilePanel: "list" | "detail";
  onBack: () => void;
  onShowLocation: () => void;
}

export default function AuditDetailPanel({ reimbursement, selectedItem, mobilePanel, onBack, onShowLocation }: Props) {
  const path = selectedItem?.attachments?.[0]?.path ?? null;
  const isPdf = path?.toLowerCase().endsWith(".pdf") ?? false;
  const isImage = path ? /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(path) : false;

  const [erroredItemId, setErroredItemId] = useState<number | null>(null);

  const attachmentQuery = useQuery({
    queryKey: ["reimbursement-attachment", reimbursement.id, selectedItem?.id],
    queryFn: ({ signal }) => getAnexoReimbursementApi(reimbursement.id, selectedItem!.id, signal),
    enabled: Boolean(path && selectedItem),
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

  return (
    <div className={`flex flex-col overflow-hidden md:w-3/5 ${mobilePanel === "list" ? "hidden md:flex" : "flex"}`}>
      <button
        onClick={onBack}
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
                      onError={() => selectedItem && setErroredItemId(selectedItem.id)}
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
                      { label: "Amount", value: formatarMoeda(parseFloat(selectedItem.amount)) },
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
                    onClick={onShowLocation}
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
  );
}
