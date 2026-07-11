"use client";

import { FilePdf } from "@phosphor-icons/react";
import DataTable, { type DataTableColumn } from "@/ui/DataTable";
import type { DocumentoPendente } from "../exportacao.types";

const STATUS_CLASS: Record<string, string> = {
  "Aprovado":           "bg-green-100 text-green-700 ring-green-200",
  "Pagamento Agendado": "bg-amber-100 text-amber-700 ring-amber-200",
};

function StatusPill({ texto }: { texto: string }) {
  const cls = STATUS_CLASS[texto] ?? "bg-[#eef0f3] text-[#5b616e] ring-[#d8dce4]";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-small ring-1 font-medium ${cls}`}>
      {texto}
    </span>
  );
}

const fmtMoeda = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtData = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

interface Props {
  documentos: DocumentoPendente[];
  selecao: Set<number>;
  onToggle: (id: number) => void;
  onToggleTodos: () => void;
  onBaixarPdf?: (doc: DocumentoPendente) => void;
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export default function TabelaPendentes({
  documentos,
  selecao,
  onToggle,
  onToggleTodos,
  onBaixarPdf,
  loading,
  onLoadMore,
  hasMore,
  loadingMore,
}: Props) {
  const columns: DataTableColumn<DocumentoPendente>[] = [
    {
      key: "identificador",
      header: "Identificador",
      sortable: true,
      sortAccessor: (d) => d.identificador,
      render: (d) => (
        <span className="font-semibold text-app-text whitespace-nowrap">{d.identificador}</span>
      ),
    },
    {
      key: "descricao",
      header: "Descrição",
      sortable: true,
      sortAccessor: (d) => d.descricao,
      render: (d) => (
        <span
          className="block max-w-[220px] truncate text-app-text-muted"
          title={d.descricao ?? undefined}
        >
          {d.descricao ?? "—"}
        </span>
      ),
    },
    {
      key: "prestador",
      header: "Prestador",
      sortable: true,
      sortAccessor: (d) => d.prestador,
      render: (d) => (
        <span
          className="block max-w-[180px] truncate text-app-text-muted"
          title={d.prestador}
        >
          {d.prestador}
        </span>
      ),
    },
    {
      key: "centro_custo",
      header: "Centro de Custo",
      sortable: true,
      sortAccessor: (d) => d.centro_custo,
      render: (d) => (
        <span
          className="block max-w-[180px] truncate text-app-text-muted"
          title={d.centro_custo ?? undefined}
        >
          {d.centro_custo ?? "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortAccessor: (d) => d.status,
      render: (d) => <StatusPill texto={d.status} />,
    },
    {
      key: "data",
      header: "Data",
      sortable: true,
      sortAccessor: (d) => (d.data ? new Date(d.data) : null),
      render: (d) => (
        <span className="text-app-text-muted whitespace-nowrap">{fmtData(d.data)}</span>
      ),
    },
    {
      key: "valor",
      header: "Valor",
      align: "right",
      sortable: true,
      sortAccessor: (d) => d.valor,
      render: (d) => (
        <span className="font-semibold text-app-text tabular-nums whitespace-nowrap">
          {fmtMoeda(d.valor)}
        </span>
      ),
    },
    {
      key: "acoes",
      header: "",
      align: "right",
      width: "w-10",
      render: (d) =>
        onBaixarPdf ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBaixarPdf(d);
            }}
            className="inline-flex p-1.5 rounded-lg text-app-text-muted hover:text-brand hover:bg-brand/[0.06] transition-colors cursor-pointer"
            aria-label="Baixar PDF do relatório"
            title="Baixar PDF do relatório"
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
      rows={documentos}
      keyExtractor={(d) => d.id}
      loading={loading}
      selection={{ selecao, onToggle, onToggleTodos }}
      onRowClick={(d) => onToggle(d.id)}
      tamanho={10}
      onLoadMore={onLoadMore}
      hasMore={hasMore}
      loadingMore={loadingMore}
    />
  );
}
