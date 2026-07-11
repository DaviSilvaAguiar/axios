"use client";

import { type ReactNode, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ConfirmModal from "@/ui/ConfirmModal";

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  isDirty?: boolean;
}

export default function Modal({ open, onClose, children, className = "", isDirty = false }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleClose() {
    if (isDirty) {
      setConfirmOpen(true);
    } else {
      onClose();
    }
  }

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        if (isDirty) {
          setConfirmOpen(true);
        } else {
          onClose();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, isDirty, onClose]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex md:items-center md:justify-center md:p-4"
            style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.45)" }}
            onMouseDown={handleClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              className={`relative w-full h-full overflow-y-auto bg-app-surface md:h-auto md:max-w-2xl md:max-h-[90vh] md:rounded-2xl md:shadow-2xl ${className}`}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={confirmOpen}
        title="Fechar sem salvar?"
        description="Você tem alterações não salvas. Se fechar agora, elas serão perdidas."
        confirmLabel="Descartar"
        onConfirm={() => {
          setConfirmOpen(false);
          onClose();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
