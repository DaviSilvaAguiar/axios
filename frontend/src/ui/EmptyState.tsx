"use client";

import { type ElementType } from "react";
import { motion } from "framer-motion";
import Button from "@/ui/Button";

interface Props {
  icon: ElementType;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  size?: "sm" | "md";
  iconBackground?: boolean;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "md",
  iconBackground = false,
}: Props) {
  if (size === "sm") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col items-center justify-center gap-2.5 py-6"
      >
        {iconBackground ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/[0.07]">
            <Icon size={20} weight="light" className="text-brand" />
          </div>
        ) : (
          <Icon size={20} weight="light" className="text-app-text-subtle" />
        )}
        <p className="text-small text-app-text-subtle">{title}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.75, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.05 }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/[0.08]"
      >
        <Icon size={32} weight="light" className="text-brand" />
      </motion.div>

      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25, delay: 0.12 }}
        className="flex flex-col gap-1.5"
      >
        <p className="text-feature-title text-app-text">{title}</p>
        {description && (
          <p className="text-body-sm text-app-text-muted max-w-xs">{description}</p>
        )}
      </motion.div>

      {action && (
        <motion.div
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.22, delay: 0.2 }}
        >
          <Button variant="outlined" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
