"use client";

import Link from "next/link";
import { CalendarDots } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import Card from "@/ui/Card";
import StatusTag from "./StatusTag";
import { formatarData, formatarMoeda } from "@/lib/formatters";
import { type ExpenseReport } from "../expense-report.types";

const STATUS_BORDER: Record<number, string> = {
  1: "border-l-blue-400",
  2: "border-l-orange-400",
  3: "border-l-amber-400",
  4: "border-l-green-400",
  5: "border-l-purple-400",
  6: "border-l-app-border",
  7: "border-l-red-400",
};

function calcTotal(expenseReport: ExpenseReport) {
  return (expenseReport.items ?? []).reduce((acc, d) => acc + Number(d.amount ?? 0), 0);
}

interface Props {
  expenseReport: ExpenseReport;
}

export default function ExpenseReportListCard({ expenseReport }: Props) {
  const total = calcTotal(expenseReport);
  const count = (expenseReport.items ?? []).length;
  const border = STATUS_BORDER[expenseReport.status] ?? "border-l-app-border";

  return (
    <Link href={`/my-expense-reports/${expenseReport.id}`}>
      <motion.div whileTap={{ scale: 0.98 }} transition={{ duration: 0.12 }}>
        <Card className={`p-0 border-l-4 ${border} overflow-hidden hover:shadow-md transition-all cursor-pointer`}>
          <div className="p-4 space-y-2.5">
            <p className="text-body font-semibold text-app-text leading-snug line-clamp-2">
              {expenseReport.description}
            </p>
            <div className="flex items-center justify-between gap-2">
              <StatusTag status={expenseReport.status} />
              <span className="text-caption text-app-text-subtle shrink-0">
                {formatarData(expenseReport.created_at)}
              </span>
            </div>
            {expenseReport.period_start_date && expenseReport.period_end_date && (
              <div className="flex items-center gap-1.5 text-small text-app-text-muted">
                <CalendarDots size={13} weight="bold" className="shrink-0" />
                <span>
                  {formatarData(expenseReport.period_start_date)} → {formatarData(expenseReport.period_end_date)}
                </span>
              </div>
            )}
          </div>
          <div className="border-t border-app-border-subtle px-4 py-2.5 flex items-center justify-between bg-app-surface-raised/40">
            <p className="text-body font-bold text-app-text">{formatarMoeda(total)}</p>
            <span className="text-caption text-app-text-subtle">
              {count} {count === 1 ? "item" : "items"}
            </span>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}
