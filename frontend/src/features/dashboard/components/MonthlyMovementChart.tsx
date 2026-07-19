"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "@/ui/Card";
import { formatarMoeda } from "@/lib/formatters";
import type { MonthlyMovementItem } from "../dashboard.types";

interface Props {
  movements: MonthlyMovementItem[];
  activeYear: number;
  activeMonth: number;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface TooltipItemPayload {
  year: number;
  month: number;
  debits: number;
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { payload: TooltipItemPayload }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div
      className="rounded-xl border border-app-border bg-app-surface px-3 py-2 shadow-md"
      style={{ fontSize: 12 }}
    >
      <p className="text-app-text-muted mb-1">{`${label}/${p.year}`}</p>
      <p className="font-semibold" style={{ color: "#dc2626" }}>
        {`Debits: ${formatarMoeda(p.debits)}`}
      </p>
    </div>
  );
}

export default function MonthlyMovementChart({ movements, activeYear, activeMonth }: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const chartData = (isMobile ? movements.slice(-6) : movements).map((m) => ({
    label:   MONTH_NAMES[m.month - 1],
    year:    m.year,
    month:   m.month,
    debits:  Math.abs(parseFloat(m.debits)),
    credits: parseFloat(m.credits),
    balance: parseFloat(m.net_balance),
  }));

  const noData = chartData.every((d) => d.credits === 0 && d.debits === 0);

  return (
    <Card className="p-5">
      <p className="text-caption text-app-text-muted uppercase tracking-wide mb-4">
        Monthly movement
      </p>

      {noData ? (
        <div className="flex h-[200px] items-center justify-center text-small text-app-text-subtle">
          No movement in the period
        </div>
      ) : (
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "var(--app-text-subtle)" }}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "var(--app-surface-raised)" }}
                content={<ChartTooltip />}
              />
              <Bar dataKey="debits" radius={[4, 4, 0, 0]}>
                {chartData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.year === activeYear && d.month === activeMonth ? "#16a34a" : "#0052ff"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
