"use client";

import { Tray } from "@phosphor-icons/react";
import EmptyState from "@/ui/EmptyState";
import DataTable, { type DataTableColumn } from "@/ui/DataTable";
import StatusTag from "./StatusTag";
import { type ExpenseReport } from "../expense-report.types";
import { formatarData } from "@/lib/formatters";

interface ListViewProps {
  rdcs: ExpenseReport[];
  onSelectExpenseReport: (expenseReport: ExpenseReport) => void;
}

const columns: DataTableColumn<ExpenseReport>[] = [
  {
    key: "id",
    header: "#",
    render: (r) => <span className="text-small text-app-text-subtle">{r.id}</span>,
  },
  {
    key: "description",
    header: "Description",
    render: (r) => (
      <span className="text-app-text font-medium max-w-xs truncate block">{r.description}</span>
    ),
  },
  {
    key: "requester",
    header: "Requester",
    render: (r) => <span className="text-app-text">{r.requester_description}</span>,
  },
  {
    key: "department",
    header: "Department",
    render: (r) => <span className="text-app-text-muted">{r.requester_department}</span>,
  },
  {
    key: "needed",
    header: "Needed",
    render: (r) => (
      <span className="text-small text-app-text-muted whitespace-nowrap">
        {formatarData(r.period_start_date ?? r.needed_at)}
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
    header: "Created",
    render: (r) => (
      <span className="text-small text-app-text-muted whitespace-nowrap">
        {formatarData(r.created_at)}
      </span>
    ),
  },
];

export default function ListView({ rdcs, onSelectExpenseReport }: ListViewProps) {
  if (rdcs.length === 0) {
    return (
      <EmptyState
        icon={Tray}
        title="No reports found"
        description="Create a new report or adjust the filters."
      />
    );
  }

  return (
    <DataTable
      columns={columns}
      rows={rdcs}
      onRowClick={onSelectExpenseReport}
      keyExtractor={(r) => r.id}
    />
  );
}
