"use client";

import { type ReactNode } from "react";
import { Check } from "@phosphor-icons/react";
import { motion } from "framer-motion";

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export default function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled,
  className = "",
}: Props) {
  return (
    <label
      className={[
        "inline-flex items-start gap-2.5 select-none",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className,
      ].join(" ")}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          "relative flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-all",
          checked
            ? "border-brand bg-brand shadow-[0_0_0_3px_rgba(0,82,255,0.12)]"
            : "border-app-border bg-app-surface hover:border-brand/50",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
      >
        <motion.span
          initial={false}
          animate={{
            scale: checked ? 1 : 0.4,
            opacity: checked ? 1 : 0,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="flex"
        >
          <Check size={12} weight="bold" className="text-white" />
        </motion.span>
      </button>

      {(label || description) && (
        <div className="flex flex-col gap-0.5 leading-tight">
          {label && (
            <span className="text-caption font-semibold text-app-text">{label}</span>
          )}
          {description && (
            <span className="text-small text-app-text-muted">{description}</span>
          )}
        </div>
      )}
    </label>
  );
}
