"use client";

import { PencilSimple, Trash, X } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ExpenseReportActionsSheet({ open, onClose, onEdit, onDelete }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="absolute bottom-0 inset-x-0 bg-app-surface rounded-t-2xl border-t border-app-border p-4 md:max-w-md md:left-1/2 md:right-auto md:-translate-x-1/2 md:bottom-12 md:rounded-2xl md:border"
            style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
          >
            <div className="flex justify-between items-center mb-3">
              <p className="text-feature-title text-app-text">Actions</p>
              <button
                aria-label="Close"
                onClick={onClose}
                className="h-11 w-11 -mr-2 flex items-center justify-center text-app-text-muted hover:text-app-text"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={onEdit}
                className="flex items-center gap-3 p-4 rounded-xl border border-app-border bg-app-surface text-body-sm text-left hover:border-brand/30 transition-colors"
              >
                <PencilSimple size={20} className="text-app-text-muted shrink-0" />
                <span className="font-semibold text-app-text">Edit</span>
              </button>
              <button
                onClick={onDelete}
                className="flex items-center gap-3 p-4 rounded-xl border border-app-border bg-app-surface text-body-sm text-left hover:border-red-500/40 transition-colors"
              >
                <Trash size={20} className="text-red-500 shrink-0" />
                <span className="font-semibold text-red-500">Delete</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
