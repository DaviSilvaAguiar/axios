"use client";

import { motion } from "framer-motion";
import { type ReimbursementItem, type Reimbursement } from "../../reimbursement.types";
import { formatarData, formatarMoeda } from "@/lib/formatters";

const SPRING = { type: "spring" as const, stiffness: 380, damping: 30 };

interface Props {
  reimbursement: Reimbursement;
  items: ReimbursementItem[];
  selectedItem: ReimbursementItem | null;
  total: number;
  mobilePanel: "list" | "detail";
  onSelectItem: (item: ReimbursementItem) => void;
}

export default function AuditItemsPanel({ reimbursement, items, selectedItem, total, mobilePanel, onSelectItem }: Props) {
  return (
    <div className={`flex flex-col border-b md:border-b-0 md:border-r border-app-border md:w-2/5 ${mobilePanel === "detail" ? "hidden md:flex" : "flex"}`}>
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <p className="p-6 text-center text-body-sm text-app-text-muted">
            No items recorded.
          </p>
        ) : (
          <ul>
            {items.map((d) => (
              <li key={d.id} className="relative">
                {selectedItem?.id === d.id && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute inset-0 border-l-2 border-l-brand bg-app-nav-active"
                    transition={SPRING}
                  />
                )}
                <motion.button
                  onClick={() => onSelectItem(d)}
                  whileHover={{ x: selectedItem?.id === d.id ? 0 : 2 }}
                  transition={{ duration: 0.12 }}
                  className="relative z-10 w-full border-b border-app-border-subtle px-5 py-4 text-left"
                >
                  <p className="line-clamp-1 text-caption font-semibold text-app-text">
                    {d.description}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-small text-app-text-muted">
                      {formatarData(d.expense_date)}
                    </span>
                    <span className="text-caption font-semibold text-app-text">
                      {formatarMoeda(parseFloat(d.amount))}
                    </span>
                  </div>
                  {d.cost_center && (
                    <p className="mt-0.5 truncate text-small text-app-text-subtle">
                      {d.cost_center.description}
                    </p>
                  )}
                </motion.button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <div className="flex shrink-0 items-center justify-between border-t border-app-border bg-app-surface px-5 py-3">
          <span className="text-small text-app-text-muted">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
          <span className="text-caption font-semibold text-app-text">
            {formatarMoeda(total)}
          </span>
        </div>
      )}

      {(reimbursement.bank || reimbursement.branch || reimbursement.account_number || reimbursement.pix_key) && (
        <div className="shrink-0 border-t border-app-border bg-app-surface px-5 py-4 space-y-2">
          <p className="text-small font-semibold text-app-text-muted uppercase tracking-wide">
            Payment Details
          </p>
          <div className="grid grid-cols-2 gap-2">
            {reimbursement.bank && (
              <div>
                <p className="text-small text-app-text-muted">Bank</p>
                <p className="text-caption font-semibold text-app-text">{reimbursement.bank}</p>
              </div>
            )}
            {reimbursement.branch && (
              <div>
                <p className="text-small text-app-text-muted">Branch</p>
                <p className="text-caption font-semibold text-app-text">{reimbursement.branch}</p>
              </div>
            )}
            {reimbursement.account_number && (
              <div>
                <p className="text-small text-app-text-muted">Account</p>
                <p className="text-caption font-semibold text-app-text">{reimbursement.account_number}</p>
              </div>
            )}
            {reimbursement.pix_key && (
              <div className="col-span-2">
                <p className="text-small text-app-text-muted">Pix Key</p>
                <p className="text-caption font-semibold text-app-text">{reimbursement.pix_key}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
