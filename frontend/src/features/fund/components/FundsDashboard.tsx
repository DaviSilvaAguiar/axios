"use client";

import { useMemo } from "react";
import { Vault } from "@phosphor-icons/react";
import EmptyState from "@/ui/EmptyState";
import DataTable, { type DataTableColumn } from "@/ui/DataTable";
import {
  CAIXA_CONTA_TIPO_LABEL,
  type CaixaConta,
} from "../caixa-conta.types";
import { formatarMoeda } from "@/lib/formatters";

interface Props {
  caixas: CaixaConta[];
  onSelecionarCaixa: (caixa: CaixaConta) => void;
  fechados?: boolean;
}

export default function DashboardCaixas({ caixas, onSelecionarCaixa, fechados }: Props) {
  const columns = useMemo<DataTableColumn<CaixaConta>[]>(() => [
    {
      key: "id",
      header: "#",
      render: (c) => <span className="text-small text-app-text-subtle">{c.id}</span>,
    },
    {
      key: "descricao",
      header: "Descrição",
      render: (c) => (
        <span className="text-app-text font-medium max-w-xs truncate block">{c.descricao}</span>
      ),
    },
    {
      key: "responsavel",
      header: "Responsável",
      render: (c) => (
        <span className="text-app-text">{c.usuario?.nome ?? `Usuário #${c.id_usuario}`}</span>
      ),
    },
    {
      key: "centro_de_custo",
      header: "Centro de Custo",
      render: (c) => (
        <span className="text-app-text-muted">
          {c.centro_de_custo?.descricao ?? `#${c.id_centro_custo}`}
        </span>
      ),
    },
    {
      key: "tipo",
      header: "Tipo",
      render: (c) => (
        <span className="text-small text-app-text-muted">{CAIXA_CONTA_TIPO_LABEL[c.tipo]}</span>
      ),
    },
    {
      key: "saldo",
      header: "Saldo",
      align: "right",
      render: (c) => (
        <span className="text-app-text font-semibold whitespace-nowrap">
          {formatarMoeda(Number(c.saldo))}
        </span>
      ),
    },
  ], []);

  if (caixas.length === 0) {
    return (
      <EmptyState
        icon={Vault}
        title={fechados ? "Nenhum caixa fechado" : "Nenhum caixa aberto"}
        description={
          fechados
            ? "Caixas fechados aparecem aqui após o saldo ser zerado."
            : "Crie um novo caixa para um colaborador começar a operar."
        }
      />
    );
  }

  return (
    <DataTable
      columns={columns}
      rows={caixas}
      keyExtractor={(c) => c.id}
      onRowClick={onSelecionarCaixa}
    />
  );
}
