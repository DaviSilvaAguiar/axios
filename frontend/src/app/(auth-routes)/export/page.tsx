"use client";

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
import { formatarMoeda, formatarData } from "@/lib/formatters";
import { useExportPage } from "@/features/export/hooks/useExportPage";
import StatCard from "@/features/export/components/StatCard";
import Tab from "@/features/export/components/Tab";
import PendingTable from "@/features/export/components/PendingTable";
import HistoryTable from "@/features/export/components/HistoryTable";
import IntegrationSelector from "@/features/integration/components/IntegrationSelector";
import IntegrationKeyModal from "@/features/integration/components/IntegrationKeyModal";
import IntegrationSendActionBar from "@/features/integration/components/IntegrationSendActionBar";

export default function ExportPage() {
  const {
    tab,
    changeTab,
    search,
    setSearch,
    stats,
    loadingBase,
    generalError,
    reloadBase,
    lastBatch,
    integrations,
    loadingIntegrations,
    activeIntegration,
    integrationModal,
    setIntegrationModal,
    closeIntegrationModal,
    handleIntegrationSaved,
    filteredDocuments,
    selection,
    toggleDoc,
    toggleAll,
    clearSelection,
    selectedAmount,
    handleDownloadPdf,
    isLoadingTab,
    hasMoreTab,
    loadingMoreTab,
    loadMoreTab,
    history,
    loadingHistory,
    hasMoreHistory,
    loadingMoreHistory,
    loadMoreHistory,
    confirming,
    setConfirming,
    sending,
    openConfirmation,
    handleSend,
    availableAccounts,
    loadingAccounts,
    selectedAccountId,
    setSelectedAccountId,
  } = useExportPage();

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
              hint={`${formatarMoeda(stats?.expense_report.amount ?? 0)} accumulated`}
            />
            <StatCard
              icon={HandCoins}
              label="Pending reimbursements"
              value={String(stats?.reimbursement.quantity ?? 0)}
              hint={`${formatarMoeda(stats?.reimbursement.amount ?? 0)} accumulated`}
            />
            <StatCard
              icon={ClockCounterClockwise}
              label="Last exported batch"
              value={lastBatch ? formatarData(lastBatch.created_at) : "—"}
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
            onClear={clearSelection}
            onSend={openConfirmation}
          />
        )}
      </AnimatePresence>

      {integrationModal && (
        <IntegrationKeyModal
          integration={integrationModal}
          onClose={closeIntegrationModal}
          onSaved={handleIntegrationSaved}
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
                Total: {formatarMoeda(selectedAmount)}
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
