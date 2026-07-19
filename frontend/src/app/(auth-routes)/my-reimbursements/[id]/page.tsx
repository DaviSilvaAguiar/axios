"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  PencilSimple,
  Trash,
  X,
  CalendarCheck,
  XCircle,
  Receipt,
  ForkKnife,
  Car,
  House,
  Airplane,
  DotsThreeVertical,
  Plus,
  Eye,
  ClockCountdown,
  MagnifyingGlass,
  CheckCircle,
  Wallet,
} from "@phosphor-icons/react";
import { type Icon } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/ui/Card";
import Loading from "@/ui/Loading";
import Button from "@/ui/Button";
import FormReimbursement from "@/features/reimbursement/components/FormReimbursement";
import { toast } from "@/lib/toast";
import {
  getReimbursementApi,
  deleteReimbursementApi,
  updateReimbursementApi,
  createReimbursementItemApi,
  updateReimbursementItemApi,
  deleteReimbursementItemApi,
  adicionarAnexoReimbursementApi,
  deleteAnexoEspecificoReimbursementApi,
  getAnexoEspecificoReimbursementApi,
} from "@/features/reimbursement/reimbursement.api";
import { REIMBURSEMENT_STATUS_LABEL } from "@/features/reimbursement/reimbursement.types";
import type { Reimbursement, StoreReimbursementWithDespesasFormData } from "@/features/reimbursement/reimbursement.types";
import type { AttachmentToAdd, AttachmentToDelete } from "@/features/reimbursement/components/FormReimbursement";

function fmtAmount(amount: number) {
  return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
}

function fmtShortDate(iso: string) {
  const [, m, d] = iso.split("T")[0].split("-");
  return `${d}/${m}`;
}

function getCategoryIcon(description: string | undefined | null): Icon {
  if (!description) return Receipt;
  const d = description.toLowerCase();
  if (/alimenta|refeição|almoço|jantar|lanche|restaurante/.test(d)) return ForkKnife;
  if (/combustível|gasolina|etanol|diesel|transporte|uber|taxi|táxi|ônibus/.test(d)) return Car;
  if (/hospedagem|hotel|pousada|airbnb/.test(d)) return House;
  if (/passagem|avião|aéreo|voo|flight/.test(d)) return Airplane;
  return Receipt;
}

function getCategoryColors(description: string | undefined | null): { bg: string; fg: string } {
  if (!description) return { bg: "bg-app-surface-raised", fg: "text-app-text-muted" };
  const d = description.toLowerCase();
  if (/alimenta|refeição|almoço|jantar|lanche|restaurante/.test(d))
    return { bg: "bg-amber-100 dark:bg-amber-950/60", fg: "text-amber-700 dark:text-amber-300" };
  if (/combustível|gasolina|etanol|diesel|transporte|uber|taxi|táxi|ônibus/.test(d))
    return { bg: "bg-blue-100 dark:bg-blue-950/60", fg: "text-blue-700 dark:text-blue-300" };
  if (/hospedagem|hotel|pousada|airbnb/.test(d))
    return { bg: "bg-purple-100 dark:bg-purple-950/60", fg: "text-purple-700 dark:text-purple-300" };
  if (/passagem|avião|aéreo|voo|flight/.test(d))
    return { bg: "bg-indigo-100 dark:bg-indigo-950/60", fg: "text-indigo-700 dark:text-indigo-300" };
  return { bg: "bg-app-surface-raised", fg: "text-app-text-muted" };
}

const STATUS_MINI_CONFIG: Record<
  number,
  { icon: Icon; bg: string; border: string; fg: string; helperFg: string; helper: string }
> = {
  1: {
    icon: ClockCountdown,
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-200 dark:border-blue-800",
    fg: "text-blue-700 dark:text-blue-300",
    helperFg: "text-blue-600/80 dark:text-blue-400/80",
    helper: "Awaiting approval",
  },
  2: {
    icon: MagnifyingGlass,
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
    fg: "text-amber-700 dark:text-amber-300",
    helperFg: "text-amber-600/80 dark:text-amber-400/80",
    helper: "Under financial review",
  },
  3: {
    icon: CheckCircle,
    bg: "bg-green-50 dark:bg-green-950/40",
    border: "border-green-200 dark:border-green-800",
    fg: "text-green-700 dark:text-green-300",
    helperFg: "text-green-600/80 dark:text-green-400/80",
    helper: "Approved for payment",
  },
  4: {
    icon: CalendarCheck,
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-200 dark:border-purple-800",
    fg: "text-purple-700 dark:text-purple-300",
    helperFg: "text-purple-600/80 dark:text-purple-400/80",
    helper: "Payment scheduled",
  },
  5: {
    icon: Wallet,
    bg: "bg-app-surface-raised",
    border: "border-app-border",
    fg: "text-app-text",
    helperFg: "text-app-text-muted",
    helper: "Reimbursement completed",
  },
  6: {
    icon: XCircle,
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-200 dark:border-red-900",
    fg: "text-red-600 dark:text-red-400",
    helperFg: "text-red-500/80 dark:text-red-400/70",
    helper: "Request rejected",
  },
};

