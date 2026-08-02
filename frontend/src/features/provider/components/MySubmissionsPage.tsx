"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import MobileScreen from "@/ui/MobileScreen";
import TransactionCard from "@/features/provider/components/TransactionCard";
import Button from "@/ui/Button";
import Loading from "@/ui/Loading";
import FabActionSheet from "@/ui/FabActionSheet";
import { useSubmissions } from "@/features/provider/provider.hooks";
import type { SubmissionFilter } from "@/features/provider/provider.types";

const CHIPS: { label: string; value: SubmissionFilter }[] = [
  { label: "All", value: "all" },
  { label: "Report", value: "expense_report" },
  { label: "Reimbursement", value: "reimbursement" },
];

const EMPTY: Record<SubmissionFilter, string> = {
  all: "No submissions yet.",
  expense_report: "No expense report submissions yet.",
  reimbursement: "No reimbursements yet.",
};

const PER_PAGE = 15;

function parseFilter(value: string | null): SubmissionFilter {
  if (value === "expense_report" || value === "reimbursement") return value;
  return "all";
}

export default function MySubmissionsPage() {
  return (
    <Suspense fallback={<MobileScreen><Loading size="sm" /></MobileScreen>}>
      <MySubmissionsContent />
    </Suspense>
  );
}

function MySubmissionsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const filter = parseFilter(params.get("type"));

  const { items, loading, loadingMore, hasMore, loadMore } = useSubmissions(filter, PER_PAGE);
  const [sheetOpen, setSheetOpen] = useState(false);

  function changeFilter(next: SubmissionFilter): void {
    const qs = next === "all" ? "" : `?type=${next}`;
    router.replace(`/my-submissions${qs}`);
  }

  return (
    <MobileScreen>
      <div className="flex items-center justify-between mb-4 gap-3">
        <h1
          className="text-app-text font-semibold tracking-tight"
          style={{ fontSize: "28px", lineHeight: "1.1" }}
        >
          My submissions
        </h1>
        <motion.button
          onClick={() => setSheetOpen(true)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          className="hidden md:inline-flex items-center gap-2 rounded-xl bg-app-text text-app-surface px-4 py-2.5 text-caption font-semibold hover:opacity-90"
        >
          <motion.span
            initial={false}
            animate={sheetOpen ? { rotate: 45 } : { rotate: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            className="inline-flex"
          >
            <Plus size={16} weight="bold" />
          </motion.span>
          New submission
        </motion.button>
      </div>

      <div className="flex gap-2 mb-4">
        {CHIPS.map((c) => {
          const active = filter === c.value;
          return (
            <button
              key={c.value}
              onClick={() => changeFilter(c.value)}
              className={`px-3.5 py-2 rounded-full text-caption font-medium min-h-11 ${
                active
                  ? "bg-app-text text-app-surface"
                  : "bg-app-surface border border-app-border text-app-text-muted"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <Loading size="sm" />
      ) : items.length === 0 ? (
        <p className="text-body-sm text-app-text-muted py-10 text-center">
          {EMPTY[filter]}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((l) => (
            <TransactionCard key={`${l.type}-${l.id}`} submission={l} />
          ))}
          {hasMore && (
            <Button
              variant="outlined"
              fullWidth
              disabled={loadingMore}
              onClick={() => loadMore()}
            >
              {loadingMore ? "Loading…" : "Load more"}
            </Button>
          )}
        </div>
      )}
      <FabActionSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </MobileScreen>
  );
}
