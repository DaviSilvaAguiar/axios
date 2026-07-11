"use client";

import { type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "@phosphor-icons/react";

type Side = "right" | "left";

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  side?: Side;
  width?: string;
  className?: string;
}

export default function OffCanvas({
  open,
  onClose,
  children,
  title,
  side = "right",
  width = "max-w-sm",
  className = "",
}: Props) {
  const fromX = side === "right" ? "100%" : "-100%";
  const alignClass = side === "right" ? "justify-end" : "justify-start";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`fixed inset-0 z-50 flex ${alignClass}`}
          style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.45)" }}
          onMouseDown={onClose}
        >
          <motion.aside
            initial={{ x: fromX }}
            animate={{ x: 0 }}
            exit={{ x: fromX }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className={`relative h-full w-full ${width} bg-app-surface shadow-2xl flex flex-col ${className}`}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-app-border">
              <h2 className="text-feature-title text-app-text">{title ?? ""}</h2>
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="text-app-text-muted hover:text-app-text transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
