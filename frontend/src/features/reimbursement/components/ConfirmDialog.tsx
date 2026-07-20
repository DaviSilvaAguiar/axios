"use client";

import { motion } from "framer-motion";
import Button from "@/ui/Button";

interface ConfirmDialogProps {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export default function ConfirmDialog({ title, onConfirm, onCancel, loading }: ConfirmDialogProps) {
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
