"use client";

import { HandCoins, Receipt } from "@phosphor-icons/react";
import DataTable, { type DataTableColumn } from "@/ui/DataTable";
import type { LoteHistorico } from "../exportacao.types";

const fmtMoeda = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtDataHora = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

interface Props {
  lotes: LoteHistorico[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export default function TabelaHistorico({ lotes, loading, onLoadMore, hasMore, loadingMore }: Props) {
  const columns: DataTableColumn<LoteHistorico>[] = [
    {
      key: "id",
      header: "Lote",
      sortable: true,
      sortAccessor: (l) => l.id,
      render: (l) => <span className="font-semibold text-app-text">#{l.id}</span>,
    },
    {
      key: "tipo",
      header: "Tipo",
      sortable: true,
      sortAccessor: (l) => l.tipo_lote,
      render: (l) => (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-small ring-1 bg-[#eef0f3] text-[#5b616e] ring-[#d8dce4]">
          {l.tipo_lote === "CAIXA" ? <Receipt size={11} /> : <HandCoins size={11} />}
          {l.tipo_lote === "CAIXA" ? "Caixinha" : "Reembolso"}
        </span>
      ),
    },
    {
      key: "integracao",
      header: "Integração",
      sortable: true,
      sortAccessor: (l) => l.template_utilizado,
      render: (l) => <span className="text-app-text-muted">{l.template_utilizado}</span>,
    },
    {
      key: "itens",
      header: "Itens",
      sortable: true,
      sortAccessor: (l) => l.quantidade_itens,
      render: (l) => (
        <span className="text-app-text-muted tabular-nums">{l.quantidade_itens}</span>
      ),
    },
    {
      key: "usuario",
      header: "Gerado por",
      sortable: true,
      sortAccessor: (l) => l.usuario?.nome ?? null,
      render: (l) => <span className="text-app-text-muted">{l.usuario?.nome ?? "—"}</span>,
    },
    {
      key: "data",
      header: "Data",
      sortable: true,
      sortAccessor: (l) => new Date(l.created_at),
      render: (l) => <span className="text-app-text-muted">{fmtDataHora(l.created_at)}</span>,
    },
    {
      key: "valor",
      header: "Valor",
      align: "right",
      sortable: true,
      sortAccessor: (l) => l.valor_total,
      render: (l) => (
        <span className="font-semibold text-app-text tabular-nums">
          {fmtMoeda(l.valor_total)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={lotes}
      keyExtractor={(l) => l.id}
      loading={loading}
      tamanho={5}
      defaultSort={{ columnKey: "data", direction: "desc" }}
      onLoadMore={onLoadMore}
      hasMore={hasMore}
      loadingMore={loadingMore}
    />
  );
}
