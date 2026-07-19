"use client";

import Link from "next/link";
import { Buildings } from "@phosphor-icons/react";
import Card from "@/ui/Card";
import { formatarMoeda } from "@/lib/formatters";
import type { TopCostCenterItem } from "../dashboard.types";

interface Props {
  items: TopCostCenterItem[];
}

export default function TopCostCentersList({ items }: Props) {
  return (
    <Card className="p-5">
      <p className="text-caption text-app-text-muted uppercase tracking-wide mb-4">
        Top cost centers of the month
      </p>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
          <Buildings size={28} weight="thin" className="text-app-text-subtle" />
          <p className="text-small text-app-text-subtle">No spending in the period</p>
        </div>
      ) : (
        <ul className="divide-y divide-app-border max-h-[9.5rem] overflow-y-auto">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/cost-centers?id=${item.id}`}
                className="flex items-center justify-between py-3 px-2 rounded-lg cursor-pointer hover:bg-app-surface-raised/30 transition-colors"
              >
                <span className="text-caption text-app-text truncate flex-1 min-w-0">
                  {item.description}
                </span>
                <span className="text-caption font-semibold text-app-text shrink-0 ml-3 tabular-nums">
                  {formatarMoeda(parseFloat(item.amount_spent))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