interface AttachmentThumbnailProps {
  reimbursementId: number;
  itemId: number;
  attachmentId: number;
  path: string;
  onOpen: () => void;
}

function AttachmentThumbnailItem({ reimbursementId, itemId, attachmentId, path, onOpen }: AttachmentThumbnailProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isImage = /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(path);

  useEffect(() => {
    let url: string;
    getAnexoEspecificoReimbursementApi(reimbursementId, itemId, attachmentId)
      .then((blob) => {
        url = URL.createObjectURL(blob);
        setSrc(url);
      })
      .catch(() => setSrc(null))
      .finally(() => setLoading(false));
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [reimbursementId, itemId, attachmentId]);

  const baseClass =
    "group relative h-16 w-16 rounded-xl shrink-0 border border-app-border overflow-hidden cursor-pointer transition";

  if (loading) {
    return <div className={`${baseClass} animate-pulse bg-app-surface-raised`} />;
  }

  if (isImage && src) {
    return (
      <button onClick={onOpen} className={`${baseClass} p-0`} type="button">
        <img src={src} alt="Attachment" className="h-full w-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
          <Eye size={18} weight="bold" className="text-white" />
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onOpen}
      className={`${baseClass} bg-app-surface-raised flex items-center justify-center hover:bg-app-surface-raised-hover`}
      type="button"
    >
      <Eye size={20} className="text-app-text-muted" />
    </button>
  );
}

interface ConfirmDialogProps {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

function ConfirmDialog({ title, onConfirm, onCancel, loading }: ConfirmDialogProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.45)" }}
      onMouseDown={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        className="w-full max-w-sm rounded-2xl bg-app-surface p-6 space-y-5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="space-y-1.5">
          <h2 className="text-feature-title text-app-text">{title}</h2>
          <p className="text-small text-app-text-muted">
            This action cannot be undone. The record will be permanently removed.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="light" fullWidth onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="dark"
            fullWidth
            onClick={onConfirm}
            disabled={loading}
            className="!bg-red-600 hover:!bg-red-700"
          >
            {loading ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ReimbursementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [reimbursement, setReimbursement] = useState<Reimbursement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deletingItem, setDeletingItem] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getReimbursementApi(Number(id))
      .then(setReimbursement)
      .catch(() => setError("Could not load the reimbursement."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!showMenu) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteReimbursementApi(Number(id));
      toast.success("Reimbursement deleted successfully.");
      router.push("/my-reimbursements");
    } catch {
      toast.error("Error deleting the reimbursement.");
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  }

  async function handleDeleteItem() {
    if (!reimbursement || itemToDelete === null) return;
    setDeletingItem(true);
    try {
      await deleteReimbursementItemApi(reimbursement.id, itemToDelete);
      toast.success("Item deleted.");
      setItemToDelete(null);
      const updated = await getReimbursementApi(reimbursement.id);
      setReimbursement(updated);
    } catch {
      toast.error("Error deleting the item.");
    } finally {
      setDeletingItem(false);
    }
  }

  async function handleSaveEdit(
    data: StoreReimbursementWithDespesasFormData,
    deleteItemIds: number[],
    deleteAttachments: AttachmentToDelete[],
    addAttachments: AttachmentToAdd[]
  ) {
    if (!reimbursement) return;
    try {
      const { items, ...header } = data;

      await updateReimbursementApi(reimbursement.id, header);

      for (const itemId of deleteItemIds) {
        await deleteReimbursementItemApi(reimbursement.id, itemId);
      }

      for (const { itemId, attachmentId } of deleteAttachments) {
        await deleteAnexoEspecificoReimbursementApi(reimbursement.id, itemId, attachmentId);
      }

      for (const { itemId, file } of addAttachments) {
        await adicionarAnexoReimbursementApi(reimbursement.id, itemId, file);
      }

      for (const item of items) {
        if (item.itemId) {
          await updateReimbursementItemApi(reimbursement.id, item.itemId, {
            expense_date: item.expense_date,
            amount: item.amount,
            cost_center_id: item.cost_center_id,
            description: item.description,
            expense_category_id: item.expense_category_id || undefined,
            latitude: item.latitude ?? null,
            longitude: item.longitude ?? null,
            address: item.address ?? null,
            description_supplier: item.description_supplier || undefined,
            supplier_tax_id: item.supplier_tax_id || undefined,
            supplier_id: item.supplier_id || undefined,
          });
        } else {
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
          const files = (item.anexo as File[] | undefined) ?? [];
          files.forEach((f) => fd.append("attachments[]", f));
          await createReimbursementItemApi(reimbursement.id, fd);
        }
      }

      toast.success("Reimbursement updated successfully!");
      setShowForm(false);
      const updated = await getReimbursementApi(reimbursement.id);
      setReimbursement(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error saving.");
    }
  }

  async function openAttachment(reimbursementId: number, itemId: number, attachmentId: number) {
    try {
      const blob = await getAnexoEspecificoReimbursementApi(reimbursementId, itemId, attachmentId);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      toast.error("Could not open the attachment.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading />
      </div>
    );
  }

  if (error || !reimbursement) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-small font-semibold text-app-text-muted hover:text-app-text mb-4"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center">
          <p className="text-small text-red-700">{error ?? "Reimbursement not found."}</p>
        </div>
      </div>
    );
  }

  const items = reimbursement.items ?? [];
  const totalAmount = items.reduce((acc, d) => acc + parseFloat(d.amount), 0);
  const canEdit = reimbursement.status === 1;
  const hasBank = Boolean(reimbursement.bank || reimbursement.pix_key || reimbursement.branch || reimbursement.account_number);

  return (
    <>
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6 pb-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/my-reimbursements")}
            className="flex items-center gap-1.5 text-small font-semibold text-app-text-muted hover:text-app-text -ml-0.5"
          >
            <ArrowLeft size={16} />
            My Reimbursements
          </button>
          {(() => {
            const cfg = STATUS_MINI_CONFIG[reimbursement.status] ?? STATUS_MINI_CONFIG[1];
            const StatusIcon = cfg.icon;
            return (
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-semibold ${cfg.bg} ${cfg.border} ${cfg.fg}`}>
                <StatusIcon size={13} weight="bold" />
                {REIMBURSEMENT_STATUS_LABEL[reimbursement.status]}
              </span>
            );
          })()}
        </div>

        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-app-text leading-snug break-words">
                {reimbursement.title}
              </h1>
              <p className="text-[13px] text-app-text-subtle mt-2 leading-snug">
                #{reimbursement.id}
                <span className="mx-1.5 opacity-60">•</span>
                {fmtDate(reimbursement.created_at)}
                <span className="mx-1.5 opacity-60">•</span>
                {fmtShortDate(reimbursement.period_start_date)} to {fmtShortDate(reimbursement.period_end_date)}
              </p>
            </div>

            {canEdit && (
              <div ref={menuRef} className="relative shrink-0">
                <button
                  onClick={() => setShowMenu((v) => !v)}
                  className="h-10 w-10 flex items-center justify-center rounded-xl text-app-text-muted hover:text-app-text hover:bg-app-hover transition-colors"
                >
                  <DotsThreeVertical size={22} weight="bold" />
                </button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-1 bg-app-surface border border-app-border rounded-xl shadow-lg p-1 z-20 min-w-[160px]"
                    >
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowForm(true);
                        }}
                        className="flex items-center gap-2 px-3 py-2.5 text-base text-app-text hover:bg-app-hover rounded-lg w-full text-left transition-colors"
                      >
                        <PencilSimple size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowConfirmDelete(true);
                        }}
                        className="flex items-center gap-2 px-3 py-2.5 text-base text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg w-full text-left transition-colors"
                      >
                        <Trash size={16} />
                        Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

        </Card>

        <Card className="p-6 sm:py-10 text-center">
          <p className="text-[13px] font-semibold uppercase tracking-widest text-app-text-muted">
            Total Amount to Receive
          </p>
          <p className="text-4xl sm:text-5xl font-bold text-app-text mt-3 break-words">
            {fmtAmount(totalAmount)}
          </p>
          <p className="text-base text-app-text-subtle mt-3">
            {items.length} {items.length === 1 ? "item recorded" : "items recorded"}
          </p>
        </Card>

        {(hasBank || (reimbursement.status === 5 && reimbursement.scheduled_payment_date) ||
          (reimbursement.status === 7 && reimbursement.rejection_reason)) && (
          <Card className="p-4 sm:p-5 space-y-4">
            {hasBank && (
              <div className="space-y-3">
                <p className="text-[13px] font-semibold uppercase tracking-widest text-app-text-muted">
                  Bank details
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {reimbursement.bank && (
                    <div>
                      <p className="text-[13px] text-app-text-subtle">Bank</p>
                      <p className="text-base text-app-text mt-0.5">{reimbursement.bank}</p>
                    </div>
                  )}
                  {reimbursement.branch && (
                    <div>
                      <p className="text-[13px] text-app-text-subtle">Branch</p>
                      <p className="text-base text-app-text mt-0.5">{reimbursement.branch}</p>
                    </div>
                  )}
                  {reimbursement.account_number && (
                    <div>
                      <p className="text-[13px] text-app-text-subtle">Account</p>
                      <p className="text-base text-app-text mt-0.5">{reimbursement.account_number}</p>
                    </div>
                  )}
                  {reimbursement.pix_key && (
                    <div className="col-span-2">
                      <p className="text-[13px] text-app-text-subtle">Pix Key</p>
                      <p className="text-base text-app-text mt-0.5 truncate">{reimbursement.pix_key}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {reimbursement.status === 5 && reimbursement.scheduled_payment_date && (
              <div className="flex items-center gap-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 px-4 py-3">
                <CalendarCheck size={20} className="text-purple-600 dark:text-purple-400 shrink-0" />
                <div>
                  <p className="text-base font-semibold text-purple-700 dark:text-purple-300 leading-tight">
                    Scheduled Payment
                  </p>
                  <p className="text-base text-purple-600 dark:text-purple-400 leading-tight mt-0.5">
                    {fmtDate(reimbursement.scheduled_payment_date)}
                  </p>
                </div>
              </div>
            )}

            {reimbursement.status === 7 && reimbursement.rejection_reason && (
              <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-4 py-3">
                <XCircle size={20} className="text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-base font-semibold text-red-700 dark:text-red-300 leading-tight">
                    Rejection Reason
                  </p>
                  <p className="text-base text-red-600 dark:text-red-400 leading-snug mt-1">
                    {reimbursement.rejection_reason}
                  </p>
                </div>
              </div>
            )}
          </Card>
        )}

        <div className="space-y-3">
          <p className="text-[13px] font-semibold text-app-text-muted uppercase tracking-widest px-1">
            Items ({items.length})
          </p>

          {items.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-base text-app-text-subtle">No items recorded.</p>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {items.map((item) => {
                const CategoryIcon = getCategoryIcon(item.expense_category?.description);
                const colors = getCategoryColors(item.expense_category?.description);
                return (
                  <div key={item.id} className="relative">
                    {canEdit && (
                      <button
                        onClick={() => setItemToDelete(item.id)}
                        className="absolute -top-3 -right-3 z-10 h-7 w-7 flex items-center justify-center rounded-full bg-app-surface border border-app-border text-app-text-muted hover:text-red-600 hover:border-red-300 dark:hover:border-red-800 transition-colors shadow-sm"
                        type="button"
                      >
                        <X size={13} weight="bold" />
                      </button>
                    )}
                  <Card className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${colors.bg}`}>
                        <CategoryIcon size={20} className={colors.fg} weight="bold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-base font-semibold text-app-text leading-snug">
                            {item.description}
                          </p>
                          <span className="text-[13px] text-app-text-subtle shrink-0 mt-0.5">
                            {fmtDate(item.expense_date)}
                          </span>
                        </div>
                        {item.cost_center && (
                          <p className="text-[13px] text-app-text-subtle mt-1.5">
                            {item.cost_center.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-app-border-subtle">
                      <p className="text-lg font-bold text-app-text">
                        {fmtAmount(parseFloat(item.amount))}
                      </p>
                    </div>

                    {(item.attachments ?? []).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-app-border-subtle flex gap-2 overflow-x-auto scrollbar-none">
                        {(item.attachments ?? []).map((attachment) => (
                          <AttachmentThumbnailItem
                            key={attachment.id}
                            reimbursementId={reimbursement.id}
                            itemId={item.id}
                            attachmentId={attachment.id}
                            path={attachment.path}
                            onOpen={() => openAttachment(reimbursement.id, item.id, attachment.id)}
                          />
                        ))}
                      </div>
                    )}

                    {canEdit && (
                      <button
                        onClick={() => setShowForm(true)}
                        className="mt-3 pt-3 border-t border-app-border-subtle w-full flex items-center justify-center gap-1.5 text-[13px] font-semibold text-app-text-muted hover:text-app-text active:bg-app-hover active:text-app-text rounded-b-2xl transition-colors"
                        type="button"
                      >
                        <PencilSimple size={13} />
                        Edit
                      </button>
                    )}
                  </Card>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {canEdit && (
          <Button variant="dark" fullWidth onClick={() => setShowForm(true)}>
            <Plus size={18} weight="bold" />
            Add Item
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <FormReimbursement
            initialReimbursement={reimbursement}
            onSave={handleSaveEdit}
            onClose={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirmDelete && (
          <ConfirmDialog
            title="Delete reimbursement?"
            onConfirm={handleDelete}
            onCancel={() => setShowConfirmDelete(false)}
            loading={deleting}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {itemToDelete !== null && (
          <ConfirmDialog
            title="Delete item?"
            onConfirm={handleDeleteItem}
            onCancel={() => setItemToDelete(null)}
            loading={deletingItem}
          />
        )}
      </AnimatePresence>
    </>
  );
}
