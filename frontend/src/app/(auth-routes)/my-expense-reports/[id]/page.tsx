"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  DotsThreeVertical,
  PencilSimple,
  Trash,
  Paperclip,
  PaperPlaneTilt,
  X,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import Loading from "@/ui/Loading";
import Button from "@/ui/Button";
import ConfirmModal from "@/ui/ConfirmModal";
import FormRdc from "@/features/rdc/components/FormRdc";
import StatusTag from "@/features/rdc/components/StatusTag";
import { toast } from "@/lib/toast";
import {
  buscarRdcApi,
  criarDespesaRdcApi,
  adicionarAnexoDespesaRdcApi,
  atualizarRdcApi,
  atualizarStatusRdcApi,
  deletarRdcApi,
} from "@/features/rdc/rdc.api";
import {
  RDC_STATUS_RASCUNHO,
  type DespesaRdcFormItem,
  type Rdc,
  type StoreRdcWithDespesasFormData,
} from "@/features/rdc/rdc.types";

function fmtValor(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtData(iso: string) {
  const [y, m, d] = iso.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
}

function buildDespesaFormData(despesa: DespesaRdcFormItem, arquivos: File[]): FormData {
  const fd = new FormData();
  fd.append("data_despesa", despesa.data_despesa);
  fd.append("valor", despesa.valor);
  fd.append("id_centro_custo", despesa.id_centro_custo);
  fd.append("descricao", despesa.descricao);
  if (despesa.id_categoria_despesa) fd.append("id_categoria_despesa", despesa.id_categoria_despesa);
  if (despesa.latitude != null) fd.append("latitude", String(despesa.latitude));
  if (despesa.longitude != null) fd.append("longitude", String(despesa.longitude));
  if (despesa.endereco) fd.append("endereco", despesa.endereco);
  if (despesa.descricao_fornecedor) fd.append("descricao_fornecedor", despesa.descricao_fornecedor);
  if (despesa.cpf_cnpj_fornecedor) fd.append("cpf_cnpj_fornecedor", despesa.cpf_cnpj_fornecedor.replace(/\D/g, ""));
  if (despesa.id_fornecedor) fd.append("id_fornecedor", despesa.id_fornecedor);
  for (const file of arquivos) fd.append("anexos[]", file);
  return fd;
}

export default function DetalheCaixaDeObraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [rdc, setRdc] = useState<Rdc | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [submetendo, setSubmetendo] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    buscarRdcApi(Number(id))
      .then(setRdc)
      .catch(() => toast.error("Não foi possível carregar a caixa de obra."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleEditar(dados: StoreRdcWithDespesasFormData, arquivos: File[][] = []) {
    if (!rdc) return;
    try {
      const { despesas, ...rdcDados } = dados;
      await atualizarRdcApi(rdc.id, rdcDados);

      const existingDespesas = rdc.despesas ?? [];
      const existingCount = existingDespesas.length;

      await Promise.all(
        existingDespesas.flatMap((orig, idx) =>
          (arquivos[idx] ?? []).map((file) =>
            adicionarAnexoDespesaRdcApi(rdc.id, orig.id, file)
          )
        )
      );

      const novas = (despesas ?? []).slice(existingCount);
      for (const [i, despesa] of novas.entries()) {
        await criarDespesaRdcApi(rdc.id, buildDespesaFormData(despesa, arquivos[existingCount + i] ?? []));
      }

      const atualizado = await buscarRdcApi(rdc.id);
      setRdc(atualizado);
      setIsEditing(false);
      toast.success("Caixa de Obra atualizada!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar as alterações.");
    }
  }

  async function handleSubmeter() {
    if (!rdc) return;
    setSubmetendo(true);
    try {
      const atualizado = await atualizarStatusRdcApi(rdc.id, 2);
      setRdc(atualizado);
      toast.success("Caixa enviada para aprovação!");
    } catch {
      toast.error("Não foi possível enviar para aprovação.");
    } finally {
      setSubmetendo(false);
    }
  }

  async function handleExcluir() {
    if (!rdc) return;
    setExcluindo(true);
    try {
      await deletarRdcApi(rdc.id);
      toast.success("Caixa excluída.");
      router.push("/minha-caixa-de-obra");
    } catch {
      toast.error("Não foi possível excluir a caixa.");
      setExcluindo(false);
      setModalExcluirAberto(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loading />
      </div>
    );
  }

  if (!rdc) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <p className="text-body text-app-text-muted">Caixa não encontrada.</p>
        <Button variant="outlined" onClick={() => router.push("/minha-caixa-de-obra")}>
          Voltar
        </Button>
      </div>
    );
  }

  const isRascunho = rdc.status === RDC_STATUS_RASCUNHO;
  const despesas = rdc.despesas ?? [];
  const total = despesas.reduce((acc, d) => acc + Number(d.valor ?? 0), 0);
  const podeEnviar = isRascunho && despesas.length > 0;

  return (
    <>
      <div className={`flex flex-col min-h-full ${isRascunho ? "pb-28" : "pb-8"}`}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-app-bg/95 backdrop-blur-sm border-b border-app-border-subtle">
          <div className="flex items-center gap-2 px-3 py-3 sm:px-4">
            <button
              onClick={() => router.push("/minha-caixa-de-obra")}
              aria-label="Voltar"
              className="rounded-full p-2 text-app-text-muted hover:bg-app-hover transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-feature-title text-app-text truncate">{rdc.descricao}</p>
            </div>
            <StatusTag status={rdc.status} />
            {isRascunho && (
              <button
                onClick={() => setMenuAberto(true)}
                aria-label="Mais ações"
                className="rounded-full p-2 text-app-text-muted hover:bg-app-hover transition-colors"
              >
                <DotsThreeVertical size={20} weight="bold" />
              </button>
            )}
          </div>
        </div>

        {/* Resumo compacto */}
        <div className="px-4 sm:px-6 pt-4 space-y-1">
          {(rdc.centro_de_custo || (rdc.data_inicio_periodo && rdc.data_fim_periodo)) && (
            <p className="text-small text-app-text-muted">
              {rdc.centro_de_custo?.descricao}
              {rdc.centro_de_custo && rdc.data_inicio_periodo && rdc.data_fim_periodo && " · "}
              {rdc.data_inicio_periodo && rdc.data_fim_periodo &&
                `${fmtData(rdc.data_inicio_periodo)} → ${fmtData(rdc.data_fim_periodo)}`}
            </p>
          )}
          {(rdc.descricao_requisitante || rdc.usuario_requisitante) && (
            <p className="text-small text-app-text-muted">
              Requisitante: {rdc.usuario_requisitante?.nome ?? rdc.descricao_requisitante}
            </p>
          )}
          {rdc.obs && (
            <p className="text-small text-app-text-muted pt-2 leading-relaxed">{rdc.obs}</p>
          )}
        </div>

        {/* Total em destaque */}
        <div className="px-4 sm:px-6 pt-6">
          <p className="text-caption font-semibold text-app-text-muted uppercase tracking-wide">
            Total
          </p>
          <p className="text-[2rem] leading-tight font-bold text-app-text">
            {fmtValor(total)}
          </p>
        </div>

        {/* Lista de despesas — estilo extrato */}
        <div className="px-4 sm:px-6 pt-6 flex-1">
          <p className="text-caption font-semibold text-app-text-muted uppercase tracking-wide mb-1">
            Despesas
          </p>
          {despesas.length === 0 ? (
            <p className="text-small text-app-text-muted py-6 text-center">
              Nenhuma despesa registrada.
            </p>
          ) : (
            <ul className="divide-y divide-app-border-subtle">
              {despesas.map((despesa) => (
                <motion.li
                  key={despesa.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start justify-between gap-3 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-body text-app-text truncate">
                      {despesa.descricao}
                    </p>
                    <p className="text-small text-app-text-muted mt-0.5">
                      {fmtData(despesa.data_despesa)}
                      {despesa.categoria_despesa && ` · ${despesa.categoria_despesa.descricao}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className="text-body font-semibold text-app-text">
                      {fmtValor(Number(despesa.valor ?? 0))}
                    </span>
                    {(despesa.anexos ?? []).length > 0 && (
                      <span className="flex items-center gap-1 text-small text-app-text-subtle">
                        <Paperclip size={11} />
                        {despesa.anexos!.length}
                      </span>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Barra fixa — Enviar para aprovação */}
      {isRascunho && (
        <div
          className="fixed bottom-0 inset-x-0 z-20 bg-app-bg/95 backdrop-blur-sm border-t border-app-border-subtle px-4 py-3 sm:px-6"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <Button
            variant="dark"
            fullWidth
            onClick={handleSubmeter}
            disabled={submetendo || !podeEnviar}
          >
            <PaperPlaneTilt size={16} weight="bold" />
            {submetendo ? "Enviando…" : "Enviar para Aprovação"}
          </Button>
        </div>
      )}

      {/* Bottom sheet — menu de ações */}
      <AnimatePresence>
        {menuAberto && (
          <motion.div
            className="fixed inset-0 z-50"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMenuAberto(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="absolute bottom-0 inset-x-0 bg-app-surface rounded-t-2xl border-t border-app-border p-4 md:max-w-md md:left-1/2 md:right-auto md:-translate-x-1/2 md:bottom-12 md:rounded-2xl md:border"
              style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
            >
              <div className="flex justify-between items-center mb-3">
                <p className="text-feature-title text-app-text">Ações</p>
                <button
                  aria-label="Fechar"
                  onClick={() => setMenuAberto(false)}
                  className="h-11 w-11 -mr-2 flex items-center justify-center text-app-text-muted hover:text-app-text"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMenuAberto(false);
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-app-border bg-app-surface text-body-sm text-left hover:border-brand/30 transition-colors"
                >
                  <PencilSimple size={20} className="text-app-text-muted shrink-0" />
                  <span className="font-semibold text-app-text">Editar</span>
                </button>
                <button
                  onClick={() => {
                    setMenuAberto(false);
                    setModalExcluirAberto(true);
                  }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-app-border bg-app-surface text-body-sm text-left hover:border-red-500/40 transition-colors"
                >
                  <Trash size={20} className="text-red-500 shrink-0" />
                  <span className="font-semibold text-red-500">Excluir</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={modalExcluirAberto}
        title="Excluir esta caixa?"
        description="Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        loading={excluindo}
        onConfirm={handleExcluir}
        onCancel={() => setModalExcluirAberto(false)}
      />

      <AnimatePresence>
        {isEditing && (
          <FormRdc
            rdcInicial={rdc}
            onSalvar={handleEditar}
            onFechar={() => setIsEditing(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
