"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClockCounterClockwise,
  HandCoins,
  MagnifyingGlass,
  PaperPlaneTilt,
  Receipt,
  Sparkle,
} from "@phosphor-icons/react";
import Card from "@/ui/Card";
import Input from "@/ui/Input";
import Button from "@/ui/Button";
import Modal from "@/ui/Modal";
import EmptyState from "@/ui/EmptyState";
import { toast } from "@/lib/toast";
import {
  usePendingStats,
  usePendingExpenseReports,
  usePendingReimbursements,
  useExportHistory,
} from "@/features/export/export.hooks";
import { queryKeys } from "@/lib/queryKeys";
import type { BatchType } from "@/features/export/export.types";
import PendingTable from "@/features/export/components/PendingTable";
import HistoryTable from "@/features/export/components/HistoryTable";
import IntegrationSelector from "@/features/integration/components/IntegrationSelector";
import IntegrationKeyModal from "@/features/integration/components/IntegrationKeyModal";
import IntegrationSendActionBar from "@/features/integration/components/IntegrationSendActionBar";
import { sendLoteIntegrationApi } from "@/features/integration/integration.api";
import { useIntegrations } from "@/features/integration/integration.hooks";
import type { Integration } from "@/features/integration/integration.types";
import { downloadPdfReimbursementApi } from "@/features/reimbursement/reimbursement.api";
import { downloadPdfExpenseReportApi } from "@/features/expense-report/expense-report.api";
import type { PendingDocument } from "@/features/export/export.types";
import { listContasBancariasApi } from "@/features/bank-account/bank-account.api";
import type { BankAccount } from "@/features/bank-account/bank-account.types";

const fmtCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/[0.08]">
          <Icon size={18} weight="duotone" className="text-brand" />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-caption text-app-text-muted">{label}</span>
          <span className="text-feature-title text-app-text leading-tight truncate">{value}</span>
          {hint && <span className="text-small text-app-text-subtle font-normal">{hint}</span>}
        </div>
      </div>
    </Card>
  );
}

function Tab({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "relative flex items-center justify-center gap-2 px-4 py-3 cursor-pointer transition-colors",
        "max-[480px]:flex-1 max-[480px]:flex-col max-[480px]:gap-1 max-[480px]:px-2 max-[480px]:py-2.5",
        active ? "text-app-text" : "text-app-text-muted hover:text-app-text",
      ].join(" ")}
    >
      <Icon size={16} weight={active ? "fill" : "regular"} className={active ? "text-brand" : ""} />
      <span className="flex items-center gap-2">
        <span className="text-caption">{label}</span>
        <span
          className={[
            "rounded-full px-2 py-0.5 text-small ring-1",
            active
              ? "bg-brand/10 text-brand ring-brand/20"
              : "bg-[#eef0f3] text-[#5b616e] ring-[#d8dce4]",
          ].join(" ")}
        >
          {count}
        </span>
      </span>
      {active && (
        <motion.div
          layoutId="export-tab-indicator"
          className="absolute left-0 right-0 -bottom-px h-0.5 bg-brand"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
    </button>
  );
}

