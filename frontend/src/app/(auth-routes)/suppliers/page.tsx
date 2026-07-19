"use client";

import { useState } from "react";
import { usePaginatedList } from "@/lib/usePaginatedList";
import {
  Plus,
  Trash,
  Storefront,
  MagnifyingGlass,
  Power,
} from "@phosphor-icons/react";
import Button from "@/ui/Button";
import Card from "@/ui/Card";
import Modal from "@/ui/Modal";
import Input from "@/ui/Input";
import EmptyState from "@/ui/EmptyState";
import DataTable, { type DataTableColumn } from "@/ui/DataTable";
import ConfirmModal from "@/ui/ConfirmModal";
import ActiveBadge from "@/ui/ActiveBadge";
import { toast } from "@/lib/toast";
import { formatarCpfCnpj } from "@/lib/formatters";
import SupplierForm from "@/features/supplier/components/SupplierForm";
import {
  listSupplieresApi,
  createSupplierApi,
  updateSupplierApi,
  deleteSupplierApi,
} from "@/features/supplier/supplier.api";
import type {
  Supplier,
  SupplierFormData,
} from "@/features/supplier/supplier.types";

export default function SuppliersPage() {
  const {
    items: suppliers,
    setItems: setSuppliers,
    loading,
    loadingMore,
    hasMore,
    error: error,
    reload: reload,
    loadMore: loadMore,
  } = usePaginatedList<Supplier>(
    (page, perPage) => listSupplieresApi(page, perPage),
    { errorMessage: "Could not load the suppliers." }
  );

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Supplier | undefined>();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<Supplier | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  function openCreate() {
    setSelected(undefined);
    setModalOpen(true);
  }

  function openEdit(s: Supplier) {
    setSelected(s);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelected(undefined);
  }

  async function handleSave(data: SupplierFormData) {
    if (selected) {
      const { supplier } = await updateSupplierApi(selected.id, data);
      setSuppliers((prev) =>
        prev.map((s) => (s.id === supplier.id ? supplier : s))
      );
      toast.success("Supplier updated.");
    } else {
      const { supplier } = await createSupplierApi(data);
      setSuppliers((prev) =>
        [...prev, supplier].sort((a, b) => a.description.localeCompare(b.description))
      );
      toast.success("Supplier created.");
    }
    closeModal();
  }

  async function handleToggleActive(s: Supplier) {
    setTogglingId(s.id);
    try {
      const { supplier } = await updateSupplierApi(s.id, { active: !s.active });
      setSuppliers((prev) => prev.map((x) => (x.id === supplier.id ? supplier : x)));
      toast.success(s.active ? "Supplier deactivated." : "Supplier activated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not change the status.");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    setDeletingId(toDelete.id);
    try {
      await deleteSupplierApi(toDelete.id);
      setSuppliers((prev) => prev.filter((s) => s.id !== toDelete.id));
      toast.success("Supplier removed.");
      setToDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove the supplier.");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredSuppliers = suppliers.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.description.toLowerCase().includes(q) ||
      s.tax_id.toLowerCase().includes(q) ||
      (s.erp_code ?? "").toLowerCase().includes(q)
    );
  });

  const columns: DataTableColumn<Supplier>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      sortAccessor: (s) => s.id,
      render: (s) => <span className="text-small text-app-text-subtle">{s.id}</span>,
    },
    {
      key: "description",
      header: "Description",
      sortable: true,
      sortAccessor: (s) => s.description,
      render: (s) => <span className="font-medium text-app-text">{s.description}</span>,
    },
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
    {
      key: "erp_code",
      header: "ERP Code",
      sortable: true,
      sortAccessor: (s) => s.erp_code,
      render: (s) => (
        <span className="text-app-text-muted">
          {s.erp_code ?? <span className="text-app-text-subtle">—</span>}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortAccessor: (s) => (s.active ? 1 : 0),
      render: (s) => <ActiveBadge ativo={s.active} />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (s) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleActive(s); }}
            disabled={togglingId === s.id}
            className={[
              "p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-40",
              s.active
                ? "text-app-text-muted hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                : "text-app-text-muted hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10",
            ].join(" ")}
            aria-label={s.active ? "Deactivate" : "Activate"}
            title={s.active ? "Deactivate" : "Activate"}
          >
            <Power size={15} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setToDelete(s); }}
            className="p-2 rounded-lg text-app-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
            aria-label="Remove"
          >
            <Trash size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-4 p-6">
        <Card>
          <div className="flex items-center justify-between px-5 py-4">
            <h1 className="text-feature-title text-app-text">Suppliers</h1>
            <Button variant="dark" size="sm" onClick={openCreate}>
              <Plus size={14} />
              New
            </Button>
          </div>

          <div className="px-5 pb-4 border-t border-app-border pt-4">
            <Input
              label=""
              placeholder="Search by description, tax ID or ERP code…"
              icon={<MagnifyingGlass size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="!py-3 text-body-sm"
            />
          </div>
        </Card>

        <Card>
          <div className="p-5">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4">
                <p className="text-body-sm text-red-700">{error}</p>
                <button
                  onClick={() => reload()}
                  className="mt-2 text-caption font-semibold text-brand hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : (
              <DataTable
                columns={columns}
                rows={filteredSuppliers}
                onRowClick={openEdit}
                keyExtractor={(s) => s.id}
                loading={loading}
                onLoadMore={search ? undefined : loadMore}
                hasMore={search ? false : hasMore}
                loadingMore={loadingMore}
                empty={
                  <EmptyState
                    icon={Storefront}
                    title="No suppliers found"
                    description={
                      search
                        ? "No results for the applied filter."
                        : 'Click "New" to add the first one.'
                    }
                    action={!search ? { label: "New Supplier", onClick: openCreate } : undefined}
                  />
                }
              />
            )}
          </div>
        </Card>
      </div>

      <Modal open={modalOpen} onClose={closeModal}>
        <SupplierForm
          supplier={selected}
          onSave={handleSave}
          onCancel={closeModal}
        />
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        title="Remove supplier"
        description={`Are you sure you want to remove "${toDelete?.description}"? This action cannot be undone.`}
        confirmLabel="Remove"
        loading={deletingId !== null}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
