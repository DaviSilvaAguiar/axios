"use client";

import { FilePdf } from "@phosphor-icons/react";
import DataTable, { type DataTableColumn } from "@/ui/DataTable";
import type { PendingDocument } from "../export.types";

const STATUS_CLASS: Record<string, string> = {
  "Aprovado":           "bg-green-100 text-green-700 ring-green-200",
  "Pagamento Agendado": "bg-amber-100 text-amber-700 ring-amber-200",
};

function StatusPill({ text }: { text: string }) {
  const cls = STATUS_CLASS[text] ?? "bg-[#eef0f3] text-[#5b616e] ring-[#d8dce4]";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-small ring-1 font-medium ${cls}`}>
      {text}
    </span>
  );
}

const fmtCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

interface Props {
  documents: PendingDocument[];
  selection: Set<number>;
  onToggle: (id: number) => void;
  onToggleAll: () => void;
  onDownloadPdf?: (doc: PendingDocument) => void;
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export default function PendingTable({
  documents,
  selection,
  onToggle,
  onToggleAll,
  onDownloadPdf,
  loading,
  onLoadMore,
  hasMore,
  loadingMore,
}: Props) {
  const columns: DataTableColumn<PendingDocument>[] = [
    {
      key: "identifier",
      header: "Identifier",
      sortable: true,
      sortAccessor: (d) => d.identifier,
      render: (d) => (
        <span className="font-semibold text-app-text whitespace-nowrap">{d.identifier}</span>
      ),
    },
    {
      key: "description",
      header: "Description",
      sortable: true,
      sortAccessor: (d) => d.description,
      render: (d) => (
        <span
          className="block max-w-[220px] truncate text-app-text-muted"
          title={d.description ?? undefined}
        >
          {d.description ?? "—"}
        </span>
      ),
    },
    {
      key: "provider",
      header: "Provider",
      sortable: true,
      sortAccessor: (d) => d.provider,
      render: (d) => (
        <span
          className="block max-w-[180px] truncate text-app-text-muted"
          title={d.provider}
        >
          {d.provider}
        </span>
      ),
    },
    {
      key: "cost_center",
      header: "Cost Center",
      sortable: true,
      sortAccessor: (d) => d.cost_center,
      render: (d) => (
        <span
          className="block max-w-[180px] truncate text-app-text-muted"
          title={d.cost_center ?? undefined}
        >
          {d.cost_center ?? "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortAccessor: (d) => d.status,
      render: (d) => <StatusPill text={d.status} />,
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      sortAccessor: (d) => (d.date ? new Date(d.date) : null),
      render: (d) => (
        <span className="text-app-text-muted whitespace-nowrap">{fmtDate(d.date)}</span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      sortable: true,
      sortAccessor: (d) => d.amount,
      render: (d) => (
        <span className="font-semibold text-app-text tabular-nums whitespace-nowrap">
          {fmtCurrency(d.amount)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "w-10",
      render: (d) =>
        onDownloadPdf ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownloadPdf(d);
            }}
            className="inline-flex p-1.5 rounded-lg text-app-text-muted hover:text-brand hover:bg-brand/[0.06] transition-colors cursor-pointer"
            aria-label="Download report PDF"
            title="Download report PDF"
          >
            <FilePdf size={18} />
          </button>
        ) : (
          <span className="text-app-text-subtle text-small">—</span>
        ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={documents}
      keyExtractor={(d) => d.id}
      loading={loading}
      selection={{ selecao: selection, onToggle, onToggleTodos: onToggleAll }}
      onRowClick={(d) => onToggle(d.id)}
      tamanho={10}
      onLoadMore={onLoadMore}
      hasMore={hasMore}
      loadingMore={loadingMore}
    />
  );
}
