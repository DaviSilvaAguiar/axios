"use client";

import { X, ArrowRight, Package } from "@phosphor-icons/react";
import StatusTag from "../StatusTag";
import { type Reimbursement } from "../../reimbursement.types";
import { formatarData, formatarDataHora } from "@/lib/formatters";

function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase();
}

interface Props {
  reimbursement: Reimbursement;
  onClose: () => void;
}

export default function AuditHeader({ reimbursement, onClose }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-app-border px-6 py-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-app-surface-raised font-ui text-[11px] font-semibold text-app-text-muted">
          {getInitials(reimbursement.user?.name)}
        </div>
        <div className="min-w-0">
          <h2 className="text-feature-title text-app-text truncate">{reimbursement.title}</h2>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <span className="text-small text-app-text-muted">{reimbursement.user?.name ?? "—"}</span>
            <span className="text-[10px] text-app-text-subtle">·</span>
            <span className="text-small text-app-text-muted">
              {formatarData(reimbursement.period_start_date)}
            </span>
            <ArrowRight size={11} className="text-app-text-subtle" />
            <span className="text-small text-app-text-muted">
              {formatarData(reimbursement.period_end_date)}
            </span>
          </div>
          {reimbursement.lote_exportacao && (
            <div className="mt-1 flex items-center gap-1.5">
              <Package size={11} className="text-brand" weight="fill" />
              <span className="text-small text-app-text-muted">
                Exported in batch #{reimbursement.lote_exportacao.id} on{" "}
                {formatarDataHora(reimbursement.lote_exportacao.created_at)}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0">
        <StatusTag status={reimbursement.status} />
        <button
          onClick={onClose}
          className="rounded-full p-2 text-app-text-muted transition-colors hover:bg-app-hover"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
