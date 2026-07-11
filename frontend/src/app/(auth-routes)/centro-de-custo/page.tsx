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
import BadgeAtivo from "@/ui/BadgeAtivo";
import { toast } from "@/lib/toast";
import FormCentroDeCusto from "@/features/centro-de-custo/components/FormCentroDeCusto";
import {
  listarCentrosDeCustoApi,
  criarCentroDeCustoApi,
  atualizarCentroDeCustoApi,
  deletarCentroDeCustoApi,
} from "@/features/centro-de-custo/centro-de-custo.api";
import type { CentroDeCusto, CentroDeCustoFormData } from "@/features/centro-de-custo/centro-de-custo.types";

export default function CentroDeCustoPage() {
  const {
    items: centros,
    setItems: setCentros,
    loading,
    loadingMore,
    hasMore,
    erro,
    recarregar,
    carregarMais,
  } = usePaginatedList<CentroDeCusto>(
    (page, perPage) => listarCentrosDeCustoApi(page, perPage),
    { mensagemErro: "Não foi possível carregar os centros de custo." }
  );

  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [selecionado, setSelecionado] = useState<CentroDeCusto | undefined>();
  const [deletandoId, setDeletandoId] = useState<number | null>(null);
  const [paraExcluir, setParaExcluir] = useState<CentroDeCusto | null>(null);
  const [toggleandoId, setToglandoId] = useState<number | null>(null);

  function abrirNovo() {
    setSelecionado(undefined);
    setModalAberto(true);
  }

  function abrirEdicao(centro: CentroDeCusto) {
    setSelecionado(centro);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setSelecionado(undefined);
  }

  async function handleSalvar(dados: CentroDeCustoFormData) {
    if (selecionado) {
      const { centro_custo } = await atualizarCentroDeCustoApi(selecionado.id, dados);
      setCentros((prev) => prev.map((c) => (c.id === centro_custo.id ? centro_custo : c)));
      toast.success("Centro de custo atualizado.");
    } else {
      const { centro_custo } = await criarCentroDeCustoApi(dados);
      setCentros((prev) =>
        [...prev, centro_custo].sort((a, b) => a.descricao.localeCompare(b.descricao))
      );
      toast.success("Centro de custo criado.");
    }
    fecharModal();
  }

  async function handleToggleAtivo(c: CentroDeCusto) {
    setToglandoId(c.id);
    try {
      const { centro_custo } = await atualizarCentroDeCustoApi(c.id, { ativo: !c.ativo });
      setCentros((prev) => prev.map((x) => (x.id === centro_custo.id ? centro_custo : x)));
      toast.success(c.ativo ? "Centro de custo inativado." : "Centro de custo ativado.");
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
      await deletarCentroDeCustoApi(paraExcluir.id);
      setCentros((prev) => prev.filter((c) => c.id !== paraExcluir.id));
      toast.success("Centro de custo removido.");
      setParaExcluir(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível remover o centro de custo.");
    } finally {
      setDeletandoId(null);
    }
  }

  const centrosFiltrados = centros.filter(
    (c) =>
      c.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      (c.codigo_cc_erp ?? "").toLowerCase().includes(busca.toLowerCase())
  );

  const columns: DataTableColumn<CentroDeCusto>[] = [
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
      key: "codigo_cc_erp",
      header: "Código ERP",
      sortable: true,
      sortAccessor: (c) => c.codigo_cc_erp,
      render: (c) => (
        <span className="text-app-text-muted">
          {c.codigo_cc_erp ?? <span className="text-app-text-subtle">—</span>}
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
            <h1 className="text-feature-title text-app-text">Centros de Custo</h1>
            <Button variant="dark" size="sm" onClick={abrirNovo}>
              <Plus size={14} />
              Novo
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
                rows={centrosFiltrados}
                onRowClick={abrirEdicao}
                keyExtractor={(c) => c.id}
                loading={loading}
                onLoadMore={busca ? undefined : carregarMais}
                hasMore={busca ? false : hasMore}
                loadingMore={loadingMore}
                empty={
                  <EmptyState
                    icon={Buildings}
                    title="Nenhum centro de custo encontrado"
                    description={
                      busca
                        ? "Nenhum resultado para o filtro aplicado."
                        : 'Clique em "Novo" para cadastrar o primeiro.'
                    }
                    action={!busca ? { label: "Novo Centro de Custo", onClick: abrirNovo } : undefined}
                  />
                }
              />
            )}
          </div>
        </Card>

      </div>

      <Modal open={modalAberto} onClose={fecharModal}>
        <FormCentroDeCusto
          centroDeCusto={selecionado}
          onSalvar={handleSalvar}
          onCancelar={fecharModal}
        />
      </Modal>

      <ConfirmModal
        open={!!paraExcluir}
        title="Remover centro de custo"
        description={`Tem certeza que deseja remover "${paraExcluir?.descricao}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        loading={deletandoId !== null}
        onConfirm={handleDeletar}
        onCancel={() => setParaExcluir(null)}
      />
    </>
  );
}
