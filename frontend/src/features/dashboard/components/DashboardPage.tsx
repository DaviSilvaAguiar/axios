"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Receipt,
  Wallet,
  ArrowUUpLeft,
  DownloadSimple,
  Users,
  Gear,
  ArrowRight,
  ClockCountdown,
  CurrencyCircleDollar,
  Files,
} from "@phosphor-icons/react";
import { type ElementType } from "react";
import Card from "@/ui/Card";
import Loading from "@/ui/Loading";
import MobileScreen from "@/ui/MobileScreen";
import TransactionCard from "@/ui/TransactionCard";
import { useAuth } from "@/contexts/AuthContext";
import {
  useRecentSubmissions,
  usePendingReimbursementTotal,
  useDraftExpenseReportCount,
} from "@/features/provider/provider.hooks";
import PendingApprovalList from "./PendingApprovalList";

const operationModules = [
  {
    icon: Receipt,
    label: "Expense Reports",
    desc: "Record and audit field expense reports",
    href: "/expense-reports",
    module: "rdc",
  },
  {
    icon: Wallet,
    label: "Fund Management",
    desc: "Control prepaid balances and advances",
    href: "/funds",
    module: "expense-reports",
  },
  {
    icon: ArrowUUpLeft,
    label: "Reimbursement",
    desc: "Request and approve expense reimbursements",
    href: "/reimbursements",
    module: "reimbursement",
  },
  {
    icon: DownloadSimple,
    label: "ERP Export",
    desc: "Generate integration files for Sienge and Protheus",
    href: "/export",
    module: "export",
  },
];

const configModules = [
  {
    icon: Users,
    label: "Users",
    desc: "Manage team roles and access",
    href: "/users",
    module: "users",
  },
  {
    icon: Gear,
    label: "Settings",
    desc: "Adjust system preferences",
    href: "/settings",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

function ModuleCard({
  icon: Icon,
  label,
  desc,
  href,
}: {
  icon: ElementType;
  label: string;
  desc: string;
  href: string;
  module?: string;
}) {
  return (
    <motion.div variants={item}>
      <Link href={href} className="block h-full">
        <Card className="p-4 h-full hover:border-brand/30 transition-colors cursor-pointer group">
          <div className="flex flex-col gap-3 h-full">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/[0.07]">
                <Icon size={20} weight="light" className="text-brand" />
              </div>
              <ArrowRight
                size={14}
                weight="bold"
                className="text-brand opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <div>
              <p className="text-feature-title text-app-text group-hover:text-brand transition-colors leading-tight">
                {label}
              </p>
              <p className="text-small text-app-text-muted mt-1">{desc}</p>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

function fmtCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function ProviderDashboard() {
  const { data: recent = [], isLoading: recentLoading } = useRecentSubmissions();
  const { data: pendingReimbursement = 0, isLoading: pendingLoading } =
    usePendingReimbursementTotal();
  const { data: draftExpenseReports = 0, isLoading: draftLoading } =
    useDraftExpenseReportCount();
  const loading = recentLoading || pendingLoading || draftLoading;

  return (
    <MobileScreen>
      {loading ? (
        <Loading size="sm" />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.06 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <Card className="p-4 flex flex-col gap-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60">
              <Files size={18} weight="light" className="text-blue-700 dark:text-blue-300" />
            </div>
            <p className="text-small text-app-text-muted mt-1">Draft expense reports</p>
            <p className="text-feature-title text-app-text">{draftExpenseReports}</p>
          </Card>

          <Card className="p-4 flex flex-col gap-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
              <CurrencyCircleDollar size={18} weight="light" className="text-amber-600" />
            </div>
            <p className="text-small text-app-text-muted mt-1">Pending reimbursement</p>
            <p className="text-feature-title text-app-text">{fmtCurrency(pendingReimbursement)}</p>
          </Card>
        </motion.div>
      )}

      {!loading && recent.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.18 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-caption font-semibold text-app-text-muted uppercase tracking-widest">
              Recent
            </p>
            <Link href="/my-submissions" className="text-small text-brand hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {recent.map((l) => (
              <TransactionCard key={`${l.type}-${l.id}`} submission={l} />
            ))}
          </div>
        </motion.section>
      )}

      {!loading && recent.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-3 py-10 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/[0.07]">
            <ClockCountdown size={28} weight="light" className="text-brand" />
          </div>
          <p className="text-feature-title text-app-text">No entries yet</p>
          <p className="text-body-sm text-app-text-muted">
            Tap the + below to get started
          </p>
        </motion.div>
      )}
    </MobileScreen>
  );
}

export default function DashboardPage() {
  const { user, hasModule } = useAuth();

  if (user?.role === 3) {
    return <ProviderDashboard />;
  }

  const visibleOperationModules = operationModules.filter((m) => hasModule(m.module));
  const visibleConfigModules = configModules.filter((m) => !m.module || hasModule(m.module));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {visibleOperationModules.length === 0 && visibleConfigModules.length === 0 ? (
        <div className="rounded-2xl border border-app-border bg-app-surface p-8 text-center">
          <p className="text-feature-title text-app-text">No modules enabled</p>
          <p className="text-body-sm text-app-text-muted mt-2">
            Contact the administrator to enable the system modules.
          </p>
        </div>
      ) : (
        <section className="space-y-4">
          {visibleOperationModules.length > 0 && (
            <>
              <p className="text-caption text-app-text-muted uppercase tracking-widest">
                Quick access
              </p>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
              >
                {visibleOperationModules.map((mod) => (
                  <ModuleCard key={mod.href} {...mod} />
                ))}
              </motion.div>
            </>
          )}

          {visibleConfigModules.length > 0 && (
            <>
              {visibleOperationModules.length > 0 && (
                <div className="flex items-center gap-3 pt-2">
                  <div className="h-px flex-1 bg-app-border" />
                  <span className="text-small text-app-text-muted shrink-0">
                    Settings
                  </span>
                  <div className="h-px flex-1 bg-app-border" />
                </div>
              )}

              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 gap-3"
              >
                {visibleConfigModules.map((mod) => (
                  <ModuleCard key={mod.href} {...mod} />
                ))}
              </motion.div>
            </>
          )}
        </section>
      )}

      <section>
        <PendingApprovalList />
      </section>
    </div>
  );
}
