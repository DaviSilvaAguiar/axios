"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  type Icon,
  X,
  Image,
  ImageBroken,
  FileX,
  ArrowRight,
  ArrowLeft,
  CircleNotch,
  PencilSimple,
  PaperPlaneTilt,
  MapPin,
  FilePdf,
} from "@phosphor-icons/react";
import Button from "@/ui/Button";
import ConfirmModal from "@/ui/ConfirmModal";
import StatusTag from "./StatusTag";
import VisualizadorLocalizacao from "@/features/geolocalizacao/components/VisualizadorLocalizacao";
import { buscarAnexoRdcApi, buscarRdcApi } from "../rdc.api";
import { RDC_STATUS_RASCUNHO, type DespesaRdc, type Rdc } from "../rdc.types";
import { formatarData, formatarMoeda } from "@/lib/formatters";

const SPRING = { type: "spring" as const, stiffness: 380, damping: 30 };

function gerarIniciais(nome?: string | null): string {
  if (!nome) return "?";
  return nome
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase();
}

function AnexoPlaceholder({ icon: PhosphorIcon, label }: { icon: Icon; label: string }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2 text-app-text-subtle"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18 }}
    >
      <PhosphorIcon size={44} weight="thin" />
      <p className="text-small">{label}</p>
    </motion.div>
  );
}

interface Props {
  rdc: Rdc;
  onFechar: () => void;
  onEditar: () => void;
  onSubmeter: () => Promise<void>;
  onAprovar?: (rdc: Rdc) => void;
  onRejeitar?: (rdc: Rdc, motivo?: string) => Promise<void>;
  onAgendar?: (rdc: Rdc) => void;
  onMarcarPago?: (rdc: Rdc) => void;
  onBaixarPdf?: (id: number) => void;
  modalAberto?: boolean;
}

