"use client";

import { useState, type ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";
import { Plus, Trash, MagnifyingGlass, Power } from "@phosphor-icons/react";
import Button from "@/ui/Button";
import Card from "@/ui/Card";
import Modal from "@/ui/Modal";
import Input from "@/ui/Input";
import EmptyState from "@/ui/EmptyState";
import DataTable, { type DataTableColumn } from "@/ui/DataTable";
import ConfirmModal from "@/ui/ConfirmModal";
import ActiveBadge from "@/ui/ActiveBadge";
import { toast } from "@/lib/toast";

export interface CrudResource {
  id: number;
  description: string;
  erp_code?: string | null;
  active: boolean;
}

export interface CrudListState<T> {
  items: T[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  reload: () => void;
  loadMore: () => void;
}

export type CrudUpdatePayload<F> = F | { active: boolean };

export interface CrudMutations<F> {
  create: { mutateAsync: (data: F) => Promise<unknown> };
  update: { mutateAsync: (input: { id: number; data: CrudUpdatePayload<F> }) => Promise<unknown> };
  remove: { mutateAsync: (id: number) => Promise<unknown> };
}

export interface CrudMessages {
  created: string;
  updated: string;
  removed: string;
  activated: string;
  deactivated: string;
  statusError: string;
  removeError: string;
  deleteTitle: string;
  emptyTitle: string;
}

interface Props<T extends CrudResource, F> {
  title: string;
  newLabel: string;
  searchPlaceholder: string;
  icon: Icon;
  messages: CrudMessages;
  list: CrudListState<T>;
  mutations: CrudMutations<F>;
  renderForm: (item: T | undefined, onSave: (data: F) => Promise<void>, onCancel: () => void) => ReactNode;
  matchesSearch?: (item: T, term: string) => boolean;
  extraColumns?: DataTableColumn<T>[];
}

function defaultMatches(item: CrudResource, term: string): boolean {
  const needle = term.toLowerCase();
  return (
    item.description.toLowerCase().includes(needle) ||
    (item.erp_code ?? "").toLowerCase().includes(needle)
  );
}

export default function CrudResourcePage<T extends CrudResource, F>({
  title,
  newLabel,
  searchPlaceholder,
  icon,
  messages,
  list,
  mutations,
  renderForm,
  matchesSearch,
  extraColumns = [],
}: Props<T, F>) {
  const { items, loading, loadingMore, hasMore, error, reload, loadMore } = list;
  const { create, update, remove } = mutations;

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<T | undefined>();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<T | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  function openCreate() {
    setSelected(undefined);
    setModalOpen(true);
  }

  function openEdit(item: T) {
    setSelected(item);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelected(undefined);
  }

  async function handleSave(data: F) {
    if (selected) {
      await update.mutateAsync({ id: selected.id, data });
      toast.success(messages.updated);
    } else {
      await create.mutateAsync(data);
      toast.success(messages.created);
    }
    closeModal();
  }

  async function handleToggleActive(item: T) {
    setTogglingId(item.id);
    try {
      await update.mutateAsync({ id: item.id, data: { active: !item.active } });
      toast.success(item.active ? messages.deactivated : messages.activated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : messages.statusError);
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    setDeletingId(toDelete.id);
    try {
      await remove.mutateAsync(toDelete.id);
      toast.success(messages.removed);
      setToDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : messages.removeError);
    } finally {
      setDeletingId(null);
    }
  }

  const matcher = matchesSearch ?? defaultMatches;
  const filtered = items.filter((item) => matcher(item, search));

  const columns: DataTableColumn<T>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      sortAccessor: (item) => item.id,
      render: (item) => <span className="text-small text-app-text-subtle">{item.id}</span>,
    },
    {
      key: "description",
      header: "Description",
      sortable: true,
      sortAccessor: (item) => item.description,
      render: (item) => <span className="font-medium text-app-text">{item.description}</span>,
    },
    ...extraColumns,
    {
      key: "erp_code",
      header: "ERP Code",
      sortable: true,
      sortAccessor: (item) => item.erp_code ?? "",
      render: (item) => (
        <span className="text-app-text-muted">
          {item.erp_code ?? <span className="text-app-text-subtle">—</span>}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortAccessor: (item) => (item.active ? 1 : 0),
      render: (item) => <ActiveBadge active={item.active} />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(item);
            }}
            disabled={togglingId === item.id}
            className={[
              "p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-40",
              item.active
                ? "text-app-text-muted hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                : "text-app-text-muted hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10",
            ].join(" ")}
            aria-label={item.active ? "Deactivate" : "Activate"}
            title={item.active ? "Deactivate" : "Activate"}
          >
            <Power size={15} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setToDelete(item);
            }}
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
            <h1 className="text-feature-title text-app-text">{title}</h1>
            <Button variant="dark" size="sm" onClick={openCreate}>
              <Plus size={14} />
              New
            </Button>
          </div>

          <div className="px-5 pb-4 border-t border-app-border pt-4">
            <Input
              label=""
              placeholder={searchPlaceholder}
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
                rows={filtered}
                onRowClick={openEdit}
                keyExtractor={(item) => item.id}
                loading={loading}
                onLoadMore={search ? undefined : loadMore}
                hasMore={search ? false : hasMore}
                loadingMore={loadingMore}
                empty={
                  <EmptyState
                    icon={icon}
                    title={messages.emptyTitle}
                    description={
                      search ? "No results for the applied filter." : 'Click "New" to add the first one.'
                    }
                    action={!search ? { label: newLabel, onClick: openCreate } : undefined}
                  />
                }
              />
            )}
          </div>
        </Card>
      </div>

      <Modal open={modalOpen} onClose={closeModal}>
        {renderForm(selected, handleSave, closeModal)}
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        title={messages.deleteTitle}
        description={`Are you sure you want to remove "${toDelete?.description}"? This action cannot be undone.`}
        confirmLabel="Remove"
        loading={deletingId !== null}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
