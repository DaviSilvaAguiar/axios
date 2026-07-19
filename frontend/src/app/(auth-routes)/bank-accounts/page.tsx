"use client";

import { useState } from "react";
import { usePaginatedList } from "@/lib/usePaginatedList";
import {
  Plus,
  Trash,
  Bank,
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
import FormContaBancaria from "@/features/conta-bancaria/components/FormContaBancaria";
import {
  listarContasBancariasApi,
  criarContaBancariaApi,
  atualizarContaBancariaApi,
  deletarContaBancariaApi,
} from "@/features/conta-bancaria/conta-bancaria.api";
import type {
  ContaBancaria,
  ContaBancariaFormData,
} from "@/features/conta-bancaria/conta-bancaria.types";

export default function ContaBancariaPage() {
  const {
    items: contas,
    setItems: setContas,
    loading,
    loadingMore,
    hasMore,
    erro,
    recarregar,
    carregarMais,
  } = usePaginatedList<ContaBancaria>(
    (page, perPage) => listarContasBancariasApi(page, perPage),
    { mensagemErro: "Não foi possível carregar as contas bancárias." }
  );

  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [selecionada, setSelecionada] = useState<ContaBancaria | undefined>();
  const [deletandoId, setDeletandoId] = useState<number | null>(null);
  const [paraExcluir, setParaExcluir] = useState<ContaBancaria | null>(null);
  const [toggleandoId, setToglandoId] = useState<number | null>(null);

  function abrirNovo() {
    setSelecionada(undefined);
    setModalAberto(true);
  }

  function abrirEdicao(conta: ContaBancaria) {
    setSelecionada(conta);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setSelecionada(undefined);
  }

  async function handleSalvar(dados: ContaBancariaFormData) {
    if (selecionada) {
      const { conta_bancaria } = await atualizarContaBancariaApi(selecionada.id, dados);
      setContas((prev) =>
        prev.map((c) => (c.id === conta_bancaria.id ? conta_bancaria : c))
      );
      toast.success("Conta bancária atualizada.");
    } else {
      const { conta_bancaria } = await criarContaBancariaApi(dados);
      setContas((prev) =>
        [...prev, conta_bancaria].sort((a, b) => a.descricao.localeCompare(b.descricao))
      );
      toast.success("Conta bancária criada.");
    }
    fecharModal();
  }

  async function handleToggleAtivo(c: ContaBancaria) {
    setToglandoId(c.id);
    try {
      const { conta_bancaria } = await atualizarContaBancariaApi(c.id, { ativo: !c.ativo });
      setContas((prev) => prev.map((x) => (x.id === conta_bancaria.id ? conta_bancaria : x)));
      toast.success(c.ativo ? "Conta inativada." : "Conta ativada.");
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
      await deletarContaBancariaApi(paraExcluir.id);
      setContas((prev) => prev.filter((c) => c.id !== paraExcluir.id));
      toast.success("Conta bancária removida.");
      setParaExcluir(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível remover a conta.");
    } finally {
      setDeletandoId(null);
    }
  }

  const contasFiltradas = contas.filter(
    (c) =>
      c.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      (c.codigo_erp ?? "").toLowerCase().includes(busca.toLowerCase())
  );

  const columns: DataTableColumn<ContaBancaria>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      sortAccessor: (c) => c.id,
      render: (c) => <span className="text-small text-app-text-subtle">{c.id}</span>,
    },
    {
      key: "descricao",
      header: "Descrição",
      sortable: true,
      sortAccessor: (c) => c.descricao,
      render: (c) => <span className="font-medium text-app-text">{c.descricao}</span>,
    },
    {
      key: "codigo_erp",
      header: "Código ERP",
      sortable: true,
      sortAccessor: (c) => c.codigo_erp,
      render: (c) => (
        <span className="text-app-text-muted">
          {c.codigo_erp ?? <span className="text-app-text-subtle">—</span>}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortAccessor: (c) => (c.ativo ? 1 : 0),
      render: (c) => <BadgeAtivo ativo={c.ativo} />,
    },
    {
      key: "acoes",
      header: "",
      align: "right",
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleAtivo(c); }}
            disabled={toggleandoId === c.id}
            className={[
              "p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-40",
              c.ativo
                ? "text-app-text-muted hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                : "text-app-text-muted hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10",
            ].join(" ")}
            aria-label={c.ativo ? "Inativar" : "Ativar"}
            title={c.ativo ? "Inativar" : "Ativar"}
          >
            <Power size={15} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setParaExcluir(c); }}
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
            <h1 className="text-feature-title text-app-text">Contas Bancárias</h1>
            <Button variant="dark" size="sm" onClick={abrirNovo}>
              <Plus size={14} />
              Nova
            </Button>
          </div>

          <div className="px-5 pb-4 border-t border-app-border pt-4">
            <Input
              label=""
              placeholder="Buscar por descrição ou código ERP…"
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
                rows={contasFiltradas}
                onRowClick={abrirEdicao}
                keyExtractor={(c) => c.id}
                loading={loading}
                onLoadMore={busca ? undefined : carregarMais}
                hasMore={busca ? false : hasMore}
                loadingMore={loadingMore}
                empty={
                  <EmptyState
                    icon={Bank}
                    title="Nenhuma conta bancária encontrada"
                    description={
                      busca
                        ? "Nenhum resultado para o filtro aplicado."
                        : 'Clique em "Nova" para cadastrar a primeira.'
                    }
                    action={!busca ? { label: "Nova Conta", onClick: abrirNovo } : undefined}
                  />
                }
              />
            )}
          </div>
        </Card>

      </div>

      <Modal open={modalAberto} onClose={fecharModal}>
        <FormContaBancaria
          contaBancaria={selecionada}
          onSalvar={handleSalvar}
          onCancelar={fecharModal}
        />
      </Modal>

      <ConfirmModal
        open={!!paraExcluir}
        title="Remover conta bancária"
        description={`Tem certeza que deseja remover "${paraExcluir?.descricao}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        loading={deletandoId !== null}
        onConfirm={handleDeletar}
        onCancel={() => setParaExcluir(null)}
      />
    </>
  );
}
