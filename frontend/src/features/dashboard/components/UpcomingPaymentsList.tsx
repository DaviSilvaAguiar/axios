"use client";

import Link from "next/link";
import { CalendarCheck } from "@phosphor-icons/react";
import Card from "@/ui/Card";
import { formatarData, formatarMoeda } from "@/lib/formatters";
import type { UpcomingPaymentItem } from "../dashboard.types";

interface Props {
  items: UpcomingPaymentItem[];
}

export default function UpcomingPaymentsList({ items }: Props) {
  return (
    <Card className="p-5">
      <p className="text-caption text-app-text-muted uppercase tracking-wide mb-4">
        Upcoming scheduled payments
      </p>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
          <CalendarCheck size={28} weight="thin" className="text-app-text-subtle" />
          <p className="text-small text-app-text-subtle">No scheduled payments</p>
        </div>
      ) : (
        <ul className="divide-y divide-app-border max-h-[13.5rem] overflow-y-auto">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/reimbursements?id=${item.id}`}
                className="flex items-center gap-3 py-3 px-2 rounded-lg cursor-pointer hover:bg-app-surface-raised/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-caption text-app-text truncate">{item.description}</p>
                  {item.scheduled_payment_date && (
                    <p className="text-small text-purple-700 dark:text-purple-300 mt-0.5">
                      {formatarData(item.scheduled_payment_date)}
                    </p>
                  )}
                </div>
                <span className="text-caption font-semibold text-app-text shrink-0 tabular-nums">
                  {formatarMoeda(parseFloat(item.amount))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
