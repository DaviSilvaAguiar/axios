import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { queryKeys } from "@/lib/queryKeys";
import {
  usePendingStats,
  usePendingExpenseReports,
  usePendingReimbursements,
  useExportHistory,
} from "../export.hooks";
import type { BatchType, PendingDocument } from "../export.types";
import { sendLoteIntegrationApi } from "@/features/integration/integration.api";
import { useIntegrations } from "@/features/integration/integration.hooks";
import type { Integration } from "@/features/integration/integration.types";
import { downloadPdfReimbursementApi } from "@/features/reimbursement/reimbursement.api";
import { downloadPdfExpenseReportApi } from "@/features/expense-report/expense-report.api";
import { listContasBancariasApi } from "@/features/bank-account/bank-account.api";
import type { BankAccount } from "@/features/bank-account/bank-account.types";

export function useExportPage() {
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

  function clearSelection() {
    setSelection(new Set());
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

  function closeIntegrationModal() {
    setIntegrationModal(null);
  }

  function handleIntegrationSaved() {
    setIntegrationModal(null);
    queryClient.invalidateQueries({ queryKey: queryKeys.export.integrations });
  }

  const lastBatch = history[0];

  return {
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
    setSelection,
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
  };
}
