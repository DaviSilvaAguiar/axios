"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  PencilSimple,
  Trash,
  X,
  CalendarCheck,
  XCircle,
  Receipt,
  ForkKnife,
  Car,
  House,
  Airplane,
  DotsThreeVertical,
  Plus,
  Eye,
  ClockCountdown,
  MagnifyingGlass,
  CheckCircle,
  Wallet,
} from "@phosphor-icons/react";
import { type Icon } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/ui/Card";
import Loading from "@/ui/Loading";
import Button from "@/ui/Button";
import FormRcm from "@/features/rcm/components/FormRcm";
import { toast } from "@/lib/toast";
import {
  buscarRcmApi,
  deletarRcmApi,
  atualizarRcmApi,
  criarDespesaRcmApi,
  atualizarDespesaRcmApi,
  deletarDespesaRcmApi,
  adicionarAnexoRcmApi,
  deletarAnexoEspecificoRcmApi,
  buscarAnexoEspecificoRcmApi,
} from "@/features/rcm/rcm.api";
import { RCM_STATUS_LABEL } from "@/features/rcm/rcm.types";
import type { Rcm, RcmStatus, StoreRcmWithDespesasFormData } from "@/features/rcm/rcm.types";
import type { AnexoParaAdicionar, AnexoParaDeletar } from "@/features/rcm/components/FormRcm";

