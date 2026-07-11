"use client";

import { ReceiptX } from "@phosphor-icons/react";
import EmptyState from "@/ui/EmptyState";
import DataTable, { type DataTableColumn } from "@/ui/DataTable";
import StatusTag from "./StatusTag";
import { type Rcm } from "../rcm.types";
import { formatarData } from "@/lib/formatters";

function calcularTotal(rcm: Rcm): number {
  if (!rcm.despesas || rcm.despesas.length === 0) return 0;
  return rcm.despesas.reduce((acc, d) => acc + parseFloat(d.valor), 0);
}

function formatarValor(rcm: Rcm): string {
  if (!rcm.despesas || rcm.despesas.length === 0) return "—";
  return calcularTotal(rcm).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface ListaViewProps {
  rcms: Rcm[];
  onSelecionarRcm: (rcm: Rcm) => void;
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

const columns: DataTableColumn<Rcm>[] = [
  {
    key: "id",
    header: "ID",
    sortable: true,
    sortAccessor: (r) => r.id,
    render: (r) => <span className="text-small text-app-text-subtle">{r.id}</span>,
  },
  {
    key: "colaborador",
    header: "Colaborador",
    sortable: true,
    sortAccessor: (r) => r.usuario?.nome ?? null,
    render: (r) => <span className="text-app-text">{r.usuario?.nome ?? "—"}</span>,
  },
  {
    key: "titulo",
    header: "Título",
    sortable: true,
    sortAccessor: (r) => r.titulo,
    render: (r) => (
      <span className="text-app-text font-medium max-w-xs truncate block">{r.titulo}</span>
    ),
  },
  {
    key: "valor",
    header: "Valor Total",
    align: "right",
    sortable: true,
    sortAccessor: (r) => calcularTotal(r),
    render: (r) => (
      <span className="text-app-text font-semibold tabular-nums">{formatarValor(r)}</span>
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
    key: "data",
    header: "Data",
    sortable: true,
    sortAccessor: (r) => new Date(r.created_at),
    render: (r) => (
      <span className="text-small text-app-text-muted whitespace-nowrap">
        {formatarData(r.created_at)}
      </span>
    ),
  },
];

export default function ListaView({ rcms, onSelecionarRcm, loading, onLoadMore, hasMore, loadingMore }: ListaViewProps) {
  return (
    <DataTable
      columns={columns}
      rows={rcms}
      onRowClick={onSelecionarRcm}
      keyExtractor={(r) => r.id}
      defaultSort={{ columnKey: "data", direction: "desc" }}
      loading={loading}
      onLoadMore={onLoadMore}
      hasMore={hasMore}
      loadingMore={loadingMore}
      empty={
        <EmptyState
          icon={ReceiptX}
          title="Nenhum reembolso encontrado"
          description="Crie uma nova solicitação ou ajuste os filtros."
        />
      }
    />
  );
}
