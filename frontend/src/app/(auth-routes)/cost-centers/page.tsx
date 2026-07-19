"use client";

import { useState } from "react";
import { usePaginatedList } from "@/lib/usePaginatedList";
import {
  Plus,
  Trash,
  Buildings,
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
import CostCenterForm from "@/features/cost-center/components/CostCenterForm";
import {
  listCentrosDeCustoApi,
  createCostCenterApi,
  updateCostCenterApi,
  deleteCostCenterApi,
} from "@/features/cost-center/cost-center.api";
import type { CostCenter, CostCenterFormData } from "@/features/cost-center/cost-center.types";

export default function CostCentersPage() {
  const {
    items: costCenters,
    setItems: setCostCenters,
    loading,
    loadingMore,
    hasMore,
    error: error,
    reload: reload,
    loadMore: loadMore,
  } = usePaginatedList<CostCenter>(
    (page, perPage) => listCentrosDeCustoApi(page, perPage),
    { errorMessage: "Could not load the cost centers." }
  );

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<CostCenter | undefined>();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<CostCenter | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  function openCreate() {
    setSelected(undefined);
    setModalOpen(true);
  }

  function openEdit(costCenter: CostCenter) {
    setSelected(costCenter);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelected(undefined);
  }

  async function handleSave(data: CostCenterFormData) {
    if (selected) {
      const { cost_center } = await updateCostCenterApi(selected.id, data);
      setCostCenters((prev) => prev.map((c) => (c.id === cost_center.id ? cost_center : c)));
      toast.success("Cost center updated.");
    } else {
      const { cost_center } = await createCostCenterApi(data);
      setCostCenters((prev) =>
        [...prev, cost_center].sort((a, b) => a.description.localeCompare(b.description))
      );
      toast.success("Cost center created.");
    }
    closeModal();
  }

  async function handleToggleActive(c: CostCenter) {
    setTogglingId(c.id);
    try {
      const { cost_center } = await updateCostCenterApi(c.id, { active: !c.active });
      setCostCenters((prev) => prev.map((x) => (x.id === cost_center.id ? cost_center : x)));
      toast.success(c.active ? "Cost center deactivated." : "Cost center activated.");
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
      await deleteCostCenterApi(toDelete.id);
      setCostCenters((prev) => prev.filter((c) => c.id !== toDelete.id));
      toast.success("Cost center removed.");
      setToDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove the cost center.");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredCostCenters = costCenters.filter(
    (c) =>
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      (c.erp_code ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const columns: DataTableColumn<CostCenter>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      sortAccessor: (c) => c.id,
      render: (c) => <span className="text-small text-app-text-subtle">{c.id}</span>,
    },
    {
      key: "description",
      header: "Description",
      sortable: true,
      sortAccessor: (c) => c.description,
      render: (c) => <span className="font-medium text-app-text">{c.description}</span>,
    },
    {
      key: "erp_code",
      header: "ERP Code",
      sortable: true,
      sortAccessor: (c) => c.erp_code,
      render: (c) => (
        <span className="text-app-text-muted">
          {c.erp_code ?? <span className="text-app-text-subtle">—</span>}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortAccessor: (c) => (c.active ? 1 : 0),
      render: (c) => <ActiveBadge ativo={c.active} />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleActive(c); }}
            disabled={togglingId === c.id}
            className={[
              "p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-40",
              c.active
                ? "text-app-text-muted hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                : "text-app-text-muted hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10",
            ].join(" ")}
            aria-label={c.active ? "Deactivate" : "Activate"}
            title={c.active ? "Deactivate" : "Activate"}
          >
            <Power size={15} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setToDelete(c); }}
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
            <h1 className="text-feature-title text-app-text">Cost Centers</h1>
            <Button variant="dark" size="sm" onClick={openCreate}>
              <Plus size={14} />
              New
            </Button>
          </div>

          <div className="px-5 pb-4 border-t border-app-border pt-4">
            <Input
              label=""
              placeholder="Search by description or ERP code…"
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
                rows={filteredCostCenters}
                onRowClick={openEdit}
                keyExtractor={(c) => c.id}
                loading={loading}
                onLoadMore={search ? undefined : loadMore}
                hasMore={search ? false : hasMore}
                loadingMore={loadingMore}
                empty={
                  <EmptyState
                    icon={Buildings}
                    title="No cost centers found"
                    description={
                      search
                        ? "No results for the applied filter."
                        : 'Click "New" to add the first one.'
                    }
                    action={!search ? { label: "New Cost Center", onClick: openCreate } : undefined}
                  />
                }
              />
            )}
          </div>
        </Card>

      </div>

      <Modal open={modalOpen} onClose={closeModal}>
        <CostCenterForm
          costCenter={selected}
          onSave={handleSave}
          onCancel={closeModal}
        />
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        title="Remove cost center"
        description={`Are you sure you want to remove "${toDelete?.description}"? This action cannot be undone.`}
        confirmLabel="Remove"
        loading={deletingId !== null}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
