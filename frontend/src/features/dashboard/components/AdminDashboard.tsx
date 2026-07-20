"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowClockwise } from "@phosphor-icons/react";
import Card from "@/ui/Card";
import Button from "@/ui/Button";
import { formatarMoeda } from "@/lib/formatters";
import { useDashboardOverview } from "../dashboard.hooks";
import KpiCard from "./KpiCard";
import KpiCardSkeleton from "./KpiCardSkeleton";
import MonthlyMovementSkeleton from "./MonthlyMovementSkeleton";

const MonthlyMovementChart = dynamic(() => import("./MonthlyMovementChart"), {
  ssr: false,
  loading: () => <MonthlyMovementSkeleton />,
});
import MonthYearFilter from "./MonthYearFilter";
import UpcomingPaymentsList from "./UpcomingPaymentsList";
import TopCostCentersList from "./TopCostCentersList";
import ListSkeleton from "./ListSkeleton";
import PendingApprovalList from "./PendingApprovalList";

export default function AdminDashboard() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const { data, isLoading: loading, isError: error, refetch } = useDashboardOverview(year, month);

  function handleChangePeriod(newYear: number, newMonth: number) {
    setYear(newYear);
    setMonth(newMonth);
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <Card className="p-8 flex flex-col items-center gap-4 text-center">
          <p className="text-feature-title text-app-text">Unable to load the dashboard</p>
          <p className="text-body-sm text-app-text-muted">
            Check your connection and try again.
          </p>
          <Button variant="dark" onClick={() => refetch()}>
            <ArrowClockwise size={16} />
            Try again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-card-title text-app-text">Dashboard</h1>
        <MonthYearFilter year={year} month={month} onChange={handleChangePeriod} />
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {loading || !data ? (
          <>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </>
        ) : (
          <>
            <KpiCard
              label="Active funds"
              value={String(data.kpis.active_funds)}
              href="/funds"
            />
            <KpiCard
              label="Total balance"
              value={formatarMoeda(parseFloat(data.kpis.total_balance))}
              href="/funds"
            />
            <KpiCard
              label="Pending audit"
              value={String(data.kpis.pending_expense_reports)}
              href="/expense-reports"
            />
            <KpiCard
              label="Exported batches"
              value={String(data.kpis.exported_batches_month)}
              href="/export"
            />
          </>
        )}
      </section>

      <section>
        {loading || !data ? (
          <MonthlyMovementSkeleton />
        ) : (
          <MonthlyMovementChart
            movements={data.monthly_movement}
            activeYear={year}
            activeMonth={month}
          />
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {loading || !data ? (
          <>
            <ListSkeleton />
            <ListSkeleton />
          </>
        ) : (
          <>
            <UpcomingPaymentsList items={data.upcoming_payments} />
            <TopCostCentersList items={data.top_cost_centers_month} />
          </>
        )}
      </section>

      <section>
        <PendingApprovalList />
      </section>
    </div>
  );
}
