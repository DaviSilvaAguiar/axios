"use client";

import { motion } from "framer-motion";
import { PaperPlaneTilt, Plug } from "@phosphor-icons/react";
import Button from "@/ui/Button";
import { formatarMoeda } from "@/lib/formatters";

interface Props {
  quantity: number;
  totalAmount: number;
  integrationName: string | null;
  integrationConfigured: boolean;
  loading: boolean;
  onClear: () => void;
  onSend: () => void;
}

export default function IntegrationSendActionBar({
  quantity,
  totalAmount,
  integrationName,
  integrationConfigured,
  loading,
  onClear,
  onSend,
}: Props) {
  const canSend = integrationConfigured && !loading;
  const hint = integrationName
    ? integrationConfigured
      ? `Ready to send via ${integrationName}`
      : `Configure the ${integrationName} token before sending`
    : "Select an integration";

  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 24, opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-[min(92vw,760px)]"
    >
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-app-border bg-app-surface shadow-2xl px-5 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/[0.08] shrink-0">
            <Plug size={16} weight="fill" className="text-brand" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-caption text-app-text">
              {quantity} {quantity === 1 ? "document selected" : "documents selected"}
            </span>
            <span className="text-small text-app-text-muted font-normal truncate">
              Total {formatarMoeda(totalAmount)} • {hint}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="light" size="sm" onClick={onClear} disabled={loading}>
            Clear
          </Button>
          <Button variant="brand" size="sm" disabled={!canSend} onClick={onSend}>
            <PaperPlaneTilt size={14} weight="bold" />
            {loading ? "Sending…" : "Send"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
