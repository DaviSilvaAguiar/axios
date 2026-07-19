"use client";

import { useEffect, useState, useCallback } from "react";
import { List, SquaresFour, Plus, FunnelSimple } from "@phosphor-icons/react";
import DatePicker from "@/ui/DatePicker";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/ui/Button";
import { toast } from "@/lib/toast";
import Loading from "@/ui/Loading";
import Card from "@/ui/Card";
import Combobox from "@/ui/Combobox";
import KanbanView from "@/features/rcm/components/KanbanView";
import ListaView from "@/features/rcm/components/ListaView";
import AuditoriaView from "@/features/rcm/components/AuditoriaView";
import FormRcm from "@/features/rcm/components/FormRcm";
import ModalAgendamento from "@/features/rcm/components/ModalAgendamento";
import ModalRejeicao from "@/features/rcm/components/ModalRejeicao";
import ConfirmModal from "@/ui/ConfirmModal";
import {
  listarRcmsApi,
  criarRcmApi,
  atualizarRcmApi,
  criarDespesaRcmApi,
  atualizarDespesaRcmApi,
  deletarDespesaRcmApi,
  adicionarAnexoRcmApi,
  deletarAnexoEspecificoRcmApi,
  atualizarStatusRcmApi,
  baixarPdfRcmApi,
  deletarRcmApi,
} from "@/features/rcm/rcm.api";
import { usePaginatedList } from "@/lib/usePaginatedList";
import {
  RCM_STATUS_LABEL,
  type Rcm,
  type RcmStatus,
  type StoreRcmWithDespesasFormData,
} from "@/features/rcm/rcm.types";
import type { AnexoParaAdicionar, AnexoParaDeletar } from "@/features/rcm/components/FormRcm";

type ViewMode = "kanban" | "lista";