function fmtValor(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtData(iso: string) {
  const [y, m, d] = iso.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
}

function fmtDataCurta(iso: string) {
  const [, m, d] = iso.split("T")[0].split("-");
  return `${d}/${m}`;
}

function getCategoriaIcon(descricao: string | undefined | null): Icon {
  if (!descricao) return Receipt;
  const d = descricao.toLowerCase();
  if (/alimenta|refeição|almoço|jantar|lanche|restaurante/.test(d)) return ForkKnife;
  if (/combustível|gasolina|etanol|diesel|transporte|uber|taxi|táxi|ônibus/.test(d)) return Car;
  if (/hospedagem|hotel|pousada|airbnb/.test(d)) return House;
  if (/passagem|avião|aéreo|voo|flight/.test(d)) return Airplane;
  return Receipt;
}

function getCategoriaColors(descricao: string | undefined | null): { bg: string; fg: string } {
  if (!descricao) return { bg: "bg-app-surface-raised", fg: "text-app-text-muted" };
  const d = descricao.toLowerCase();
  if (/alimenta|refeição|almoço|jantar|lanche|restaurante/.test(d))
    return { bg: "bg-amber-100 dark:bg-amber-950/60", fg: "text-amber-700 dark:text-amber-300" };
  if (/combustível|gasolina|etanol|diesel|transporte|uber|taxi|táxi|ônibus/.test(d))
    return { bg: "bg-blue-100 dark:bg-blue-950/60", fg: "text-blue-700 dark:text-blue-300" };
  if (/hospedagem|hotel|pousada|airbnb/.test(d))
    return { bg: "bg-purple-100 dark:bg-purple-950/60", fg: "text-purple-700 dark:text-purple-300" };
  if (/passagem|avião|aéreo|voo|flight/.test(d))
    return { bg: "bg-indigo-100 dark:bg-indigo-950/60", fg: "text-indigo-700 dark:text-indigo-300" };
  return { bg: "bg-app-surface-raised", fg: "text-app-text-muted" };
}

// ── Status mini-card ────────────────────────────────────────────

const STATUS_MINI_CONFIG: Record<
  number,
  { icon: Icon; bg: string; border: string; fg: string; helperFg: string; helper: string }
> = {
  1: {
    icon: ClockCountdown,
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-200 dark:border-blue-800",
    fg: "text-blue-700 dark:text-blue-300",
    helperFg: "text-blue-600/80 dark:text-blue-400/80",
    helper: "Aguardando aprovação",
  },
  2: {
    icon: MagnifyingGlass,
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
    fg: "text-amber-700 dark:text-amber-300",
    helperFg: "text-amber-600/80 dark:text-amber-400/80",
    helper: "Em análise financeira",
  },
  3: {
    icon: CheckCircle,
    bg: "bg-green-50 dark:bg-green-950/40",
    border: "border-green-200 dark:border-green-800",
    fg: "text-green-700 dark:text-green-300",
    helperFg: "text-green-600/80 dark:text-green-400/80",
    helper: "Aprovado para pagamento",
  },
  4: {
    icon: CalendarCheck,
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-200 dark:border-purple-800",
    fg: "text-purple-700 dark:text-purple-300",
    helperFg: "text-purple-600/80 dark:text-purple-400/80",
    helper: "Pagamento agendado",
  },
  5: {
    icon: Wallet,
    bg: "bg-app-surface-raised",
    border: "border-app-border",
    fg: "text-app-text",
    helperFg: "text-app-text-muted",
    helper: "Reembolso concluído",
  },
  6: {
    icon: XCircle,
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-200 dark:border-red-900",
    fg: "text-red-600 dark:text-red-400",
    helperFg: "text-red-500/80 dark:text-red-400/70",
    helper: "Solicitação rejeitada",
  },
};


// ── Anexo thumbnail ─────────────────────────────────────────────

interface AnexoThumbnailProps {
  rcmId: number;
  despesaId: number;
  idAnexo: number;
  caminho: string;
  onAbrir: () => void;
}

function AnexoThumbnailItem({ rcmId, despesaId, idAnexo, caminho, onAbrir }: AnexoThumbnailProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const isImage = /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(caminho);

  useEffect(() => {
    let url: string;
    buscarAnexoEspecificoRcmApi(rcmId, despesaId, idAnexo)
      .then((blob) => {
        url = URL.createObjectURL(blob);
        setSrc(url);
      })
      .catch(() => setSrc(null))
      .finally(() => setCarregando(false));
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [rcmId, despesaId, idAnexo]);

  const baseClass =
    "group relative h-16 w-16 rounded-xl shrink-0 border border-app-border overflow-hidden cursor-pointer transition";

  if (carregando) {
    return <div className={`${baseClass} animate-pulse bg-app-surface-raised`} />;
  }

  if (isImage && src) {
    return (
      <button onClick={onAbrir} className={`${baseClass} p-0`} type="button">
        <img src={src} alt="Anexo" className="h-full w-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
          <Eye size={18} weight="bold" className="text-white" />
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onAbrir}
      className={`${baseClass} bg-app-surface-raised flex items-center justify-center hover:bg-app-surface-raised-hover`}
      type="button"
    >
      <Eye size={20} className="text-app-text-muted" />
    </button>
  );
}

// ── Modal exclusão ──────────────────────────────────────────────

interface ModalConfirmarProps {
  titulo: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  carregando: boolean;
}

function ModalConfirmar({ titulo, onConfirmar, onCancelar, carregando }: ModalConfirmarProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.45)" }}
      onMouseDown={onCancelar}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        className="w-full max-w-sm rounded-2xl bg-app-surface p-6 space-y-5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="space-y-1.5">
          <h2 className="text-feature-title text-app-text">{titulo}</h2>
          <p className="text-small text-app-text-muted">
            Esta ação não pode ser desfeita. O registro será removido permanentemente.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="light" fullWidth onClick={onCancelar} disabled={carregando}>
            Cancelar
          </Button>
          <Button
            variant="dark"
            fullWidth
            onClick={onConfirmar}
            disabled={carregando}
            className="!bg-red-600 hover:!bg-red-700"
          >
            {carregando ? "Excluindo…" : "Excluir"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Página ──────────────────────────────────────────────────────

export default function DetalheRcmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [rcm, setRcm] = useState<Rcm | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirmarExclusao, setShowConfirmarExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [despesaParaExcluir, setDespesaParaExcluir] = useState<number | null>(null);
  const [excluindoDespesa, setExcluindoDespesa] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    buscarRcmApi(Number(id))
      .then(setRcm)
      .catch(() => setErro("Não foi possível carregar a prestação de contas."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!showMenu) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  async function handleExcluir() {
    setExcluindo(true);
    try {
      await deletarRcmApi(Number(id));
      toast.success("Prestação de contas excluída com sucesso.");
      router.push("/meus-reembolsos");
    } catch {
      toast.error("Erro ao excluir a prestação de contas.");
      setExcluindo(false);
      setShowConfirmarExclusao(false);
    }
  }

  async function handleExcluirDespesa() {
    if (!rcm || despesaParaExcluir === null) return;
    setExcluindoDespesa(true);
    try {
      await deletarDespesaRcmApi(rcm.id, despesaParaExcluir);
      toast.success("Despesa excluída.");
      setDespesaParaExcluir(null);
      const atualizado = await buscarRcmApi(rcm.id);
      setRcm(atualizado);
    } catch {
      toast.error("Erro ao excluir a despesa.");
    } finally {
      setExcluindoDespesa(false);
    }
  }

  async function handleSalvarEdicao(
    dados: StoreRcmWithDespesasFormData,
    deletarDespesaIds: number[],
    deletarAnexos: AnexoParaDeletar[],
    adicionarAnexos: AnexoParaAdicionar[]
  ) {
    if (!rcm) return;
    try {
      const { despesas, ...rcmDados } = dados;

      await atualizarRcmApi(rcm.id, rcmDados);

      for (const idDespesa of deletarDespesaIds) {
        await deletarDespesaRcmApi(rcm.id, idDespesa);
      }

      for (const { idDespesa, idAnexo } of deletarAnexos) {
        await deletarAnexoEspecificoRcmApi(rcm.id, idDespesa, idAnexo);
      }

      for (const { idDespesa, file } of adicionarAnexos) {
        await adicionarAnexoRcmApi(rcm.id, idDespesa, file);
      }

      for (const despesa of despesas) {
        if (despesa.despesaId) {
          await atualizarDespesaRcmApi(rcm.id, despesa.despesaId, {
            data_despesa: despesa.data_despesa,
            valor: despesa.valor,
            id_centro_custo: despesa.id_centro_custo,
            descricao: despesa.descricao,
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
          await criarDespesaRcmApi(rcm.id, fd);
        }
      }

      toast.success("Prestação de contas atualizada com sucesso!");
      setShowForm(false);
      const atualizado = await buscarRcmApi(rcm.id);
      setRcm(atualizado);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    }
  }

  async function abrirAnexo(idRcm: number, idDespesa: number, idAnexo: number) {
    try {
      const blob = await buscarAnexoEspecificoRcmApi(idRcm, idDespesa, idAnexo);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      toast.error("Não foi possível abrir o anexo.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading />
      </div>
    );
  }

  if (erro || !rcm) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-small font-semibold text-app-text-muted hover:text-app-text mb-4"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center">
          <p className="text-small text-red-700">{erro ?? "Prestação de contas não encontrada."}</p>
        </div>
      </div>
    );
  }

  const despesas = rcm.despesas ?? [];
  const valorTotal = despesas.reduce((acc, d) => acc + parseFloat(d.valor), 0);
  const podeEditar = rcm.status === 1;
  const temBanco = Boolean(rcm.banco || rcm.chave_pix || rcm.agencia || rcm.numero_banco);

  return (
    <>
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6 pb-8">
        {/* Voltar + status badge */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/meus-reembolsos")}
            className="flex items-center gap-1.5 text-small font-semibold text-app-text-muted hover:text-app-text -ml-0.5"
          >
            <ArrowLeft size={16} />
            Meus Reembolsos
          </button>
          {(() => {
            const cfg = STATUS_MINI_CONFIG[rcm.status] ?? STATUS_MINI_CONFIG[1];
            const StatusIcon = cfg.icon;
            return (
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-semibold ${cfg.bg} ${cfg.border} ${cfg.fg}`}>
                <StatusIcon size={13} weight="bold" />
                {RCM_STATUS_LABEL[rcm.status]}
              </span>
            );
          })()}
        </div>

        {/* Header */}
        <Card className="p-5 sm:p-6">
          {/* título + menu */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-app-text leading-snug break-words">
                {rcm.titulo}
              </h1>
              <p className="text-[13px] text-app-text-subtle mt-2 leading-snug">
                #{rcm.id}
                <span className="mx-1.5 opacity-60">•</span>
                {fmtData(rcm.created_at)}
                <span className="mx-1.5 opacity-60">•</span>
                {fmtDataCurta(rcm.data_inicio_periodo)} a {fmtDataCurta(rcm.data_fim_periodo)}
              </p>
            </div>

            {podeEditar && (
              <div ref={menuRef} className="relative shrink-0">
                <button
                  onClick={() => setShowMenu((v) => !v)}
                  className="h-10 w-10 flex items-center justify-center rounded-xl text-app-text-muted hover:text-app-text hover:bg-app-hover transition-colors"
                >
                  <DotsThreeVertical size={22} weight="bold" />
                </button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-1 bg-app-surface border border-app-border rounded-xl shadow-lg p-1 z-20 min-w-[160px]"
                    >
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowForm(true);
                        }}
                        className="flex items-center gap-2 px-3 py-2.5 text-base text-app-text hover:bg-app-hover rounded-lg w-full text-left transition-colors"
                      >
                        <PencilSimple size={16} />
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowConfirmarExclusao(true);
                        }}
                        className="flex items-center gap-2 px-3 py-2.5 text-base text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg w-full text-left transition-colors"
                      >
                        <Trash size={16} />
                        Excluir
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

        </Card>

        {/* Hero Stat — valor total */}
        <Card className="p-6 sm:py-10 text-center">
          <p className="text-[13px] font-semibold uppercase tracking-widest text-app-text-muted">
            Valor Total a Receber
          </p>
          <p className="text-4xl sm:text-5xl font-bold text-app-text mt-3 break-words">
            {fmtValor(valorTotal)}
          </p>
          <p className="text-base text-app-text-subtle mt-3">
            {despesas.length} {despesas.length === 1 ? "despesa registrada" : "despesas registradas"}
          </p>
        </Card>

        {/* Dados bancários + alertas */}
        {(temBanco || (rcm.status === 5 && rcm.data_pagamento_programado) ||
          (rcm.status === 7 && rcm.motivo_rejeicao)) && (
          <Card className="p-4 sm:p-5 space-y-4">
            {temBanco && (
              <div className="space-y-3">
                <p className="text-[13px] font-semibold uppercase tracking-widest text-app-text-muted">
                  Dados bancários
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {rcm.banco && (
                    <div>
                      <p className="text-[13px] text-app-text-subtle">Banco</p>
                      <p className="text-base text-app-text mt-0.5">{rcm.banco}</p>
                    </div>
                  )}
                  {rcm.agencia && (
                    <div>
                      <p className="text-[13px] text-app-text-subtle">Agência</p>
                      <p className="text-base text-app-text mt-0.5">{rcm.agencia}</p>
                    </div>
                  )}
                  {rcm.numero_banco && (
                    <div>
                      <p className="text-[13px] text-app-text-subtle">Conta</p>
                      <p className="text-base text-app-text mt-0.5">{rcm.numero_banco}</p>
                    </div>
                  )}
                  {rcm.chave_pix && (
                    <div className="col-span-2">
                      <p className="text-[13px] text-app-text-subtle">Chave Pix</p>
                      <p className="text-base text-app-text mt-0.5 truncate">{rcm.chave_pix}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {rcm.status === 5 && rcm.data_pagamento_programado && (
              <div className="flex items-center gap-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 px-4 py-3">
                <CalendarCheck size={20} className="text-purple-600 dark:text-purple-400 shrink-0" />
                <div>
                  <p className="text-base font-semibold text-purple-700 dark:text-purple-300 leading-tight">
                    Pagamento Agendado
                  </p>
                  <p className="text-base text-purple-600 dark:text-purple-400 leading-tight mt-0.5">
                    {fmtData(rcm.data_pagamento_programado)}
                  </p>
                </div>
              </div>
            )}

            {rcm.status === 7 && rcm.motivo_rejeicao && (
              <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-4 py-3">
                <XCircle size={20} className="text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-base font-semibold text-red-700 dark:text-red-300 leading-tight">
                    Motivo da Rejeição
                  </p>
                  <p className="text-base text-red-600 dark:text-red-400 leading-snug mt-1">
                    {rcm.motivo_rejeicao}
                  </p>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Lista de Despesas */}
        <div className="space-y-3">
          <p className="text-[13px] font-semibold text-app-text-muted uppercase tracking-widest px-1">
            Despesas ({despesas.length})
          </p>

          {despesas.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-base text-app-text-subtle">Nenhuma despesa registrada.</p>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {despesas.map((despesa) => {
                const CategoriaIcon = getCategoriaIcon(despesa.categoria_despesa?.descricao);
                const cores = getCategoriaColors(despesa.categoria_despesa?.descricao);
                return (
                  <div key={despesa.id} className="relative">
                    {podeEditar && (
                      <button
                        onClick={() => setDespesaParaExcluir(despesa.id)}
                        className="absolute -top-3 -right-3 z-10 h-7 w-7 flex items-center justify-center rounded-full bg-app-surface border border-app-border text-app-text-muted hover:text-red-600 hover:border-red-300 dark:hover:border-red-800 transition-colors shadow-sm"
                        type="button"
                      >
                        <X size={13} weight="bold" />
                      </button>
                    )}
                  <Card className="p-4">
                    {/* Linha principal: ícone + descrição + metadata */}
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${cores.bg}`}>
                        <CategoriaIcon size={20} className={cores.fg} weight="bold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-base font-semibold text-app-text leading-snug">
                            {despesa.descricao}
                          </p>
                          <span className="text-[13px] text-app-text-subtle shrink-0 mt-0.5">
                            {fmtData(despesa.data_despesa)}
                          </span>
                        </div>
                        {despesa.centro_de_custo && (
                          <p className="text-[13px] text-app-text-subtle mt-1.5">
                            {despesa.centro_de_custo.descricao}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Valor */}
                    <div className="mt-3 pt-3 border-t border-app-border-subtle">
                      <p className="text-lg font-bold text-app-text">
                        {fmtValor(parseFloat(despesa.valor))}
                      </p>
                    </div>

                    {/* Anexos */}
                    {(despesa.anexos ?? []).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-app-border-subtle flex gap-2 overflow-x-auto scrollbar-none">
                        {(despesa.anexos ?? []).map((anexo) => (
                          <AnexoThumbnailItem
                            key={anexo.id}
                            rcmId={rcm.id}
                            despesaId={despesa.id}
                            idAnexo={anexo.id}
                            caminho={anexo.caminho}
                            onAbrir={() => abrirAnexo(rcm.id, despesa.id, anexo.id)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Editar */}
                    {podeEditar && (
                      <button
                        onClick={() => setShowForm(true)}
                        className="mt-3 pt-3 border-t border-app-border-subtle w-full flex items-center justify-center gap-1.5 text-[13px] font-semibold text-app-text-muted hover:text-app-text active:bg-app-hover active:text-app-text rounded-b-2xl transition-colors"
                        type="button"
                      >
                        <PencilSimple size={13} />
                        Editar
                      </button>
                    )}
                  </Card>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {podeEditar && (
          <Button variant="dark" fullWidth onClick={() => setShowForm(true)}>
            <Plus size={18} weight="bold" />
            Adicionar Despesa
          </Button>
        )}
      </div>

      {/* Modal de edição */}
      <AnimatePresence>
        {showForm && (
          <FormRcm
            rcmInicial={rcm}
            onSalvar={handleSalvarEdicao}
            onFechar={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Modal de exclusão */}
      <AnimatePresence>
        {showConfirmarExclusao && (
          <ModalConfirmar
            titulo="Excluir prestação de contas?"
            onConfirmar={handleExcluir}
            onCancelar={() => setShowConfirmarExclusao(false)}
            carregando={excluindo}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {despesaParaExcluir !== null && (
          <ModalConfirmar
            titulo="Excluir despesa?"
            onConfirmar={handleExcluirDespesa}
            onCancelar={() => setDespesaParaExcluir(null)}
            carregando={excluindoDespesa}
          />
        )}
      </AnimatePresence>
    </>
  );
}
