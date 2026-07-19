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
import BadgeAtivo from "@/ui/BadgeAtivo";
import { toast } from "@/lib/toast";
import { useAuth } from "@/contexts/AuthContext";
import FormUsuario from "@/features/usuario/components/FormUsuario";
import {
  listarUsuariosApi,
  criarUsuarioApi,
  atualizarUsuarioApi,
  deletarUsuarioApi,
} from "@/features/usuario/usuario.api";
import type {
  Usuario,
  CriarUsuarioFormData,
  EditarUsuarioFormData,
} from "@/features/usuario/usuario.types";

const PERFIL_LABEL: Record<number, string> = {
  1: "Admin",
  2: "Gestor",
  3: "Prestador",
};

const PERFIL_CLASS: Record<number, string> = {
  1: "bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:ring-blue-500/30",
  2: "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-500/30",
  3: "bg-app-surface-raised text-app-text-muted ring-app-border",
};


function BadgePerfil({ perfil }: { perfil: number }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-small ring-1 font-medium ${PERFIL_CLASS[perfil] ?? PERFIL_CLASS[3]}`}
    >
      {PERFIL_LABEL[perfil] ?? "—"}
    </span>
  );
}

export default function UsuariosPage() {
  const { usuario: usuarioLogado } = useAuth();
  const isAdmin = usuarioLogado?.perfil === 1;

  const {
    items: usuarios,
    setItems: setUsuarios,
    loading,
    loadingMore,
    hasMore,
    erro,
    recarregar,
    carregarMais,
  } = usePaginatedList<Usuario>(
    (page, perPage) => listarUsuariosApi(page, perPage),
    { mensagemErro: "Não foi possível carregar os usuários." }
  );

  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [selecionado, setSelecionado] = useState<Usuario | undefined>();
  const [paraExcluir, setParaExcluir] = useState<Usuario | null>(null);
  const [deletandoId, setDeletandoId] = useState<number | null>(null);
  const [toggleandoId, setToglandoId] = useState<number | null>(null);

  function abrirNovo() {
    setSelecionado(undefined);
    setModalAberto(true);
  }

  function abrirEdicao(u: Usuario) {
    setSelecionado(u);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setSelecionado(undefined);
  }

  async function handleSalvar(dados: CriarUsuarioFormData | EditarUsuarioFormData) {
    if (selecionado) {
      const { usuario } = await atualizarUsuarioApi(selecionado.id, dados as EditarUsuarioFormData);
      setUsuarios((prev) => prev.map((u) => (u.id === usuario.id ? usuario : u)));
      toast.success("Usuário atualizado.");
    } else {
      const { usuario } = await criarUsuarioApi(dados as CriarUsuarioFormData);
      setUsuarios((prev) => [...prev, usuario].sort((a, b) => a.nome.localeCompare(b.nome)));
      toast.success("Usuário criado.");
    }
    fecharModal();
  }

  async function handleToggleAtivo(u: Usuario) {
    setToglandoId(u.id);
    try {
      const { usuario: atualizado } = await atualizarUsuarioApi(u.id, {
        perfil: u.perfil,
        nome: u.nome,
        email: u.email,
        ativo: !u.ativo,
        codigo_credor_erp: u.codigo_credor_erp ?? undefined,
      });
      setUsuarios((prev) => prev.map((x) => (x.id === atualizado.id ? atualizado : x)));
      toast.success(u.ativo ? "Usuário inativado." : "Usuário ativado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível alterar o status.");
    } finally {
      setToglandoId(null);
    }
  }

  async function handleDeletar() {
    if (!paraExcluir) return;
    setDeletandoId(paraExcluir.id);
    try {
      await deletarUsuarioApi(paraExcluir.id);
      setUsuarios((prev) => prev.filter((u) => u.id !== paraExcluir.id));
      toast.success("Usuário removido.");
      setParaExcluir(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível remover o usuário.");
    } finally {
      setDeletandoId(null);
    }
  }

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase())
  );

  const columns: DataTableColumn<Usuario>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      sortAccessor: (u) => u.id,
      render: (u) => <span className="text-small text-app-text-subtle">{u.id}</span>,
    },
    {
      key: "nome",
      header: "Nome",
      sortable: true,
      sortAccessor: (u) => u.nome,
      render: (u) => <span className="font-medium text-app-text">{u.nome}</span>,
    },
    {
      key: "email",
      header: "E-mail",
      sortable: true,
      sortAccessor: (u) => u.email,
      render: (u) => <span className="text-app-text-muted">{u.email}</span>,
    },
    {
      key: "perfil",
      header: "Perfil",
      sortable: true,
      sortAccessor: (u) => u.perfil,
      render: (u) => <BadgePerfil perfil={u.perfil} />,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortAccessor: (u) => (u.ativo ? 1 : 0),
      render: (u) => <BadgeAtivo ativo={u.ativo} />,
    },
    {
      key: "acoes",
      header: "",
      align: "right",
      render: (u) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleAtivo(u);
            }}
            disabled={toggleandoId === u.id}
            className={[
              "p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-40",
              u.ativo
                ? "text-app-text-muted hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                : "text-app-text-muted hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10",
            ].join(" ")}
            aria-label={u.ativo ? "Inativar" : "Ativar"}
            title={u.ativo ? "Inativar" : "Ativar"}
          >
            <Power size={15} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setParaExcluir(u);
            }}
            className="p-2 rounded-lg text-app-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
            aria-label="Remover"
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
            <h1 className="text-feature-title text-app-text">Usuários</h1>
            {isAdmin && (
              <Button variant="dark" size="sm" onClick={abrirNovo}>
                <Plus size={14} />
                Novo
              </Button>
            )}
          </div>

          <div className="px-5 pb-4 border-t border-app-border pt-4">
            <Input
              label=""
              placeholder="Buscar por nome ou e-mail…"
              icon={<MagnifyingGlass size={16} />}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="!py-3 text-body-sm"
            />
          </div>
        </Card>

        <Card>
          <div className="p-5">
            {erro ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4">
                <p className="text-body-sm text-red-700">{erro}</p>
                <button
                  onClick={() => recarregar()}
                  className="mt-2 text-caption font-semibold text-brand hover:underline"
                >
                  Tentar novamente
                </button>
              </div>
            ) : (
              <DataTable
                columns={columns}
                rows={usuariosFiltrados}
                onRowClick={abrirEdicao}
                keyExtractor={(u) => u.id}
                loading={loading}
                onLoadMore={busca ? undefined : carregarMais}
                hasMore={busca ? false : hasMore}
                loadingMore={loadingMore}
                empty={
                  <EmptyState
                    icon={Users}
                    title="Nenhum usuário encontrado"
                    description={
                      busca
                        ? "Nenhum resultado para o filtro aplicado."
                        : 'Clique em "Novo" para cadastrar o primeiro usuário.'
                    }
                    action={!busca && isAdmin ? { label: "Novo Usuário", onClick: abrirNovo } : undefined}
                  />
                }
              />
            )}
          </div>
        </Card>
      </div>

      <Modal open={modalAberto} onClose={fecharModal}>
        <FormUsuario
          usuario={selecionado}
          onSalvar={handleSalvar}
          onCancelar={fecharModal}
        />
      </Modal>

      <ConfirmModal
        open={!!paraExcluir}
        title="Remover usuário"
        description={`Tem certeza que deseja remover "${paraExcluir?.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        loading={deletandoId !== null}
        onConfirm={handleDeletar}
        onCancel={() => setParaExcluir(null)}
      />
    </>
  );
}