export default function RcmPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [selectedRcm, setSelectedRcm] = useState<Rcm | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [rcmParaEditar, setRcmParaEditar] = useState<Rcm | null>(null);
  const [modalAgendamento, setModalAgendamento] = useState<Rcm | null>(null);
  const [modalRejeicao, setModalRejeicao] = useState<Rcm | null>(null);
  const [rcmParaExcluir, setRcmParaExcluir] = useState<Rcm | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const [filtros, setFiltros] = useState({
    colaborador: "",
    status: "",
    dataInicio: "",
    dataFim: "",
  });

  const [debouncedFiltros, setDebouncedFiltros] = useState(filtros);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFiltros(filtros), 400);
    return () => clearTimeout(timer);
  }, [filtros]);

  const fetcher = useCallback((page: number, perPage: number) => {
    return listarRcmsApi(page, perPage, debouncedFiltros);
  }, [debouncedFiltros]);

  const {
    items: rcms,
    setItems: setRcms,
    loading,
    erro,
    hasMore,
    loadingMore,
    recarregar,
    carregarMais,
  } = usePaginatedList(fetcher);

  useEffect(() => {
    recarregar();
  }, [debouncedFiltros, recarregar]);



  function atualizarRcmLocal(id: number, patch: Partial<Rcm>) {
    setRcms((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setSelectedRcm((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));
  }

  async function handleConfirmarExclusao() {
    if (!rcmParaExcluir) return;
    setExcluindo(true);
    try {
      await deletarRcmApi(rcmParaExcluir.id);
      setRcms((prev) => prev.filter((r) => r.id !== rcmParaExcluir.id));
      setSelectedRcm((prev) => (prev?.id === rcmParaExcluir.id ? null : prev));
      setRcmParaExcluir(null);
      toast.success("Reembolso excluído com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível excluir o reembolso.");
    } finally {
      setExcluindo(false);
    }
  }

  async function handleMoverRcm(id: number, novoStatus: RcmStatus) {
    try {
      await atualizarStatusRcmApi(id, { status: novoStatus });
      atualizarRcmLocal(id, { status: novoStatus });
    } catch {
    }
  }

  async function handleConfirmarRejeicao(motivo: string) {
    if (!modalRejeicao) return;
    await atualizarStatusRcmApi(modalRejeicao.id, { status: 7, motivo_rejeicao: motivo });
    atualizarRcmLocal(modalRejeicao.id, { status: 7, motivo_rejeicao: motivo });
    setModalRejeicao(null);
  }

  async function handleConfirmarAgendamento(data: string) {
    if (!modalAgendamento) return;
    await atualizarStatusRcmApi(modalAgendamento.id, {
      status: 5,
      data_pagamento_programado: data,
    });
    atualizarRcmLocal(modalAgendamento.id, {
      status: 5,
      data_pagamento_programado: data,
    });
    setModalAgendamento(null);
  }

  async function handleAprovar(id: number) {
    await atualizarStatusRcmApi(id, { status: 4 });
    atualizarRcmLocal(id, { status: 4 });
    setSelectedRcm(null);
  }

  async function handleRejeitar(id: number, motivo: string) {
    await atualizarStatusRcmApi(id, { status: 7, motivo_rejeicao: motivo });
    atualizarRcmLocal(id, { status: 7, motivo_rejeicao: motivo });
    setSelectedRcm(null);
  }

  function fecharForm() {
    setShowForm(false);
    setRcmParaEditar(null);
  }

  function handleEditarRcm(rcm: Rcm) {
    setRcmParaEditar(rcm);
    setShowForm(true);
  }

  async function handleBaixarPdf(id: number) {
    try {
      const blob = await baixarPdfRcmApi(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rcm-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
    }
  }

  async function handleSalvarForm(
    dados: StoreRcmWithDespesasFormData,
    deletarDespesaIds: number[],
    deletarAnexos: AnexoParaDeletar[],
    adicionarAnexos: AnexoParaAdicionar[]
  ) {
    try {
      const { despesas, ...rcmDados } = dados;
      let rcmId: number;

      if (rcmParaEditar) {
        await atualizarRcmApi(rcmParaEditar.id, rcmDados);
        rcmId = rcmParaEditar.id;
      } else {
        const { rcm } = await criarRcmApi(rcmDados);
        rcmId = rcm.id;
      }

      for (const id of deletarDespesaIds) {
        await deletarDespesaRcmApi(rcmId, id);
      }

      for (const { idDespesa, idAnexo } of deletarAnexos) {
        await deletarAnexoEspecificoRcmApi(rcmId, idDespesa, idAnexo);
      }

      for (const { idDespesa, file } of adicionarAnexos) {
        await adicionarAnexoRcmApi(rcmId, idDespesa, file);
      }

      for (const despesa of despesas) {
        if (despesa.despesaId) {
          await atualizarDespesaRcmApi(rcmId, despesa.despesaId, {
            data_despesa:         despesa.data_despesa,
            valor:                despesa.valor,
            id_centro_custo:      despesa.id_centro_custo,
            descricao:            despesa.descricao,
            id_categoria_despesa: despesa.id_categoria_despesa || undefined,
            latitude:             despesa.latitude  ?? null,
            longitude:            despesa.longitude ?? null,
            endereco:             despesa.endereco  ?? null,
            descricao_fornecedor: despesa.descricao_fornecedor || undefined,
            cpf_cnpj_fornecedor:  despesa.cpf_cnpj_fornecedor  || undefined,
            id_fornecedor:        despesa.id_fornecedor        || undefined,
          });
        } else {
          const fd = new FormData();
          fd.append("data_despesa", despesa.data_despesa);
          fd.append("valor", despesa.valor);
          fd.append("id_centro_custo", despesa.id_centro_custo);
          fd.append("descricao", despesa.descricao);
          if (despesa.id_categoria_despesa) fd.append("id_categoria_despesa", despesa.id_categoria_despesa);
          if (despesa.latitude  != null) fd.append("latitude",  String(despesa.latitude));
          if (despesa.longitude != null) fd.append("longitude", String(despesa.longitude));
          if (despesa.endereco) fd.append("endereco", despesa.endereco);
          if (despesa.descricao_fornecedor) fd.append("descricao_fornecedor", despesa.descricao_fornecedor);
          if (despesa.cpf_cnpj_fornecedor) fd.append("cpf_cnpj_fornecedor", despesa.cpf_cnpj_fornecedor.replace(/\D/g, ""));
          if (despesa.id_fornecedor) fd.append("id_fornecedor", despesa.id_fornecedor);
          const files = (despesa.anexo as File[] | undefined) ?? [];
          files.forEach((f) => fd.append("anexos[]", f));
          await criarDespesaRcmApi(rcmId, fd);
        }
      }

      fecharForm();
      toast.success(rcmParaEditar ? "Solicitação atualizada com sucesso!" : "Solicitação criada com sucesso!");
      recarregar();
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : "Erro ao salvar solicitação.";
      toast.error(mensagem);
    }
  }

  if (selectedRcm) {
    return (
      <div className="flex h-full flex-col p-4">
        <AuditoriaView
          rcm={selectedRcm}
          onFechar={() => setSelectedRcm(null)}
          onAprovar={handleAprovar}
          onRejeitar={handleRejeitar}
          onBaixarPdf={handleBaixarPdf}
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 p-6">

        {/* Card de cabeçalho */}
        <Card>
          <div className="flex items-center justify-between px-5 py-4">
            <h1 className="text-feature-title text-app-text">Reembolsos</h1>
            <Button variant="dark" size="sm" onClick={() => setShowForm(true)}>
              <Plus size={14} />
              Nova Solicitação
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 border-t border-app-border px-5 py-4">
            <div className="flex rounded-xl border border-app-border bg-app-surface overflow-hidden self-start">
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1.5 px-3 py-2 text-caption font-semibold transition-colors cursor-pointer ${viewMode === "kanban"
                  ? "bg-app-surface-raised text-app-text"
                  : "text-app-text-muted hover:bg-app-hover"
                  }`}
              >
                <SquaresFour size={16} />
                Kanban
              </button>
              <button
                onClick={() => setViewMode("lista")}
                className={`flex items-center gap-1.5 px-3 py-2 text-caption font-semibold transition-colors cursor-pointer ${viewMode === "lista"
                  ? "bg-app-surface-raised text-app-text"
                  : "text-app-text-muted hover:bg-app-hover"
                  }`}
              >
                <List size={16} />
                Lista
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:ml-auto flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FunnelSimple size={16} className="hidden sm:block text-app-text-muted shrink-0" />
                <input
                  type="text"
                  placeholder="Colaborador"
                  value={filtros.colaborador}
                  onChange={(e) => setFiltros((f) => ({ ...f, colaborador: e.target.value }))}
                  className="h-10 rounded-xl border border-app-border bg-app-surface px-3 text-body-sm text-app-text placeholder:text-app-text-subtle focus:border-brand focus:outline-none w-full sm:w-52"
                />
              </div>
              <Combobox
                placeholder="Status"
                searchPlaceholder="Buscar status…"
                value={filtros.status}
                onChange={(v) => setFiltros((f) => ({ ...f, status: v }))}
                className="w-full sm:w-44"
                options={[
                  { value: "1", label: RCM_STATUS_LABEL[1] },
                  { value: "2", label: RCM_STATUS_LABEL[2] },
                  { value: "3", label: RCM_STATUS_LABEL[3] },
                  { value: "4", label: RCM_STATUS_LABEL[4] },
                  { value: "5", label: RCM_STATUS_LABEL[5] },
                  { value: "6", label: RCM_STATUS_LABEL[6] },
                ]}
              />
              <div className="flex gap-2">
                <DatePicker
                  size="sm"
                  placeholder="De"
                  value={filtros.dataInicio}
                  onChange={(v) => setFiltros((f) => ({ ...f, dataInicio: v }))}
                  className="flex-1 sm:w-36"
                />
                <DatePicker
                  size="sm"
                  placeholder="Até"
                  align="right"
                  value={filtros.dataFim}
                  onChange={(v) => setFiltros((f) => ({ ...f, dataFim: v }))}
                  className="flex-1 sm:w-36"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Card de conteúdo */}
        <Card>
          <div className="p-5">
            {loading ? (
              <Loading />
            ) : erro ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4">
                <p className="text-body-sm text-red-700">{erro}</p>
                <button
                  onClick={recarregar}
                  className="mt-2 text-caption font-semibold text-brand hover:underline"
                >
                  Tentar novamente
                </button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewMode}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  {viewMode === "kanban" ? (
                    <KanbanView
                      rcms={rcms}
                      onMoverRcm={handleMoverRcm}
                      onPedirAgendamento={(rcm) => setModalAgendamento(rcm)}
                      onPedirRejeicao={(rcm) => setModalRejeicao(rcm)}
                      onAbrirAuditoria={setSelectedRcm}
                      onBaixarPdf={handleBaixarPdf}
                      onEditarRcm={handleEditarRcm}
                      onExcluirRcm={setRcmParaExcluir}
                    />
                  ) : (
                    <ListaView
                      rcms={rcms}
                      onSelecionarRcm={setSelectedRcm}
                      loading={loading}
                      onLoadMore={carregarMais}
                      hasMore={hasMore}
                      loadingMore={loadingMore}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </Card>

      </div>

      <AnimatePresence>
        {showForm && (
          <FormRcm
            rcmInicial={rcmParaEditar ?? undefined}
            onSalvar={handleSalvarForm}
            onFechar={fecharForm}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalAgendamento && (
          <ModalAgendamento
            onConfirmar={handleConfirmarAgendamento}
            onCancelar={() => setModalAgendamento(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalRejeicao && (
          <ModalRejeicao
            onConfirmar={handleConfirmarRejeicao}
            onCancelar={() => setModalRejeicao(null)}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        open={!!rcmParaExcluir}
        title="Excluir Reembolso?"
        description={rcmParaExcluir ? `Esta ação não pode ser desfeita. O reembolso "${rcmParaExcluir.titulo}" e todas as despesas vinculadas serão removidos permanentemente.` : undefined}
        confirmLabel="Excluir"
        loading={excluindo}
        onConfirm={handleConfirmarExclusao}
        onCancel={() => { if (!excluindo) setRcmParaExcluir(null); }}
      />
    </>
  );
}
