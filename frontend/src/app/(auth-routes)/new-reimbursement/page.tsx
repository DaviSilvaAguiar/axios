"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { toast } from "@/lib/toast";
import Button from "@/ui/Button";
import FormReimbursement from "@/features/reimbursement/components/FormReimbursement";
import {
  createReimbursementApi,
  createReimbursementItemApi,
} from "@/features/reimbursement/reimbursement.api";
import type { StoreReimbursementWithDespesasFormData } from "@/features/reimbursement/reimbursement.types";
import type { AttachmentToAdd, AttachmentToDelete } from "@/features/reimbursement/components/FormReimbursement";

export default function NewReimbursementPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  async function handleSave(
    data: StoreReimbursementWithDespesasFormData,
    _deleteItemIds: number[],
    _deleteAttachments: AttachmentToDelete[],
    _addAttachments: AttachmentToAdd[]
  ) {
    try {
      const { items, ...header } = data;
      const { reimbursement } = await createReimbursementApi(header);

      for (const item of items) {
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

      setSuccess(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error recording expenses.");
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 py-16 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex h-28 w-28 items-center justify-center rounded-full bg-green-100 mb-8"
        >
          <CheckCircle size={64} weight="fill" className="text-green-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="space-y-3 max-w-xs"
        >
          <p className="text-section-heading text-app-text">All set!</p>
          <p className="text-body-sm text-app-text-muted">
            Your receipts have been sent to finance.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.28 }}
          className="flex flex-col gap-3 w-full max-w-xs mt-10"
        >
          <Button variant="dark" fullWidth onClick={() => setSuccess(false)}>
            Record more expenses
          </Button>
          <Button variant="light" fullWidth onClick={() => router.push("/my-reimbursements")}>
            View my reimbursements
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-app-bg">
      <div className="sticky top-0 z-10 bg-app-bg/95 backdrop-blur-sm border-b border-app-border-subtle">
        <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
          <button
            onClick={() => router.push("/my-reimbursements")}
            className="flex items-center justify-center rounded-xl p-1.5 text-app-text-muted hover:bg-app-hover hover:text-app-text transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-feature-title text-app-text">Record Expenses</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <FormReimbursement
          pageMode
          onSave={handleSave}
          onClose={() => router.push("/my-reimbursements")}
        />
      </div>
    </div>
  );
}
