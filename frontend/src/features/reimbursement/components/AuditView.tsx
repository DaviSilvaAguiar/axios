"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  type Icon,
  X,
  FilePdf,
  Image,
  ImageBroken,
  FileX,
  CalendarCheck,
  ArrowRight,
  ArrowLeft,
  CircleNotch,
  Package,
  MapPin,
} from "@phosphor-icons/react";
import Button from "@/ui/Button";
import StatusTag from "./StatusTag";
import ModalRejeicao from "./ModalRejeicao";
import VisualizadorLocalizacao from "@/features/geolocalizacao/components/VisualizadorLocalizacao";
import { type DespesaRcm, type Rcm } from "../rcm.types";
import { buscarAnexoRcmApi } from "../rcm.api";
import { formatarData } from "@/lib/formatters";

const SPRING = { type: "spring" as const, stiffness: 380, damping: 30 };

function formatarValor(v: string | number): string {
  return parseFloat(String(v)).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function gerarIniciais(nome?: string): string {
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
  rcm: Rcm;
  onFechar: () => void;
  onAprovar: (id: number) => Promise<void>;
  onRejeitar: (id: number, motivo: string) => Promise<void>;
  onBaixarPdf: (id: number) => Promise<void>;
}

export default function AuditoriaView({ rcm, onFechar, onAprovar, onRejeitar, onBaixarPdf }: Props) {
  const despesas = rcm.despesas ?? [];
  const [selectedDespesa, setSelectedDespesa] = useState<DespesaRcm | null>(despesas[0] ?? null);
  const [showModalRejeicao, setShowModalRejeicao] = useState(false);
  const [loadingAprovar, setLoadingAprovar] = useState(false);
  const [painelMobile, setPainelMobile] = useState<"lista" | "detalhe">("lista");
  const [verLocalizacao, setVerLocalizacao] = useState(false);

  const total = despesas.reduce((acc, d) => acc + parseFloat(d.valor), 0);

  const caminho = selectedDespesa?.anexos?.[0]?.caminho ?? null;
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

    if (!caminho || !selectedDespesa) return;

    let cancelled = false;
    setLoadingAnexo(true);

    buscarAnexoRcmApi(rcm.id, selectedDespesa.id)
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
  }, [selectedDespesa?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAprovar() {
    setLoadingAprovar(true);
    try {
      await onAprovar(rcm.id);
    } finally {
      setLoadingAprovar(false);
    }
  }

  async function handleRejeitar(motivo: string) {
    await onRejeitar(rcm.id, motivo);
    setShowModalRejeicao(false);
  }

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
              {gerarIniciais(rcm.usuario?.nome)}
            </div>
            <div className="min-w-0">
              <h2 className="text-feature-title text-app-text truncate">{rcm.titulo}</h2>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                <span className="text-small text-app-text-muted">{rcm.usuario?.nome ?? "—"}</span>
                <span className="text-[10px] text-app-text-subtle">·</span>
                <span className="text-small text-app-text-muted">
                  {formatarData(rcm.data_inicio_periodo)}
                </span>
                <ArrowRight size={11} className="text-app-text-subtle" />
                <span className="text-small text-app-text-muted">
                  {formatarData(rcm.data_fim_periodo)}
                </span>
              </div>
              {rcm.lote_exportacao && (
                <div className="mt-1 flex items-center gap-1.5">
                  <Package size={11} className="text-brand" weight="fill" />
                  <span className="text-small text-app-text-muted">
                    Exportado no lote #{rcm.lote_exportacao.id} em{" "}
                    {formatarDataHora(rcm.lote_exportacao.created_at)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0">
            <StatusTag status={rcm.status} />
            <button
              onClick={onFechar}
              className="rounded-full p-2 text-app-text-muted transition-colors hover:bg-app-hover"
            >
              <X size={18} />
            </button>
          </div>
        </div>

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
                          layoutId="active-indicator"
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
                            {formatarValor(d.valor)}
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
                  {formatarValor(total)}
                </span>
              </div>
            )}

            {(rcm.banco || rcm.agencia || rcm.numero_banco || rcm.chave_pix) && (
              <div className="shrink-0 border-t border-app-border bg-app-surface px-5 py-4 space-y-2">
                <p className="text-small font-semibold text-app-text-muted uppercase tracking-wide">
                  Dados para Pagamento
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {rcm.banco && (
                    <div>
                      <p className="text-small text-app-text-muted">Banco</p>
                      <p className="text-caption font-semibold text-app-text">{rcm.banco}</p>
                    </div>
                  )}
                  {rcm.agencia && (
                    <div>
                      <p className="text-small text-app-text-muted">Agência</p>
                      <p className="text-caption font-semibold text-app-text">{rcm.agencia}</p>
                    </div>
                  )}
                  {rcm.numero_banco && (
                    <div>
                      <p className="text-small text-app-text-muted">Conta</p>
                      <p className="text-caption font-semibold text-app-text">{rcm.numero_banco}</p>
                    </div>
                  )}
                  {rcm.chave_pix && (
                    <div className="col-span-2">
                      <p className="text-small text-app-text-muted">Chave Pix</p>
                      <p className="text-caption font-semibold text-app-text">{rcm.chave_pix}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Painel direito — área de trabalho */}
          <div className={`flex flex-col overflow-hidden md:w-3/5 ${painelMobile === "lista" ? "hidden md:flex" : "flex"}`}>
            {/* Botão voltar (somente mobile) */}
            <button
              onClick={() => setPainelMobile("lista")}
              className="md:hidden flex items-center gap-1.5 px-4 py-2.5 border-b border-app-border text-small font-semibold text-app-text-muted hover:bg-app-hover transition-colors"
            >
              <ArrowLeft size={15} />
              Voltar às despesas
            </button>
            {/* Área scrollável */}
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
                            { label: "Valor", value: formatarValor(selectedDespesa.valor) },
                            { label: "Categoria", value: selectedDespesa.categoria_despesa?.descricao ?? "—" },
                            {
                              label: "Centro de Custo",
                              value: selectedDespesa.centro_de_custo?.descricao ?? "—",
                            },
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

                    {/* Pagamento agendado */}
                    {rcm.status === 5 && rcm.data_pagamento_programado && (
                      <div className="mx-5 mb-4 flex items-center gap-3 rounded-2xl border border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/60 px-4 py-3">
                        <CalendarCheck size={18} className="shrink-0 text-purple-600 dark:text-purple-400" />
                        <div>
                          <p className="text-caption font-semibold text-purple-700 dark:text-purple-300">
                            Pagamento Programado
                          </p>
                          <p className="text-small text-purple-600 dark:text-purple-400">
                            {formatarData(rcm.data_pagamento_programado)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Motivo de rejeição */}
                    {rcm.status === 7 && rcm.motivo_rejeicao && (
                      <div className="mx-5 mb-4 rounded-2xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/60 px-4 py-3">
                        <p className="mb-0.5 text-caption font-semibold text-red-700 dark:text-red-300">
                          Motivo da Rejeição
                        </p>
                        <p className="text-small text-red-600 dark:text-red-400">{rcm.motivo_rejeicao}</p>
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

        {/* Ações do auditor */}
        {(rcm.status === 2 || rcm.status === 3) && (
          <div className="flex shrink-0 gap-3 border-t border-app-border bg-app-surface px-5 py-4 md:justify-end">
            <Button variant="outlined" onClick={() => setShowModalRejeicao(true)} className="flex-1 md:flex-none">
              Rejeitar RCM
            </Button>
            <Button variant="dark" onClick={handleAprovar} disabled={loadingAprovar} className="flex-1 md:flex-none">
              {loadingAprovar ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    <CircleNotch size={14} />
                  </motion.span>
                  Aprovando…
                </span>
              ) : (
                "Aprovar RCM"
              )}
            </Button>
          </div>
        )}

        {/* Download PDF */}
        {rcm.status >= 4 && rcm.status !== 7 && (
          <div className="flex shrink-0 border-t border-app-border bg-app-surface px-5 py-4 md:justify-end">
            <motion.button
              onClick={() => onBaixarPdf(rcm.id)}
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

      {showModalRejeicao && (
        <ModalRejeicao
          onConfirmar={handleRejeitar}
          onCancelar={() => setShowModalRejeicao(false)}
        />
      )}

      {selectedDespesa?.latitude != null && selectedDespesa?.longitude != null && (
        <VisualizadorLocalizacao
          open={verLocalizacao}
          onClose={() => setVerLocalizacao(false)}
          localizacao={{
            latitude:  Number(selectedDespesa.latitude),
            longitude: Number(selectedDespesa.longitude),
            endereco:  selectedDespesa.endereco ?? null,
          }}
        />
      )}
    </>
  );
}
