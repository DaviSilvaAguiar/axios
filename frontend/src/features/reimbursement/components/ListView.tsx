"use client";

import { ReceiptX } from "@phosphor-icons/react";
import EmptyState from "@/ui/EmptyState";
import DataTable, { type DataTableColumn } from "@/ui/DataTable";
import StatusTag from "./StatusTag";
import { type Reimbursement } from "../reimbursement.types";
import { formatarData, formatarMoeda } from "@/lib/formatters";

function calculateTotal(reimbursement: Reimbursement): number {
  if (!reimbursement.items || reimbursement.items.length === 0) return 0;
  return reimbursement.items.reduce((acc, d) => acc + parseFloat(d.amount), 0);
}

function formatAmount(reimbursement: Reimbursement): string {
  if (!reimbursement.items || reimbursement.items.length === 0) return "—";
  return formatarMoeda(calculateTotal(reimbursement));
}

interface ListViewProps {
  reimbursements: Reimbursement[];
  onSelectReimbursement: (reimbursement: Reimbursement) => void;
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

const columns: DataTableColumn<Reimbursement>[] = [
  {
    key: "id",
    header: "ID",
    sortable: true,
    sortAccessor: (r) => r.id,
    render: (r) => <span className="text-small text-app-text-subtle">{r.id}</span>,
  },
  {
    key: "employee",
    header: "Employee",
    sortable: true,
    sortAccessor: (r) => r.user?.name ?? null,
    render: (r) => <span className="text-app-text">{r.user?.name ?? "—"}</span>,
  },
  {
    key: "title",
    header: "Title",
    sortable: true,
    sortAccessor: (r) => r.title,
    render: (r) => (
      <span className="text-app-text font-medium max-w-xs truncate block">{r.title}</span>
    ),
  },
  {
    key: "amount",
    header: "Total Amount",
    align: "right",
    sortable: true,
    sortAccessor: (r) => calculateTotal(r),
    render: (r) => (
      <span className="text-app-text font-semibold tabular-nums">{formatAmount(r)}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    sortAccessor: (r) => r.status,
    render: (r) => <StatusTag status={r.status} />,
  },
  {
    key: "date",
    header: "Date",
    sortable: true,
    sortAccessor: (r) => new Date(r.created_at),
    render: (r) => (
      <span className="text-small text-app-text-muted whitespace-nowrap">
        {formatarData(r.created_at)}
      </span>
    ),
  },
];

export default function ListView({ reimbursements, onSelectReimbursement, loading, onLoadMore, hasMore, loadingMore }: ListViewProps) {
  return (
    <DataTable
      columns={columns}
      rows={reimbursements}
      onRowClick={onSelectReimbursement}
      keyExtractor={(r) => r.id}
      defaultSort={{ columnKey: "date", direction: "desc" }}
      loading={loading}
      onLoadMore={onLoadMore}
      hasMore={hasMore}
      loadingMore={loadingMore}
      empty={
        <EmptyState
          icon={ReceiptX}
          title="No reimbursements found"
          description="Create a new request or adjust the filters."
        />
      }
    />
  );
}
