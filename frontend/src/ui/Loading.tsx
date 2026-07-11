"use client";

import { motion } from "framer-motion";

interface Props {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  label?: string;
}

const SIZE = {
  sm: { ring: "h-4 w-4", border: "border-2" },
  md: { ring: "h-8 w-8", border: "border-2" },
  lg: { ring: "h-12 w-12", border: "border-[3px]" },
};

export default function Loading({ size = "md", fullScreen, label }: Props) {
  const { ring, border } = SIZE[size];

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        className={`${ring} ${border} rounded-full border-brand border-t-transparent`}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
      />
      {label && (
        <p className="text-small text-app-text-muted">{label}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-app-bg/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  );
}