export default function AuditoriaView({ rdc: rdcInicial, onFechar, onEditar, onSubmeter, onAprovar, onRejeitar, onAgendar, onMarcarPago, onBaixarPdf, modalAberto = false }: Props) {
  const [rdc, setRdc] = useState<Rdc>(rdcInicial);
  const despesas = rdc.despesas ?? [];
  const [selectedDespesa, setSelectedDespesa] = useState<DespesaRdc | null>(despesas[0] ?? null);
  const [painelMobile, setPainelMobile] = useState<"lista" | "detalhe">("lista");
  const [confirmando, setConfirmando] = useState(false);
  const [submetendo, setSubmetendo] = useState(false);
  const [verLocalizacao, setVerLocalizacao] = useState(false);
  const [rejeitando, setRejeitando] = useState(false);
  const [confirmarRejeicao, setConfirmarRejeicao] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");

  // ESC fecha AuditoriaView — mas só quando não há modal aberto (interno ou externo)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (verLocalizacao || confirmando || confirmarRejeicao || modalAberto) return;
      onFechar();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [verLocalizacao, confirmando, confirmarRejeicao, modalAberto, onFechar]);

  // Sincroniza com mudancas no prop (ex: apos edicao parent passa rdc atualizado)
  useEffect(() => {
    setRdc(rdcInicial);
    const novas = rdcInicial.despesas ?? [];
    setSelectedDespesa((atual) => atual ? (novas.find((d) => d.id === atual.id) ?? novas[0] ?? null) : (novas[0] ?? null));
  }, [rdcInicial]);

  // Refetch inicial garante despesas/relacoes completas caso o prop venha incompleto
  useEffect(() => {
    buscarRdcApi(rdcInicial.id)
      .then((atualizado) => {
        setRdc(atualizado);
        const novas = atualizado.despesas ?? [];
        setSelectedDespesa((atual) => atual ? (novas.find((d) => d.id === atual.id) ?? novas[0] ?? null) : (novas[0] ?? null));
      })
      .catch(() => { });
  }, [rdcInicial.id]);

  const total = despesas.reduce((acc, d) => acc + parseFloat(d.valor ?? "0"), 0);

  const anexo = selectedDespesa?.anexos?.[0] ?? null;
  const caminho = anexo?.caminho ?? null;
  const isPdf = caminho?.toLowerCase().endsWith(".pdf") ?? false;
  const isImage = caminho ? /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(caminho) : false;

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadingAnexo, setLoadingAnexo] = useState(false);
  const [imgError, setImgError] = useState(false);
  const prevBlobUrl = useRef<string | null>(null);

  useEffect(() => {
    setImgError(false);
    setBlobUrl(null);

    if (prevBlobUrl.current) {
      URL.revokeObjectURL(prevBlobUrl.current);
      prevBlobUrl.current = null;
    }

    if (!anexo || !selectedDespesa) return;

    let cancelled = false;
    setLoadingAnexo(true);

    buscarAnexoRdcApi(rdc.id, selectedDespesa.id, anexo.id)
      .then((blob) => {
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        prevBlobUrl.current = url;
        setBlobUrl(url);
      })
      .catch(() => {
        if (!cancelled) setImgError(true);
      })
      .finally(() => {
        if (!cancelled) setLoadingAnexo(false);
      });

    return () => { cancelled = true; };
  }, [selectedDespesa?.id, anexo?.id]);

  async function handleConfirmar() {
    setSubmetendo(true);
    try {
      await onSubmeter();
      setConfirmando(false);
    } finally {
      setSubmetendo(false);
    }
  }

  async function handleConfirmarRejeicao() {
    if (!onRejeitar) return;
    setRejeitando(true);
    try {
      await onRejeitar(rdc, motivoRejeicao || undefined);
      setConfirmarRejeicao(false);
      setMotivoRejeicao("");
    } finally {
      setRejeitando(false);
    }
  }

  const eRascunho = rdc.status === RDC_STATUS_RASCUNHO;
  const eEmAnalise = rdc.status === 2 || rdc.status === 3; // Pendente ou Em Análise (auditor pode agir)
  const eAprovado = rdc.status === 4;
  const eAgendado = rdc.status === 5;
  const periodo = rdc.data_inicio_periodo && rdc.data_fim_periodo
    ? { inicio: rdc.data_inicio_periodo, fim: rdc.data_fim_periodo }
    : null;

  const localizacaoAtual = selectedDespesa?.latitude != null && selectedDespesa?.longitude != null
    ? {
      latitude: Number(selectedDespesa.latitude),
      longitude: Number(selectedDespesa.longitude),
      endereco: selectedDespesa.endereco ?? null,
    }
    : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-app-border bg-app-surface"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-app-border px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-app-surface-raised font-ui text-[11px] font-semibold text-app-text-muted">
              {gerarIniciais(rdc.descricao_requisitante)}
            </div>
            <div className="min-w-0">
              <h2 className="text-feature-title text-app-text truncate">{rdc.descricao}</h2>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                <span className="text-small text-app-text-muted">
                  {rdc.descricao_requisitante ?? "—"}
                </span>
                {periodo && (
                  <>
                    <span className="text-[10px] text-app-text-subtle">·</span>
                    <span className="text-small text-app-text-muted">
                      {formatarData(periodo.inicio)}
                    </span>
                    <ArrowRight size={11} className="text-app-text-subtle" />
                    <span className="text-small text-app-text-muted">
                      {formatarData(periodo.fim)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0">
            <StatusTag status={rdc.status} />
            <button
              onClick={onFechar}
              className="rounded-full p-2 text-app-text-muted transition-colors hover:bg-app-hover"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Banner de rejeição — sempre visível em qualquer resolução */}
        {rdc.status === 7 && rdc.motivo_rejeicao && (
          <div className="shrink-0 border-b border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/60 px-6 py-3 space-y-0.5">
            <p className="text-small font-semibold text-red-700 dark:text-red-300 uppercase tracking-wide">
              Motivo da Rejeição
            </p>
            <p className="text-body-sm text-red-600 dark:text-red-400 whitespace-pre-line break-words">
              {rdc.motivo_rejeicao}
            </p>
          </div>
        )}

        {/* Banner de pagamento agendado */}
        {(rdc.status === 5 || rdc.status === 6) && rdc.data_pagamento && (
          <div className="shrink-0 border-b border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/60 px-6 py-3 space-y-0.5">
            <p className="text-small font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
              {rdc.status === 6 ? "Data de Pagamento" : "Pagamento Agendado para"}
            </p>
            <p className="text-body-sm text-emerald-700 dark:text-emerald-300 font-semibold">
              {formatarData(rdc.data_pagamento)}
            </p>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* Painel esquerdo — lista de despesas */}
          <div className={`flex flex-col border-b md:border-b-0 md:border-r border-app-border md:w-2/5 ${painelMobile === "detalhe" ? "hidden md:flex" : "flex"}`}>
            <div className="flex-1 overflow-y-auto">
              {despesas.length === 0 ? (
                <p className="p-6 text-center text-body-sm text-app-text-muted">
                  Sem despesas lançadas.
                </p>
              ) : (
                <ul>
                  {despesas.map((d) => (
                    <li key={d.id} className="relative">
                      {selectedDespesa?.id === d.id && (
                        <motion.div
                          layoutId="active-indicator-rdc"
                          className="absolute inset-0 border-l-2 border-l-brand bg-app-nav-active"
                          transition={SPRING}
                        />
                      )}
                      <motion.button
                        onClick={() => { setSelectedDespesa(d); setPainelMobile("detalhe"); }}
                        whileHover={{ x: selectedDespesa?.id === d.id ? 0 : 2 }}
                        transition={{ duration: 0.12 }}
                        className="relative z-10 w-full border-b border-app-border-subtle px-5 py-4 text-left"
                      >
                        <p className="line-clamp-1 text-caption font-semibold text-app-text">
                          {d.descricao}
                        </p>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-small text-app-text-muted">
                            {formatarData(d.data_despesa)}
                          </span>
                          <span className="text-caption font-semibold text-app-text">
                            {d.valor ? formatarMoeda(parseFloat(d.valor)) : "—"}
                          </span>
                        </div>
                        {d.centro_de_custo && (
                          <p className="mt-0.5 truncate text-small text-app-text-subtle">
                            {d.centro_de_custo.descricao}
                          </p>
                        )}
                      </motion.button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {despesas.length > 0 && (
              <div className="flex shrink-0 items-center justify-between border-t border-app-border bg-app-surface px-5 py-3">
                <span className="text-small text-app-text-muted">
                  {despesas.length} {despesas.length === 1 ? "item" : "itens"}
                </span>
                <span className="text-caption font-semibold text-app-text">
                  {formatarMoeda(total)}
                </span>
              </div>
            )}
          </div>

          {/* Painel direito — área de trabalho */}
          <div className={`flex flex-col overflow-hidden md:w-3/5 ${painelMobile === "lista" ? "hidden md:flex" : "flex"}`}>
            <button
              onClick={() => setPainelMobile("lista")}
              className="md:hidden flex items-center gap-1.5 px-4 py-2.5 border-b border-app-border text-small font-semibold text-app-text-muted hover:bg-app-hover transition-colors"
            >
              <ArrowLeft size={15} />
              Voltar às despesas
            </button>

            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {selectedDespesa ? (
                  <motion.div
                    key={selectedDespesa.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    {/* Visualizador de mídia */}
                    <div className="relative flex h-80 items-center justify-center overflow-hidden border-b border-app-border bg-app-surface-raised/20">
                      <AnimatePresence mode="wait">
                        {loadingAnexo ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="flex flex-col items-center gap-2 text-app-text-subtle"
                          >
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                              className="inline-block"
                            >
                              <CircleNotch size={32} weight="thin" />
                            </motion.span>
                          </motion.div>
                        ) : !caminho ? (
                          <AnexoPlaceholder key="empty" icon={Image} label="Nenhum anexo disponível" />
                        ) : isPdf && blobUrl ? (
                          <motion.iframe
                            key="pdf"
                            src={blobUrl}
                            className="h-full w-full"
                            title="Anexo PDF"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          />
                        ) : isImage && blobUrl && !imgError ? (
                          <motion.img
                            key="img"
                            src={blobUrl}
                            alt={`Anexo — ${selectedDespesa.descricao}`}
                            className="h-full w-full object-contain"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onError={() => setImgError(true)}
                          />
                        ) : imgError ? (
                          <AnexoPlaceholder key="error" icon={ImageBroken} label="Não foi possível carregar o anexo" />
                        ) : (
                          <AnexoPlaceholder key="unsupported" icon={FileX} label="Formato de arquivo não suportado" />
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Dados da despesa */}
                    <div className="space-y-3 p-5">
                      <div className="grid grid-cols-2 gap-3">
                        {(
                          [
                            { label: "Data", value: formatarData(selectedDespesa.data_despesa) },
                            { label: "Valor", value: selectedDespesa.valor ? formatarMoeda(parseFloat(selectedDespesa.valor)) : "—" },
                            { label: "Categoria", value: selectedDespesa.categoria_despesa?.descricao ?? "—" },
                            { label: "Centro de Custo", value: selectedDespesa.centro_de_custo?.descricao ?? "—" },
                          ] as const
                        ).map(({ label, value }) => (
                          <div key={label} className="rounded-xl bg-app-surface-raised/30 p-3">
                            <p className="mb-0.5 text-small text-app-text-muted">{label}</p>
                            <p className="line-clamp-2 text-caption font-semibold text-app-text">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl bg-app-surface-raised/30 p-3">
                        <p className="mb-0.5 text-small text-app-text-muted">Descrição</p>
                        <p className="text-body-sm text-app-text">{selectedDespesa.descricao}</p>
                      </div>

                      {selectedDespesa.latitude != null && selectedDespesa.longitude != null ? (
                        <button
                          type="button"
                          onClick={() => setVerLocalizacao(true)}
                          className="w-full text-left rounded-xl bg-app-surface-raised/30 p-3 hover:bg-app-surface-raised/60 transition-colors cursor-pointer"
                        >
                          <p className="mb-0.5 flex items-center gap-1.5 text-small text-app-text-muted">
                            <MapPin size={12} />
                            Local — clique para ver no mapa
                          </p>
                          <p className="text-body-sm text-app-text">
                            {selectedDespesa.endereco ?? `${Number(selectedDespesa.latitude).toFixed(6)}, ${Number(selectedDespesa.longitude).toFixed(6)}`}
                          </p>
                        </button>
                      ) : null}
                    </div>

                    {/* Seção: Requisitante */}
                    <div className="px-5 pb-4">
                      <div className="rounded-2xl border border-app-border bg-app-surface-raised/40 p-4 space-y-3">
                        <h3 className="text-caption font-semibold text-app-text-muted uppercase tracking-wide">
                          Requisitante
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-small text-app-text-muted">Nome</p>
                            <p className="text-body-sm text-app-text">{rdc.descricao_requisitante ?? "—"}</p>
                          </div>
                          <div>
                            <p className="text-small text-app-text-muted">Setor</p>
                            <p className="text-body-sm text-app-text">{rdc.setor_requisitante ?? "—"}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-small text-app-text-muted">CPF / CNPJ</p>
                            <p className="text-body-sm text-app-text">{rdc.cpf_cnpj_requisitante ?? "—"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Seção: Observações */}
                    {rdc.obs && (
                      <div className="px-5 pb-4">
                        <div className="rounded-2xl border border-app-border bg-app-surface-raised/40 p-4 space-y-2">
                          <h3 className="text-caption font-semibold text-app-text-muted uppercase tracking-wide">
                            Observações
                          </h3>
                          <p className="text-body-sm text-app-text whitespace-pre-line">{rdc.obs}</p>
                        </div>
                      </div>
                    )}

                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex min-h-[240px] items-center justify-center text-app-text-muted"
                  >
                    <p className="text-body-sm">Selecione uma despesa</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* Rodapé — Ações */}
        {eRascunho && (
          <div className="shrink-0 border-t border-app-border bg-app-surface px-5 py-4">
            {confirmando ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/60 p-4 space-y-3">
                <p className="text-body-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                  Após o envio o RDC ficará bloqueado para edição e seguirá para aprovação do auditor.
                </p>
                <div className="flex gap-2 md:justify-end">
                  <Button
                    variant="light"
                    size="sm"
                    disabled={submetendo}
                    onClick={() => setConfirmando(false)}
                    className="flex-1 md:flex-none"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="dark"
                    size="sm"
                    disabled={submetendo}
                    onClick={handleConfirmar}
                    className="flex-1 md:flex-none"
                  >
                    {submetendo ? (
                      <span className="flex items-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                          className="inline-block"
                        >
                          <CircleNotch size={14} />
                        </motion.span>
                        Enviando…
                      </span>
                    ) : (
                      "Confirmar envio"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 md:justify-end">
                <Button variant="outlined" onClick={onEditar} className="flex-1 md:flex-none">
                  <PencilSimple size={14} />
                  Editar
                </Button>
                <Button variant="dark" onClick={() => setConfirmando(true)} className="flex-1 md:flex-none">
                  <PaperPlaneTilt size={14} />
                  Solicitar
                </Button>
              </div>
            )}
          </div>
        )}

        {eEmAnalise && (onAprovar || onRejeitar) && (
          <div className="flex shrink-0 gap-3 border-t border-app-border bg-app-surface px-5 py-4 md:justify-end">
            {onRejeitar && (
              <Button
                variant="outlined"
                onClick={() => setConfirmarRejeicao(true)}
                disabled={rejeitando}
                className="flex-1 md:flex-none"
              >
                Rejeitar
              </Button>
            )}
            {onAprovar && (
              <Button variant="dark" onClick={() => onAprovar(rdc)} className="flex-1 md:flex-none">
                Aprovar
              </Button>
            )}
          </div>
        )}

        {eAprovado && onAgendar && (
          <div className="flex shrink-0 gap-3 border-t border-app-border bg-app-surface px-5 py-4 md:justify-end">
            <Button variant="dark" onClick={() => onAgendar(rdc)} className="flex-1 md:flex-none">
              Agendar Pagamento
            </Button>
          </div>
        )}

        {eAgendado && onMarcarPago && (
          <div className="flex shrink-0 gap-3 border-t border-app-border bg-app-surface px-5 py-4 md:justify-end">
            <Button variant="dark" onClick={() => onMarcarPago(rdc)} className="flex-1 md:flex-none">
              Marcar como Pago
            </Button>
          </div>
        )}

        {/* Download PDF */}
        {rdc.status >= 4 && rdc.status !== 7 && onBaixarPdf && (
          <div className="flex shrink-0 border-t border-app-border bg-app-surface px-5 py-4 md:justify-end">
            <motion.button
              onClick={() => onBaixarPdf(rdc.id)}
              whileHover={{ x: 3 }}
              transition={{ duration: 0.12 }}
              className="flex w-full justify-center md:w-auto cursor-pointer items-center gap-2 text-caption font-semibold text-brand hover:underline"
            >
              <FilePdf size={18} />
              Baixar PDF
            </motion.button>
          </div>
        )}
      </motion.div>
      {localizacaoAtual && (
        <VisualizadorLocalizacao
          open={verLocalizacao}
          onClose={() => setVerLocalizacao(false)}
          localizacao={localizacaoAtual}
        />
      )}

      <ConfirmModal
        open={confirmarRejeicao}
        title="Rejeitar Solicitação ?"
        description="A solicitação será marcada como rejeitada e o prestador precisará criar uma nova se quiser submeter novamente."
        confirmLabel="Rejeitar"
        loadingLabel="Rejeitando…"
        loading={rejeitando}
        onConfirm={handleConfirmarRejeicao}
        onCancel={() => { if (!rejeitando) { setConfirmarRejeicao(false); setMotivoRejeicao(""); } }}
      >
        <textarea
          value={motivoRejeicao}
          onChange={(e) => setMotivoRejeicao(e.target.value)}
          placeholder="Justificativa (opcional)"
          rows={3}
          className="w-full rounded-xl border border-app-border bg-app-surface-raised/40 px-3 py-2 text-body-sm text-app-text placeholder:text-app-text-subtle resize-none focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </ConfirmModal>
    </>
  );
}
