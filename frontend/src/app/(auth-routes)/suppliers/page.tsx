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
import BadgeAtivo from "@/ui/BadgeAtivo";
import { toast } from "@/lib/toast";
import { formatarCpfCnpj } from "@/lib/formatters";
import FormFornecedor from "@/features/fornecedor/components/FormFornecedor";
import {
  listarFornecedoresApi,
  criarFornecedorApi,
  atualizarFornecedorApi,
  deletarFornecedorApi,
} from "@/features/fornecedor/fornecedor.api";
import type {
  Fornecedor,
  FornecedorFormData,
} from "@/features/fornecedor/fornecedor.types";

export default function FornecedorPage() {
  const {
    items: fornecedores,
    setItems: setFornecedores,
    loading,
    loadingMore,
    hasMore,
    erro,
    recarregar,
    carregarMais,
  } = usePaginatedList<Fornecedor>(
    (page, perPage) => listarFornecedoresApi(page, perPage),
    { mensagemErro: "Não foi possível carregar os fornecedores." }
  );

  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [selecionado, setSelecionado] = useState<Fornecedor | undefined>();
  const [deletandoId, setDeletandoId] = useState<number | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Fornecedor | null>(null);
  const [toggleandoId, setToggleandoId] = useState<number | null>(null);

  function abrirNovo() {
    setSelecionado(undefined);
    setModalAberto(true);
  }

  function abrirEdicao(f: Fornecedor) {
    setSelecionado(f);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setSelecionado(undefined);
  }

  async function handleSalvar(dados: FornecedorFormData) {
    if (selecionado) {
      const { fornecedor } = await atualizarFornecedorApi(selecionado.id, dados);
      setFornecedores((prev) =>
        prev.map((f) => (f.id === fornecedor.id ? fornecedor : f))
      );
      toast.success("Fornecedor atualizado.");
    } else {
      const { fornecedor } = await criarFornecedorApi(dados);
      setFornecedores((prev) =>
        [...prev, fornecedor].sort((a, b) => a.descricao.localeCompare(b.descricao))
      );
      toast.success("Fornecedor criado.");
    }
    fecharModal();
  }

  async function handleToggleAtivo(f: Fornecedor) {
    setToggleandoId(f.id);
    try {
      const { fornecedor } = await atualizarFornecedorApi(f.id, { ativo: !f.ativo });
      setFornecedores((prev) => prev.map((x) => (x.id === fornecedor.id ? fornecedor : x)));
      toast.success(f.ativo ? "Fornecedor inativado." : "Fornecedor ativado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível alterar o status.");
    } finally {
      setToggleandoId(null);
    }
  }

  async function handleDeletar() {
    if (!paraExcluir) return;
    setDeletandoId(paraExcluir.id);
    try {
      await deletarFornecedorApi(paraExcluir.id);
      setFornecedores((prev) => prev.filter((f) => f.id !== paraExcluir.id));
      toast.success("Fornecedor removido.");
      setParaExcluir(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível remover o fornecedor.");
    } finally {
      setDeletandoId(null);
    }
  }

  const fornecedoresFiltrados = fornecedores.filter((f) => {
    const q = busca.toLowerCase();
    return (
      f.descricao.toLowerCase().includes(q) ||
      f.cpf_cnpj.toLowerCase().includes(q) ||
      (f.codigo_erp ?? "").toLowerCase().includes(q)
    );
  });

  const columns: DataTableColumn<Fornecedor>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      sortAccessor: (f) => f.id,
      render: (f) => <span className="text-small text-app-text-subtle">{f.id}</span>,
    },
    {
      key: "descricao",
      header: "Descrição",
      sortable: true,
      sortAccessor: (f) => f.descricao,
      render: (f) => <span className="font-medium text-app-text">{f.descricao}</span>,
    },
    {
      key: "cpf_cnpj",
      header: "CPF / CNPJ",
      sortable: true,
      sortAccessor: (f) => f.cpf_cnpj,
      render: (f) => (
        <span className="text-app-text-muted tabular-nums">{formatarCpfCnpj(f.cpf_cnpj)}</span>
      ),
    },
    {
      key: "tipo_pessoa",
      header: "Tipo",
      sortable: true,
      sortAccessor: (f) => f.tipo_pessoa,
      render: (f) => (
        <span className="text-app-text-muted">{f.tipo_pessoa === "J" ? "Jurídica" : "Física"}</span>
      ),
    },
    {
      key: "codigo_erp",
      header: "Código ERP",
      sortable: true,
      sortAccessor: (f) => f.codigo_erp,
      render: (f) => (
        <span className="text-app-text-muted">
          {f.codigo_erp ?? <span className="text-app-text-subtle">—</span>}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortAccessor: (f) => (f.ativo ? 1 : 0),
      render: (f) => <BadgeAtivo ativo={f.ativo} />,
    },
    {
      key: "acoes",
      header: "",
      align: "right",
      render: (f) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleAtivo(f); }}
            disabled={toggleandoId === f.id}
            className={[
              "p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-40",
              f.ativo
                ? "text-app-text-muted hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                : "text-app-text-muted hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10",
            ].join(" ")}
            aria-label={f.ativo ? "Inativar" : "Ativar"}
            title={f.ativo ? "Inativar" : "Ativar"}
          >
            <Power size={15} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setParaExcluir(f); }}
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
            <h1 className="text-feature-title text-app-text">Fornecedores</h1>
            <Button variant="dark" size="sm" onClick={abrirNovo}>
              <Plus size={14} />
              Novo
            </Button>
          </div>

          <div className="px-5 pb-4 border-t border-app-border pt-4">
            <Input
              label=""
              placeholder="Buscar por descrição, CPF/CNPJ ou código ERP…"
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
                rows={fornecedoresFiltrados}
                onRowClick={abrirEdicao}
                keyExtractor={(f) => f.id}
                loading={loading}
                onLoadMore={busca ? undefined : carregarMais}
                hasMore={busca ? false : hasMore}
                loadingMore={loadingMore}
                empty={
                  <EmptyState
                    icon={Storefront}
                    title="Nenhum fornecedor encontrado"
                    description={
                      busca
                        ? "Nenhum resultado para o filtro aplicado."
                        : 'Clique em "Novo" para cadastrar o primeiro.'
                    }
                    action={!busca ? { label: "Novo Fornecedor", onClick: abrirNovo } : undefined}
                  />
                }
              />
            )}
          </div>
        </Card>
      </div>

      <Modal open={modalAberto} onClose={fecharModal}>
        <FormFornecedor
          fornecedor={selecionado}
          onSalvar={handleSalvar}
          onCancelar={fecharModal}
        />
      </Modal>

      <ConfirmModal
        open={!!paraExcluir}
        title="Remover fornecedor"
        description={`Tem certeza que deseja remover "${paraExcluir?.descricao}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        loading={deletandoId !== null}
        onConfirm={handleDeletar}
        onCancel={() => setParaExcluir(null)}
      />
    </>
  );
}
