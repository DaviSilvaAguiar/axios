"use client";

import { type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/ui/Button";

interface Props {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  loadingLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  loadingLabel = "Aguarde…",
  loading = false,
  onConfirm,
  onCancel,
  children,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.45)" }}
          onMouseDown={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative w-full max-w-md rounded-2xl bg-app-surface shadow-2xl overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Faixa vermelha no topo */}
            <div className="h-1 w-full bg-red-500" />

            <div className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <p className="text-feature-title text-app-text">{title}</p>
                {description && (
                  <p className="text-body-sm text-app-text-muted leading-relaxed">{description}</p>
                )}
              </div>

              {children}

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  variant="light"
                  size="sm"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="btn-pill !py-[10px] !px-5 !text-[14px] bg-red-500 border-transparent text-white hover:bg-red-600 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {loading ? loadingLabel : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
