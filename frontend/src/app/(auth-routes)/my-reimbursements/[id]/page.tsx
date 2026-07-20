"use client";

import { use } from "react";
import {
  ArrowLeft,
  PencilSimple,
  Trash,
  X,
  CalendarCheck,
  XCircle,
  DotsThreeVertical,
  Plus,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/ui/Card";
import Loading from "@/ui/Loading";
import Button from "@/ui/Button";
import FormReimbursement from "@/features/reimbursement/components/FormReimbursement";
import AttachmentThumbnailItem from "@/features/reimbursement/components/AttachmentThumbnailItem";
import ConfirmDialog from "@/features/reimbursement/components/ConfirmDialog";
import { useReimbursementDetailPage } from "@/features/reimbursement/hooks/useReimbursementDetailPage";
import {
  getCategoryIcon,
  getCategoryColors,
  STATUS_MINI_CONFIG,
} from "@/features/reimbursement/reimbursement.ui";
import { REIMBURSEMENT_STATUS_LABEL } from "@/features/reimbursement/reimbursement.types";
import { formatarData, formatarMoeda, formatarDataCurta } from "@/lib/formatters";

export default function ReimbursementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const {
    router,
    reimbursement,
    loading,
    isError,
    showForm,
    setShowForm,
    showConfirmDelete,
    setShowConfirmDelete,
    deleting,
    showMenu,
    setShowMenu,
    itemToDelete,
    setItemToDelete,
    deletingItem,
    menuRef,
    handleDelete,
    handleDeleteItem,
    handleSaveEdit,
    openAttachment,
  } = useReimbursementDetailPage(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading />
      </div>
    );
  }

  if (isError || !reimbursement) {
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
          <p className="text-small text-red-700">{isError ? "Could not load the reimbursement." : "Reimbursement not found."}</p>
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
                {formatarData(reimbursement.created_at)}
                <span className="mx-1.5 opacity-60">•</span>
                {formatarDataCurta(reimbursement.period_start_date)} to {formatarDataCurta(reimbursement.period_end_date)}
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
            {formatarMoeda(totalAmount)}
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
                    {formatarData(reimbursement.scheduled_payment_date)}
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
                            {formatarData(item.expense_date)}
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
                        {formatarMoeda(parseFloat(item.amount))}
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
