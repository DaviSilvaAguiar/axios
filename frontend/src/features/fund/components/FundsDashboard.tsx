"use client";

import { useMemo } from "react";
import { Vault } from "@phosphor-icons/react";
import EmptyState from "@/ui/EmptyState";
import DataTable, { type DataTableColumn } from "@/ui/DataTable";
import {
  FUND_TIPO_LABEL,
  type Fund,
} from "../fund.types";
import { formatarMoeda } from "@/lib/formatters";

interface Props {
  funds: Fund[];
  onSelectFund: (fund: Fund) => void;
  closed?: boolean;
}

export default function FundsDashboard({ funds, onSelectFund, closed }: Props) {
  const columns = useMemo<DataTableColumn<Fund>[]>(() => [
    {
      key: "id",
      header: "#",
      render: (c) => <span className="text-small text-app-text-subtle">{c.id}</span>,
    },
    {
      key: "description",
      header: "Description",
      render: (c) => (
        <span className="text-app-text font-medium max-w-xs truncate block">{c.description}</span>
      ),
    },
    {
      key: "owner",
      header: "In Charge",
      render: (c) => (
        <span className="text-app-text">{c.user?.name ?? `User #${c.user_id}`}</span>
      ),
    },
    {
      key: "cost_center",
      header: "Cost Center",
      render: (c) => (
        <span className="text-app-text-muted">
          {c.cost_center?.description ?? `#${c.cost_center_id}`}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (c) => (
        <span className="text-small text-app-text-muted">{FUND_TIPO_LABEL[c.type]}</span>
      ),
    },
    {
      key: "balance",
      header: "Balance",
      align: "right",
      render: (c) => (
        <span className="text-app-text font-semibold whitespace-nowrap">
          {formatarMoeda(Number(c.balance))}
        </span>
      ),
    },
  ], []);

  if (funds.length === 0) {
    return (
      <EmptyState
        icon={Vault}
        title={closed ? "No closed funds" : "No open funds"}
        description={
          closed
            ? "Closed funds appear here once their balance reaches zero."
            : "Create a new fund so a team member can start operating."
        }
      />
    );
  }

  return (
    <DataTable
      columns={columns}
      rows={funds}
      keyExtractor={(c) => c.id}
      onRowClick={onSelectFund}
    />
  );
}
