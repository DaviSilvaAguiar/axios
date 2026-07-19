"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/ui/Button";

const schema = z.object({
  rejection_reason: z.string().min(1, "Enter the rejection reason"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onConfirm: (reason: string) => Promise<void> | void;
  onCancel: () => void;
}

export default function RejectionModal({ onConfirm, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    await onConfirm(data.rejection_reason);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 8 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="w-full max-w-sm rounded-2xl bg-app-surface p-6 shadow-xl"
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-feature-title text-app-text">Reject Reimbursement</h2>
              <p className="mt-1 text-body-sm text-app-text-muted">
                Describe the rejection reason for the employee.
              </p>
            </div>
            <button
              onClick={onCancel}
              className="ml-4 rounded-full p-1 text-app-text-muted hover:bg-app-hover"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-caption text-app-text-muted block mb-1.5">
                Reason
              </label>
              <textarea
                {...register("rejection_reason")}
                rows={4}
                placeholder="e.g. Illegible invoice, mismatched amount…"
                className="w-full resize-none rounded-2xl border border-app-border bg-app-surface-raised px-4 py-3 text-body-sm text-app-text placeholder:text-app-text-subtle focus:border-brand focus:outline-none"
              />
              {errors.rejection_reason && (
                <p className="mt-1 text-small text-red-600">
                  {errors.rejection_reason.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="light" fullWidth onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="outlined" fullWidth disabled={isSubmitting}>
                {isSubmitting ? "Rejecting…" : "Reject"}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
