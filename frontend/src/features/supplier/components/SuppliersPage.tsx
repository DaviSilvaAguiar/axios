"use client";

import { Storefront } from "@phosphor-icons/react";
import CrudResourcePage from "@/ui/CrudResourcePage";
import type { DataTableColumn } from "@/ui/DataTable";
import { formatarCpfCnpj } from "@/lib/formatters";
import SupplierForm from "./SupplierForm";
import { useSuppliers, useSupplierMutations } from "../supplier.hooks";
import type { Supplier, SupplierFormData } from "../supplier.types";

const extraColumns: DataTableColumn<Supplier>[] = [
  {
    key: "tax_id",
    header: "CPF / CNPJ",
    sortable: true,
    sortAccessor: (s) => s.tax_id,
    render: (s) => (
      <span className="text-app-text-muted tabular-nums">{formatarCpfCnpj(s.tax_id)}</span>
    ),
  },
  {
    key: "person_type",
    header: "Type",
    sortable: true,
    sortAccessor: (s) => s.person_type,
    render: (s) => (
      <span className="text-app-text-muted">{s.person_type === "J" ? "Company" : "Individual"}</span>
    ),
  },
];

export default function SuppliersPage() {
  const list = useSuppliers();
  const mutations = useSupplierMutations();

  return (
    <CrudResourcePage<Supplier, SupplierFormData>
      title="Suppliers"
      newLabel="New Supplier"
      searchPlaceholder="Search by name, CPF/CNPJ or ERP code…"
      icon={Storefront}
      messages={{
        created: "Supplier created.",
        updated: "Supplier updated.",
        removed: "Supplier removed.",
        activated: "Supplier activated.",
        deactivated: "Supplier deactivated.",
        statusError: "Could not change the status.",
        removeError: "Could not remove the supplier.",
        deleteTitle: "Remove supplier",
        emptyTitle: "No suppliers found",
      }}
      list={list}
      mutations={mutations}
      extraColumns={extraColumns}
      matchesSearch={(supplier, term) => {
        const needle = term.toLowerCase();
        return (
          supplier.description.toLowerCase().includes(needle) ||
          supplier.tax_id.toLowerCase().includes(needle) ||
          (supplier.erp_code ?? "").toLowerCase().includes(needle)
        );
      }}
      renderForm={(supplier, onSave, onCancel) => (
        <SupplierForm supplier={supplier} onSave={onSave} onCancel={onCancel} />
      )}
    />
  );
}
