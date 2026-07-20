"use client";

import Link from "next/link";
import { CheckCircle, ArrowRight } from "@phosphor-icons/react";
import Card from "@/ui/Card";
import TypeChip from "@/ui/TypeChip";
import { formatarMoeda } from "@/lib/formatters";
import { usePendingApproval } from "../dashboard.hooks";
import ListSkeleton from "./ListSkeleton";

export default function PendingApprovalList() {
  const { data: items, isLoading, isError: error } = usePendingApproval();

  if (isLoading && !error) {
    return <ListSkeleton />;
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-caption text-app-text-muted uppercase tracking-wide">
          Pending approval
        </p>
        {items && items.length > 0 && (
          <span className="text-small text-app-text-subtle tabular-nums">
            {items.length}
          </span>
        )}
      </div>

      {error ? (
        <p className="text-small text-app-text-subtle py-6 text-center">
          Unable to load.
        </p>
      ) : items && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
          <CheckCircle size={28} weight="fill" className="text-green-600 dark:text-green-400" />
          <p className="text-small text-app-text">All caught up</p>
          <p className="text-small text-app-text-subtle">
            No entries awaiting your review
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-app-border max-h-[18rem] overflow-y-auto">
          {items?.map((item) => (
            <li key={`${item.type}-${item.id}`}>
              <Link
                href={item.type === "expense_report" ? `/expense-reports?id=${item.id}` : `/reimbursements?id=${item.id}`}
                className="flex items-center gap-3 py-3 px-2 rounded-lg cursor-pointer hover:bg-app-surface-raised/30 transition-colors"
              >
                <TypeChip type={item.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-caption text-app-text truncate">{item.description}</p>
                  {item.requester && (
                    <p className="text-small text-app-text-subtle truncate">
                      {item.requester}
                    </p>
                  )}
                </div>
                <span className="text-caption font-semibold text-app-text shrink-0 tabular-nums">
                  {formatarMoeda(parseFloat(item.amount))}
                </span>
                <ArrowRight size={14} className="shrink-0 text-app-text-subtle" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
