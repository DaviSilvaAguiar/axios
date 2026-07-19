"use client";

import { useState } from "react";
import { usePaginatedList } from "@/lib/usePaginatedList";
import {
  Plus,
  Trash,
  Users,
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
import { useAuth } from "@/contexts/AuthContext";
import UserForm from "@/features/user/components/UserForm";
import {
  listUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
} from "@/features/user/user.api";
import type {
  User,
  CriarUserFormData,
  EditarUserFormData,
} from "@/features/user/user.types";

const ROLE_LABEL: Record<number, string> = {
  1: "Admin",
  2: "Auditor",
  3: "Provider",
};

const ROLE_CLASS: Record<number, string> = {
  1: "bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:ring-blue-500/30",
  2: "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-500/30",
  3: "bg-app-surface-raised text-app-text-muted ring-app-border",
};


function RoleBadge({ role }: { role: number }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-small ring-1 font-medium ${ROLE_CLASS[role] ?? ROLE_CLASS[3]}`}
    >
      {ROLE_LABEL[role] ?? "—"}
    </span>
  );
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 1;

  const {
    items: users,
    setItems: setUsers,
    loading,
    loadingMore,
    hasMore,
    error: error,
    reload: reload,
    loadMore: loadMore,
  } = usePaginatedList<User>(
    (page, perPage) => listUsersApi(page, perPage),
    { errorMessage: "Could not load the users." }
  );

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<User | undefined>();
  const [toDelete, setToDelete] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  function openCreate() {
    setSelected(undefined);
    setModalOpen(true);
  }

  function openEdit(u: User) {
    setSelected(u);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelected(undefined);
  }

  async function handleSave(data: CriarUserFormData | EditarUserFormData) {
    if (selected) {
      const { user } = await updateUserApi(selected.id, data as EditarUserFormData);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
      toast.success("User updated.");
    } else {
      const { user } = await createUserApi(data as CriarUserFormData);
      setUsers((prev) => [...prev, user].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success("User created.");
    }
    closeModal();
  }

  async function handleToggleActive(u: User) {
    setTogglingId(u.id);
    try {
      const { user: updated } = await updateUserApi(u.id, {
        role: u.role,
        name: u.name,
        email: u.email,
        active: !u.active,
        erp_code: u.erp_code ?? undefined,
      });
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      toast.success(u.active ? "User deactivated." : "User activated.");
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
      await deleteUserApi(toDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== toDelete.id));
      toast.success("User removed.");
      setToDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove the user.");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns: DataTableColumn<User>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      sortAccessor: (u) => u.id,
      render: (u) => <span className="text-small text-app-text-subtle">{u.id}</span>,
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      sortAccessor: (u) => u.name,
      render: (u) => <span className="font-medium text-app-text">{u.name}</span>,
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      sortAccessor: (u) => u.email,
      render: (u) => <span className="text-app-text-muted">{u.email}</span>,
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      sortAccessor: (u) => u.role,
      render: (u) => <RoleBadge role={u.role} />,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortAccessor: (u) => (u.active ? 1 : 0),
      render: (u) => <ActiveBadge ativo={u.active} />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (u) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(u);
            }}
            disabled={togglingId === u.id}
            className={[
              "p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-40",
              u.active
                ? "text-app-text-muted hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                : "text-app-text-muted hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10",
            ].join(" ")}
            aria-label={u.active ? "Deactivate" : "Activate"}
            title={u.active ? "Deactivate" : "Activate"}
          >
            <Power size={15} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setToDelete(u);
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
            <h1 className="text-feature-title text-app-text">Users</h1>
            {isAdmin && (
              <Button variant="dark" size="sm" onClick={openCreate}>
                <Plus size={14} />
                New
              </Button>
            )}
          </div>

          <div className="px-5 pb-4 border-t border-app-border pt-4">
            <Input
              label=""
              placeholder="Search by name or email…"
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
                rows={filteredUsers}
                onRowClick={openEdit}
                keyExtractor={(u) => u.id}
                loading={loading}
                onLoadMore={search ? undefined : loadMore}
                hasMore={search ? false : hasMore}
                loadingMore={loadingMore}
                empty={
                  <EmptyState
                    icon={Users}
                    title="No users found"
                    description={
                      search
                        ? "No results for the applied filter."
                        : 'Click "New" to add the first user.'
                    }
                    action={!search && isAdmin ? { label: "New User", onClick: openCreate } : undefined}
                  />
                }
              />
            )}
          </div>
        </Card>
      </div>

      <Modal open={modalOpen} onClose={closeModal}>
        <UserForm
          user={selected}
          onSave={handleSave}
          onCancel={closeModal}
        />
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        title="Remove user"
        description={`Are you sure you want to remove "${toDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Remove"
        loading={deletingId !== null}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
