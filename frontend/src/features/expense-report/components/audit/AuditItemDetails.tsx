"use client";

import { MapPin } from "@phosphor-icons/react";
import { formatarData, formatarMoeda } from "@/lib/formatters";
import type { ExpenseReport, ExpenseReportItem } from "../../expense-report.types";

interface Props {
  expenseReport: ExpenseReport;
  selectedItem: ExpenseReportItem;
  onViewLocation: () => void;
}

export default function AuditItemDetails({ expenseReport, selectedItem, onViewLocation }: Props) {
  return (
    <>
      <div className="space-y-3 p-5">
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { label: "Date", value: formatarData(selectedItem.expense_date) },
              { label: "Amount", value: selectedItem.amount ? formatarMoeda(parseFloat(selectedItem.amount)) : "—" },
              { label: "Category", value: selectedItem.expense_category?.description ?? "—" },
              { label: "Cost Center", value: selectedItem.cost_center?.description ?? "—" },
            ] as const
          ).map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-app-surface-raised/30 p-3">
              <p className="mb-0.5 text-small text-app-text-muted">{label}</p>
              <p className="line-clamp-2 text-caption font-semibold text-app-text">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-app-surface-raised/30 p-3">
          <p className="mb-0.5 text-small text-app-text-muted">Description</p>
          <p className="text-body-sm text-app-text">{selectedItem.description}</p>
        </div>

        {selectedItem.latitude != null && selectedItem.longitude != null ? (
          <button
            type="button"
            onClick={onViewLocation}
            className="w-full text-left rounded-xl bg-app-surface-raised/30 p-3 hover:bg-app-surface-raised/60 transition-colors cursor-pointer"
          >
            <p className="mb-0.5 flex items-center gap-1.5 text-small text-app-text-muted">
              <MapPin size={12} />
              Location — click to view on map
            </p>
            <p className="text-body-sm text-app-text">
              {selectedItem.address ?? `${Number(selectedItem.latitude).toFixed(6)}, ${Number(selectedItem.longitude).toFixed(6)}`}
            </p>
          </button>
        ) : null}
      </div>

      <div className="px-5 pb-4">
        <div className="rounded-2xl border border-app-border bg-app-surface-raised/40 p-4 space-y-3">
          <h3 className="text-caption font-semibold text-app-text-muted uppercase tracking-wide">
            Requester
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-small text-app-text-muted">Name</p>
              <p className="text-body-sm text-app-text">{expenseReport.requester_description ?? "—"}</p>
            </div>
            <div>
              <p className="text-small text-app-text-muted">Department</p>
              <p className="text-body-sm text-app-text">{expenseReport.requester_department ?? "—"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-small text-app-text-muted">Tax ID</p>
              <p className="text-body-sm text-app-text">{expenseReport.requester_tax_id ?? "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {expenseReport.notes && (
        <div className="px-5 pb-4">
          <div className="rounded-2xl border border-app-border bg-app-surface-raised/40 p-4 space-y-2">
            <h3 className="text-caption font-semibold text-app-text-muted uppercase tracking-wide">
              Notes
            </h3>
            <p className="text-body-sm text-app-text whitespace-pre-line">{expenseReport.notes}</p>
          </div>
        </div>
      )}
    </>
  );
}