export default function ExportPage() {
  const [tab, setTab] = useState<BatchType>("EXPENSE_REPORT");
  const [search, setSearch] = useState("");
  const [selExpenseReport, setSelExpenseReport] = useState<Set<number>>(new Set());
  const [selReimbursement, setSelReimbursement] = useState<Set<number>>(new Set());

  const queryClient = useQueryClient();

  const { items: pendingExpenseReports, loading: loadingExpenseReports, error: errorExpenseReports, hasMore: hasMoreExpenseReports, loadingMore: loadingMoreExpenseReports, loadMore: loadMoreExpenseReports } = usePendingExpenseReports();
  const { items: pendingReimbursements, loading: loadingReimbursements, error: errorReimbursements, hasMore: hasMoreReimbursements, loadingMore: loadingMoreReimbursements, loadMore: loadMoreReimbursements } = usePendingReimbursements();
  const { items: history, loading: loadingHistory, error: errorHistory, hasMore: hasMoreHistory, loadingMore: loadingMoreHistory, loadMore: loadMoreHistory } = useExportHistory();

  const { data: stats = null, isLoading: loadingBase, isError: statsError } = usePendingStats();
  const { data: integrations = [], isLoading: loadingIntegrations } = useIntegrations();

  const [integrationModal, setIntegrationModal] = useState<Integration | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);

  const reloadBase = () => queryClient.invalidateQueries({ queryKey: queryKeys.export.all });
  const errorBase = statsError ? "Unable to load the base export data." : null;

  const generalError = errorBase || errorExpenseReports || errorReimbursements || errorHistory;

  const documents = tab === "EXPENSE_REPORT" ? pendingExpenseReports : pendingReimbursements;
  const selection = tab === "EXPENSE_REPORT" ? selExpenseReport : selReimbursement;
  const setSelection = tab === "EXPENSE_REPORT" ? setSelExpenseReport : setSelReimbursement;
  const isLoadingTab = tab === "EXPENSE_REPORT" ? loadingExpenseReports : loadingReimbursements;
  const hasMoreTab = tab === "EXPENSE_REPORT" ? hasMoreExpenseReports : hasMoreReimbursements;
  const loadingMoreTab = tab === "EXPENSE_REPORT" ? loadingMoreExpenseReports : loadingMoreReimbursements;
  const loadMoreTab = tab === "EXPENSE_REPORT" ? loadMoreExpenseReports : loadMoreReimbursements;

  const filteredDocuments = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter(
      (d) =>
        d.identifier.toLowerCase().includes(q) ||
        (d.description ?? "").toLowerCase().includes(q) ||
        d.provider.toLowerCase().includes(q) ||
        (d.cost_center ?? "").toLowerCase().includes(q)
    );
  }, [documents, search]);

  const selectedAmount = useMemo(
    () => documents.filter((d) => selection.has(d.id)).reduce((s, d) => s + d.amount, 0),
    [documents, selection]
  );

  function toggleDoc(id: number) {
    const next = new Set(selection);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelection(next);
  }

  function toggleAll() {
    if (selection.size === filteredDocuments.length) {
      setSelection(new Set());
    } else {
      setSelection(new Set(filteredDocuments.map((d) => d.id)));
    }
  }

  function changeTab(next: BatchType) {
    setTab(next);
    setSearch("");
  }

  const activeIntegration = integrations.find((i) => i.configurada) ?? integrations[0] ?? null;

  const availableAccounts = useMemo(
    () => bankAccounts.filter((c) => c.active && c.erp_code && c.erp_code.trim() !== ""),
    [bankAccounts]
  );

  async function openConfirmation() {
    if (!activeIntegration?.configurada || selection.size === 0) return;
    setConfirming(true);
    setLoadingAccounts(true);
    try {
      const res = await listContasBancariasApi(1, 100);
      setBankAccounts(res.data);
      const eligible = res.data.filter((c) => c.active && c.erp_code && c.erp_code.trim() !== "");
      setSelectedAccountId(eligible[0]?.id ?? null);
    } catch {
      toast.error("Unable to load bank accounts.");
    } finally {
      setLoadingAccounts(false);
    }
  }

  async function handleSend() {
    if (!activeIntegration?.configurada || selectedAccountId === null) return;
    setSending(true);
    try {
      const ids = Array.from(selection);
      const { data } = await sendLoteIntegrationApi(tab, activeIntegration.id, selectedAccountId, ids);
      if (data.successes > 0) {
        toast.success(`${data.successes} entr${data.successes === 1 ? "y" : "ies"} sent to ${activeIntegration.name}.`);
      }
      if (data.failures.length > 0) {
        toast.error(`${data.failures.length} failure(s): ${data.failures[0].error}`);
      }
      setSelection(new Set());
      setConfirming(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.export.all });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to send the batch.");
    } finally {
      setSending(false);
    }
  }

  async function handleDownloadPdf(doc: PendingDocument) {
    try {
      const blob = doc.type === "EXPENSE_REPORT"
        ? await downloadPdfExpenseReportApi(doc.id)
        : await downloadPdfReimbursementApi(doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.identifier}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to download the PDF.");
    }
  }

  const lastBatch = history[0];

  return (
    <div className="flex flex-col gap-5 p-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-card-title text-app-text">ERP Export</h1>
        <p className="text-body-sm text-app-text-muted">
          Select the integration and send pending batches directly to the ERP.
        </p>
      </div>

      {generalError && !stats && !loadingBase ? (
        <Card>
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 m-4">
            <p className="text-body-sm text-red-700">{generalError}</p>
            <button
              onClick={reloadBase}
              className="mt-2 text-caption font-semibold text-brand hover:underline cursor-pointer"
            >
              Try again
            </button>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <StatCard
              icon={Receipt}
              label="Pending expense reports"
              value={String(stats?.expense_report.quantity ?? 0)}
              hint={`${fmtCurrency(stats?.expense_report.amount ?? 0)} accumulated`}
            />
            <StatCard
              icon={HandCoins}
              label="Pending reimbursements"
              value={String(stats?.reimbursement.quantity ?? 0)}
              hint={`${fmtCurrency(stats?.reimbursement.amount ?? 0)} accumulated`}
            />
            <StatCard
              icon={ClockCounterClockwise}
              label="Last exported batch"
              value={lastBatch ? fmtDate(lastBatch.created_at) : "—"}
              hint={
                lastBatch
                  ? `${lastBatch.item_count} items • ${lastBatch.template_used}`
                  : "No batch generated"
              }
            />
          </div>

          <Card>
            <div className="px-2 pt-1 border-b border-app-border-subtle relative">
              <div className="flex items-center gap-1">
                <Tab
                  active={tab === "EXPENSE_REPORT"}
                  onClick={() => changeTab("EXPENSE_REPORT")}
                  icon={Receipt}
                  label="Expense Reports"
                  count={stats?.expense_report.quantity ?? 0}
                />
                <Tab
                  active={tab === "REIMBURSEMENT"}
                  onClick={() => changeTab("REIMBURSEMENT")}
                  icon={HandCoins}
                  label="Reimbursements"
                  count={stats?.reimbursement.quantity ?? 0}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 px-5 py-4 border-b border-app-border-subtle">
              <div className="flex-1 max-w-2xl">
                <Input
                  label=""
                  placeholder="Search by identifier, description, provider or cost center…"
                  icon={<MagnifyingGlass size={16} />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="!py-3 !text-[13px] placeholder:!text-[13px]"
                />
              </div>
              <IntegrationSelector
                integrations={integrations}
                onSelect={setIntegrationModal}
                loading={loadingIntegrations}
              />
            </div>

            <div className="px-5 py-4">
              {filteredDocuments.length === 0 && !isLoadingTab ? (
                <EmptyState
                  icon={Sparkle}
                  title={search ? "No results" : "All caught up"}
                  description={
                    search
                      ? "No documents found for the applied filter."
                      : "There are no batches pending export at the moment."
                  }
                />
              ) : (
                <PendingTable
                  documents={filteredDocuments}
                  selection={selection}
                  onToggle={toggleDoc}
                  onToggleAll={toggleAll}
                  onDownloadPdf={handleDownloadPdf}
                  loading={isLoadingTab}
                  onLoadMore={loadMoreTab}
                  hasMore={hasMoreTab}
                  loadingMore={loadingMoreTab}
                />
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between px-5 py-4 border-b border-app-border-subtle">
              <div className="flex items-center gap-2">
                <ClockCounterClockwise size={18} className="text-app-text-muted" />
                <h2 className="text-feature-title text-app-text">Export history</h2>
              </div>
            </div>

            {history.length === 0 && !loadingHistory ? (
              <div className="p-5">
                <EmptyState
                  icon={ClockCounterClockwise}
                  title="No batch exported yet"
                  description="The batches you generate will appear here."
                />
              </div>
            ) : (
              <HistoryTable
                batches={history}
                loading={loadingHistory}
                onLoadMore={loadMoreHistory}
                hasMore={hasMoreHistory}
                loadingMore={loadingMoreHistory}
              />
            )}
          </Card>
        </>
      )}

      <AnimatePresence>
        {selection.size > 0 && !loadingBase && !generalError && (
          <IntegrationSendActionBar
            quantity={selection.size}
            totalAmount={selectedAmount}
            integrationName={activeIntegration?.name ?? null}
            integrationConfigured={activeIntegration?.configurada ?? false}
            loading={sending}
            onClear={() => setSelection(new Set())}
            onSend={openConfirmation}
          />
        )}
      </AnimatePresence>

      {integrationModal && (
        <IntegrationKeyModal
          integration={integrationModal}
          onClose={() => setIntegrationModal(null)}
          onSaved={() => {
            setIntegrationModal(null);
            queryClient.invalidateQueries({ queryKey: queryKeys.export.integrations });
          }}
        />
      )}

      <Modal open={confirming} onClose={() => !sending && setConfirming(false)}>
        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/[0.08] shrink-0">
              <PaperPlaneTilt size={18} weight="fill" className="text-brand" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-feature-title text-app-text">Send entries?</p>
              <p className="text-body-sm text-app-text-muted leading-relaxed">
                {selection.size} {selection.size === 1 ? "document will be sent" : "documents will be sent"}{" "}
                via API to <strong className="text-app-text">{activeIntegration?.name ?? "—"}</strong>.
                Successfully sent batches cannot be reverted.
              </p>
              <p className="text-small text-app-text-subtle font-normal">
                Total: {fmtCurrency(selectedAmount)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-caption font-semibold text-app-text-muted">Bank account</label>
            {loadingAccounts ? (
              <div className="text-body-sm text-app-text-muted">Loading accounts…</div>
            ) : availableAccounts.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                <p className="text-body-sm text-amber-800">
                  No active bank account with an ERP code registered. Register one under &quot;Bank Accounts&quot; before sending.
                </p>
              </div>
            ) : (
              <select
                value={selectedAccountId ?? ""}
                onChange={(e) => setSelectedAccountId(Number(e.target.value))}
                disabled={sending}
                className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-body-sm text-app-text outline-none transition-colors focus:border-brand disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {availableAccounts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.description}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="light" size="sm" onClick={() => setConfirming(false)} disabled={sending}>
              Cancel
            </Button>
            <Button
              variant="brand"
              size="sm"
              onClick={handleSend}
              disabled={sending || loadingAccounts || selectedAccountId === null}
            >
              {sending ? "Sending…" : "Send now"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
