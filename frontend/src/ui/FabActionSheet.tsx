"use client";

import { useRouter } from "next/navigation";
import { Receipt, ArrowUUpLeft, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 + i * 0.06, type: "spring" as const, stiffness: 360, damping: 26 },
  }),
};

export default function FabActionSheet({ open, onClose }: Props) {
  const router = useRouter();

  function navigate(href: string): void {
    onClose();
    router.push(href);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="fab-sheet"
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
            <div className="flex justify-between items-center mb-4">
              <p className="text-feature-title text-app-text">New entry</p>
              <button
                aria-label="Close"
                onClick={onClose}
                className="h-11 w-11 -mr-2 flex items-center justify-center text-app-text-muted hover:text-app-text"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <motion.button
                custom={0}
                variants={itemVariants}
                initial="hidden"
                animate="show"
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/my-expense-reports?novo=1")}
                className="flex items-center gap-3 p-4 rounded-xl border border-app-border bg-app-surface min-h-16 text-body-sm text-left hover:border-brand/30 transition-colors"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60 shrink-0">
                  <Receipt size={20} className="text-blue-700 dark:text-blue-300" />
                </span>
                <span className="flex-1">
                  <span className="block font-semibold text-app-text">
                    New expense report entry
                  </span>
                  <span className="block text-small text-app-text-muted">
                    Record an advance expense
                  </span>
                </span>
              </motion.button>
              <motion.button
                custom={1}
                variants={itemVariants}
                initial="hidden"
                animate="show"
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/new-reimbursement")}
                className="flex items-center gap-3 p-4 rounded-xl border border-app-border bg-app-surface min-h-16 text-body-sm text-left hover:border-brand/30 transition-colors"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 shrink-0">
                  <ArrowUUpLeft size={20} className="text-emerald-700 dark:text-emerald-300" />
                </span>
                <span className="flex-1">
                  <span className="block font-semibold text-app-text">
                    New reimbursement request
                  </span>
                  <span className="block text-small text-app-text-muted">
                    Request repayment of a personal expense
                  </span>
                </span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
