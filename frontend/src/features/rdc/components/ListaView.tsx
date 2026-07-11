"use client";

import { Tray } from "@phosphor-icons/react";
import EmptyState from "@/ui/EmptyState";
import DataTable, { type DataTableColumn } from "@/ui/DataTable";
import StatusTag from "./StatusTag";
import { type Rdc } from "../rdc.types";
import { formatarData } from "@/lib/formatters";

interface ListaViewProps {
  rdcs: Rdc[];
  onSelecionarRdc: (rdc: Rdc) => void;
}

const columns: DataTableColumn<Rdc>[] = [
  {
    key: "id",
    header: "#",
    render: (r) => <span className="text-small text-app-text-subtle">{r.id}</span>,
  },
  {
    key: "descricao",
    header: "Descrição",
    render: (r) => (
      <span className="text-app-text font-medium max-w-xs truncate block">{r.descricao}</span>
    ),
  },
  {
    key: "requisitante",
    header: "Requisitante",
    render: (r) => <span className="text-app-text">{r.descricao_requisitante}</span>,
  },
  {
    key: "setor",
    header: "Setor",
    render: (r) => <span className="text-app-text-muted">{r.setor_requisitante}</span>,
  },
  {
    key: "necessidade",
    header: "Necessidade",
    render: (r) => (
      <span className="text-small text-app-text-muted whitespace-nowrap">
        {formatarData(r.data_inicio_periodo ?? r.data_necessidade)}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (r) => <StatusTag status={r.status} />,
  },
  {
    key: "created_at",
    header: "Criado em",
    render: (r) => (
      <span className="text-small text-app-text-muted whitespace-nowrap">
        {formatarData(r.created_at)}
      </span>
    ),
  },
];

export default function ListaView({ rdcs, onSelecionarRdc }: ListaViewProps) {
  if (rdcs.length === 0) {
    return (
      <EmptyState
        icon={Tray}
        title="Nenhum RDC encontrado"
        description="Crie um novo RDC ou ajuste os filtros."
      />
    );
  }

  return (
    <DataTable
      columns={columns}
      rows={rdcs}
      onRowClick={onSelecionarRdc}
      keyExtractor={(r) => r.id}
    />
  );
}
