"use client";

import { motion } from "framer-motion";

export default function Tab({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "relative flex items-center justify-center gap-2 px-4 py-3 cursor-pointer transition-colors",
        "max-[480px]:flex-1 max-[480px]:flex-col max-[480px]:gap-1 max-[480px]:px-2 max-[480px]:py-2.5",
        active ? "text-app-text" : "text-app-text-muted hover:text-app-text",
      ].join(" ")}
    >
      <Icon size={16} weight={active ? "fill" : "regular"} className={active ? "text-brand" : ""} />
      <span className="flex items-center gap-2">
        <span className="text-caption">{label}</span>
        <span
          className={[
            "rounded-full px-2 py-0.5 text-small ring-1",
            active
              ? "bg-brand/10 text-brand ring-brand/20"
              : "bg-[#eef0f3] text-[#5b616e] ring-[#d8dce4]",
          ].join(" ")}
        >
          {count}
        </span>
      </span>
      {active && (
        <motion.div
          layoutId="export-tab-indicator"
          className="absolute left-0 right-0 -bottom-px h-0.5 bg-brand"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
    </button>
  );
}
