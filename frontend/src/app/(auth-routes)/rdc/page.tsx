"use client";

import { Plus, FunnelSimple, List, SquaresFour } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/ui/Button";
import Loading from "@/ui/Loading";
import Card from "@/ui/Card";
import Combobox from "@/ui/Combobox";
import DatePicker from "@/ui/DatePicker";
import ConfirmModal from "@/ui/ConfirmModal";
import KanbanView from "@/features/rdc/components/KanbanView";
import ListaView from "@/features/rdc/components/ListaView";
import FormRdc from "@/features/rdc/components/FormRdc";
import AuditoriaView from "@/features/rdc/components/AuditoriaView";
import ModalAprovarRdcComCaixa from "@/features/caixa-conta/components/ModalAprovarRdcComCaixa";
import ModalAgendamentoRdc from "@/features/rdc/components/ModalAgendamentoRdc";
import { useRdcPage } from "@/features/rdc/hooks/useRdcPage";
import { baixarPdfRdcApi } from "@/features/rdc/rdc.api";
import { RDC_STATUS_LABEL } from "@/features/rdc/rdc.types";
import { toast } from "@/lib/toast";

export default function RdcPage() {
  const {
    rdcsFiltrados,
    loading,
    erro,
    recarregar,

    showForm,
    setShowForm,
    viewMode,
    setViewMode,
    filtros,
    setFiltros,

    rdcSelecionado,
    setRdcSelecionado,
    isEditing,
    setIsEditing,
    editOrigemKanban,
    setEditOrigemKanban,

    rdcParaAprovar,
    setRdcParaAprovar,
    rdcParaRejeitar,
    setRdcParaRejeitar,
    rejeitando,
    motivoRejeicaoKanban,
    setMotivoRejeicaoKanban,
    rdcParaAgendar,
    setRdcParaAgendar,
    rdcParaExcluir,
    setRdcParaExcluir,
    excluindo,

    handleMoverRdc,
    handleCriarRdc,
    handleEditarRdc,
    handleSubmeterRdc,
    handleConfirmarAprovacao,
    handleRejeitarRdc,
    handleConfirmarRejeicao,
    handleConfirmarAgendamento,
    handleMarcarPago,
    handleConfirmarExclusao,
  } = useRdcPage();

  async function handleBaixarPdf(id: number) {
    try {
      const blob = await baixarPdfRdcApi(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rdc-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Não foi possível baixar o PDF.");
    }
  }

  // ── Vista de auditoria ──────────────────────────────────────────────────────

  if (rdcSelecionado && (!isEditing || !editOrigemKanban)) {
    return (
      <>
        <div className="flex h-full flex-col p-4">
          <AuditoriaView
            rdc={rdcSelecionado}
            onFechar={() => setRdcSelecionado(null)}
            onEditar={() => setIsEditing(true)}
            onSubmeter={handleSubmeterRdc}
            onAprovar={(rdc) => setRdcParaAprovar(rdc)}
            onRejeitar={handleRejeitarRdc}
            onAgendar={(rdc) => setRdcParaAgendar(rdc)}
            onMarcarPago={handleMarcarPago}
            onBaixarPdf={handleBaixarPdf}
            modalAberto={isEditing || !!rdcParaAprovar || !!rdcParaAgendar}
          />
          <AnimatePresence>
            {isEditing && (
              <FormRdc
                rdcInicial={rdcSelecionado}
                onSalvar={handleEditarRdc}
                onFechar={() => setIsEditing(false)}
              />
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {rdcParaAprovar && (
            <ModalAprovarRdcComCaixa
              idUsuarioRdc={rdcParaAprovar.id_usuario}
              idCentroCustoRdc={rdcParaAprovar.id_centro_custo}
              valorTotal={(rdcParaAprovar.despesas ?? []).reduce((sum, d) => sum + Number(d.valor ?? 0), 0)}
              onConfirmar={handleConfirmarAprovacao}
              onFechar={() => setRdcParaAprovar(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {rdcParaAgendar && (
            <ModalAgendamentoRdc
              onConfirmar={handleConfirmarAgendamento}
              onCancelar={() => setRdcParaAgendar(null)}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // ── Vista principal (kanban / lista) ────────────────────────────────────────

  return (
    <>
      <div className="flex flex-col gap-4 p-6">

        <Card>
          <div className="flex items-center justify-between px-5 py-4">
            <h1 className="text-feature-title text-app-text">Caixa de Obra</h1>
            <Button variant="dark" size="sm" onClick={() => setShowForm(true)}>
              <Plus size={14} />
              Novo RDC
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-app-border px-5 py-4">
            <div className="flex rounded-xl border border-app-border bg-app-surface overflow-hidden">
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

            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <FunnelSimple size={16} className="text-app-text-muted shrink-0" />
              <input
                type="text"
                placeholder="Requisitante"
                value={filtros.requisitante}
                onChange={(e) => setFiltros((f) => ({ ...f, requisitante: e.target.value }))}
                className="h-10 rounded-xl border border-app-border bg-app-surface px-3 text-body-sm text-app-text placeholder:text-app-text-subtle focus:border-brand focus:outline-none w-52"
              />
              <Combobox
                placeholder="Status"
                searchPlaceholder="Buscar status…"
                value={filtros.status}
                onChange={(v) => setFiltros((f) => ({ ...f, status: v }))}
                className="w-44"
                options={Object.entries(RDC_STATUS_LABEL).map(([value, label]) => ({ value, label }))}
              />
              <DatePicker
                size="sm"
                placeholder="De"
                value={filtros.dataInicio}
                onChange={(v) => setFiltros((f) => ({ ...f, dataInicio: v }))}
                className="w-36"
              />
              <DatePicker
                size="sm"
                placeholder="Até"
                align="right"
                value={filtros.dataFim}
                onChange={(v) => setFiltros((f) => ({ ...f, dataFim: v }))}
                className="w-36"
              />
            </div>
          </div>
        </Card>

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
                      rdcs={rdcsFiltrados}
                      onMoverRdc={handleMoverRdc}
                      onSelecionarRdc={setRdcSelecionado}
                      onEditarRdc={(rdc) => { setRdcSelecionado(rdc); setIsEditing(true); setEditOrigemKanban(true); }}
                      onExcluirRdc={setRdcParaExcluir}
                      onBaixarPdf={handleBaixarPdf}
                    />
                  ) : (
                    <ListaView
                      rdcs={rdcsFiltrados}
                      onSelecionarRdc={setRdcSelecionado}
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
          <FormRdc
            onSalvar={handleCriarRdc}
            onFechar={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rdcSelecionado && isEditing && (
          <FormRdc
            rdcInicial={rdcSelecionado}
            onSalvar={handleEditarRdc}
            onFechar={() => {
              setIsEditing(false);
              if (editOrigemKanban) {
                setRdcSelecionado(null);
                setEditOrigemKanban(false);
              }
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rdcParaAprovar && (
          <ModalAprovarRdcComCaixa
            idUsuarioRdc={rdcParaAprovar.id_usuario}
            idCentroCustoRdc={rdcParaAprovar.id_centro_custo}
            valorTotal={(rdcParaAprovar.despesas ?? []).reduce((sum, d) => sum + Number(d.valor ?? 0), 0)}
            onConfirmar={handleConfirmarAprovacao}
            onFechar={() => setRdcParaAprovar(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rdcParaAgendar && (
          <ModalAgendamentoRdc
            onConfirmar={handleConfirmarAgendamento}
            onCancelar={() => setRdcParaAgendar(null)}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        open={!!rdcParaRejeitar}
        title="Rejeitar Solicitação ?"
        description="A solicitação será marcada como rejeitada e o prestador precisará criar uma nova se quiser submeter novamente."
        confirmLabel="Rejeitar"
        loadingLabel="Rejeitando…"
        loading={rejeitando}
        onConfirm={handleConfirmarRejeicao}
        onCancel={() => { if (!rejeitando) { setRdcParaRejeitar(null); setMotivoRejeicaoKanban(""); } }}
      >
        <textarea
          value={motivoRejeicaoKanban}
          onChange={(e) => setMotivoRejeicaoKanban(e.target.value)}
          placeholder="Justificativa (opcional)"
          rows={3}
          className="w-full rounded-xl border border-app-border bg-app-surface-raised/40 px-3 py-2 text-body-sm text-app-text placeholder:text-app-text-subtle resize-none focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </ConfirmModal>

      <ConfirmModal
        open={!!rdcParaExcluir}
        title="Excluir RDC?"
        description={rdcParaExcluir ? `Esta ação não pode ser desfeita. O RDC "${rdcParaExcluir.descricao}" e todas as despesas vinculadas serão removidos permanentemente.` : undefined}
        confirmLabel="Excluir"
        loading={excluindo}
        onConfirm={handleConfirmarExclusao}
        onCancel={() => { if (!excluindo) setRdcParaExcluir(null); }}
      />
    </>
  );
}
