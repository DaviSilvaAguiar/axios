"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClockCounterClockwise,
  HandCoins,
  MagnifyingGlass,
  PaperPlaneTilt,
  Receipt,
  Sparkle,
} from "@phosphor-icons/react";
import Card from "@/ui/Card";
import Input from "@/ui/Input";
import Button from "@/ui/Button";
import Modal from "@/ui/Modal";
import EmptyState from "@/ui/EmptyState";
import { toast } from "@/lib/toast";
import {
  obterCaixasPendentesApi,
  obterRcmsPendentesApi,
  obterStatsPendentesApi,
  obterHistoricoApi,
} from "@/features/exportacao/exportacao.api";
import type { TipoLote, StatsPendentes } from "@/features/exportacao/exportacao.types";
import { usePaginatedList } from "@/lib/usePaginatedList";
import TabelaPendentes from "@/features/exportacao/components/TabelaPendentes";
import TabelaHistorico from "@/features/exportacao/components/TabelaHistorico";
import SelectorIntegracao from "@/features/integracao/components/SelectorIntegracao";
import ModalChaveIntegracao from "@/features/integracao/components/ModalChaveIntegracao";
import ActionBarEnviarIntegracao from "@/features/integracao/components/ActionBarEnviarIntegracao";
import { listarIntegracoesApi, enviarLoteIntegracaoApi } from "@/features/integracao/integracao.api";
import type { Integracao } from "@/features/integracao/integracao.types";
import { baixarPdfRcmApi } from "@/features/rcm/rcm.api";
import { baixarPdfRdcApi } from "@/features/rdc/rdc.api";
import type { DocumentoPendente } from "@/features/exportacao/exportacao.types";
import { listarContasBancariasApi } from "@/features/conta-bancaria/conta-bancaria.api";
import type { ContaBancaria } from "@/features/conta-bancaria/conta-bancaria.types";

const fmtMoeda = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtData = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/[0.08]">
          <Icon size={18} weight="duotone" className="text-brand" />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-caption text-app-text-muted">{label}</span>
          <span className="text-feature-title text-app-text leading-tight truncate">{value}</span>
          {hint && <span className="text-small text-app-text-subtle font-normal">{hint}</span>}
        </div>
      </div>
    </Card>
  );
}

function Tab({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "relative flex items-center justify-center gap-2 px-4 py-3 cursor-pointer transition-colors",
        "max-[480px]:flex-1 max-[480px]:flex-col max-[480px]:gap-1 max-[480px]:px-2 max-[480px]:py-2.5",
        active ? "text-app-text" : "text-app-text-muted hover:text-app-text",
      ].join(" ")}
    >
      <Icon size={16} weight={active ? "fill" : "regular"} className={active ? "text-brand" : ""} />
      <span className="flex items-center gap-2">
        <span className="text-caption">{label}</span>
        <span
          className={[
            "rounded-full px-2 py-0.5 text-small ring-1",
            active
              ? "bg-brand/10 text-brand ring-brand/20"
              : "bg-[#eef0f3] text-[#5b616e] ring-[#d8dce4]",
          ].join(" ")}
        >
          {count}
        </span>
      </span>
      {active && (
        <motion.div
          layoutId="exportacao-tab-indicator"
          className="absolute left-0 right-0 -bottom-px h-0.5 bg-brand"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
    </button>
  );
}

export default function ExportacaoPage() {
  const [tab, setTab] = useState<TipoLote>("CAIXA");
  const [busca, setBusca] = useState("");
  const [selCaixa, setSelCaixa] = useState<Set<number>>(new Set());
  const [selRcm, setSelRcm] = useState<Set<number>>(new Set());

  const { items: pendentesCaixa, loading: loadingCaixa, erro: erroCaixa, hasMore: hasMoreCaixa, loadingMore: loadingMoreCaixa, carregarMais: carregarMaisCaixa, recarregar: recarregarCaixa } = usePaginatedList(obterCaixasPendentesApi);
  const { items: pendentesRcm, loading: loadingRcm, erro: erroRcm, hasMore: hasMoreRcm, loadingMore: loadingMoreRcm, carregarMais: carregarMaisRcm, recarregar: recarregarRcm } = usePaginatedList(obterRcmsPendentesApi);
  const { items: historico, loading: loadingHist, erro: erroHist, hasMore: hasMoreHist, loadingMore: loadingMoreHist, carregarMais: carregarMaisHist, recarregar: recarregarHist } = usePaginatedList(obterHistoricoApi);

  const [stats, setStats] = useState<StatsPendentes | null>(null);
  const [loadingBase, setLoadingBase] = useState(true);
  const [erroBase, setErroBase] = useState<string | null>(null);

  const [integracoes, setIntegracoes] = useState<Integracao[]>([]);
  const [loadingIntegracoes, setLoadingIntegracoes] = useState(true);
  const [integracaoModal, setIntegracaoModal] = useState<Integracao | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const [contasBancarias, setContasBancarias] = useState<ContaBancaria[]>([]);
  const [loadingContas, setLoadingContas] = useState(false);
  const [contaSelecionadaId, setContaSelecionadaId] = useState<number | null>(null);

  const carregarIntegracoes = useCallback(async () => {
    setLoadingIntegracoes(true);
    try {
      const { data } = await listarIntegracoesApi();
      setIntegracoes(data);
    } catch {
    } finally {
      setLoadingIntegracoes(false);
    }
  }, []);

  const carregarBase = useCallback(async () => {
    setLoadingBase(true);
    setErroBase(null);
    try {
      const s = await obterStatsPendentesApi();
      setStats(s);
    } catch {
      setErroBase("Não foi possível carregar os dados base de exportação.");
    } finally {
      setLoadingBase(false);
    }
  }, []);

  useEffect(() => {
    carregarBase();
    carregarIntegracoes();
  }, [carregarBase, carregarIntegracoes]);

  const erroGeral = erroBase || erroCaixa || erroRcm || erroHist;

  const documentos = tab === "CAIXA" ? pendentesCaixa : pendentesRcm;
  const selecao = tab === "CAIXA" ? selCaixa : selRcm;
  const setSelecao = tab === "CAIXA" ? setSelCaixa : setSelRcm;
  const isLoadingAba = tab === "CAIXA" ? loadingCaixa : loadingRcm;
  const hasMoreAba = tab === "CAIXA" ? hasMoreCaixa : hasMoreRcm;
  const loadingMoreAba = tab === "CAIXA" ? loadingMoreCaixa : loadingMoreRcm;
  const carregarMaisAba = tab === "CAIXA" ? carregarMaisCaixa : carregarMaisRcm;

  const documentosFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return documentos;
    return documentos.filter(
      (d) =>
        d.identificador.toLowerCase().includes(q) ||
        (d.descricao ?? "").toLowerCase().includes(q) ||
        d.prestador.toLowerCase().includes(q) ||
        (d.centro_custo ?? "").toLowerCase().includes(q)
    );
  }, [documentos, busca]);

  const valorSelecionado = useMemo(
    () => documentos.filter((d) => selecao.has(d.id)).reduce((s, d) => s + d.valor, 0),
    [documentos, selecao]
  );

  function toggleDoc(id: number) {
    const novo = new Set(selecao);
    if (novo.has(id)) novo.delete(id);
    else novo.add(id);
    setSelecao(novo);
  }

  function toggleTodos() {
    if (selecao.size === documentosFiltrados.length) {
      setSelecao(new Set());
    } else {
      setSelecao(new Set(documentosFiltrados.map((d) => d.id)));
    }
  }

  function trocarTab(novo: TipoLote) {
    setTab(novo);
    setBusca("");
  }

  const integracaoAtiva = integracoes.find((i) => i.configurada) ?? integracoes[0] ?? null;

  const contasDisponiveis = useMemo(
    () => contasBancarias.filter((c) => c.ativo && c.codigo_erp && c.codigo_erp.trim() !== ""),
    [contasBancarias]
  );

  async function abrirConfirmacao() {
    if (!integracaoAtiva?.configurada || selecao.size === 0) return;
    setConfirmando(true);
    setLoadingContas(true);
    try {
      const res = await listarContasBancariasApi(1, 100);
      setContasBancarias(res.data);
      const elegiveis = res.data.filter((c) => c.ativo && c.codigo_erp && c.codigo_erp.trim() !== "");
      setContaSelecionadaId(elegiveis[0]?.id ?? null);
    } catch {
      toast.error("Não foi possível carregar as contas bancárias.");
    } finally {
      setLoadingContas(false);
    }
  }

  async function handleEnviar() {
    if (!integracaoAtiva?.configurada || contaSelecionadaId === null) return;
    setEnviando(true);
    try {
      const ids = Array.from(selecao);
      const { data } = await enviarLoteIntegracaoApi(tab, integracaoAtiva.id, contaSelecionadaId, ids);
      if (data.sucessos > 0) {
        toast.success(`${data.sucessos} lançamento(s) enviado(s) para ${integracaoAtiva.nome}.`);
      }
      if (data.falhas.length > 0) {
        toast.error(`${data.falhas.length} falha(s): ${data.falhas[0].erro}`);
      }
      setSelecao(new Set());
      setConfirmando(false);
      carregarBase();
      recarregarCaixa();
      recarregarRcm();
      recarregarHist();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível enviar o lote.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleBaixarPdfPendente(doc: DocumentoPendente) {
    try {
      const blob = doc.tipo === "CAIXA"
        ? await baixarPdfRdcApi(doc.id)
        : await baixarPdfRcmApi(doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.identificador}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível baixar o PDF.");
    }
  }

  const ultimoLote = historico[0];

  return (
    <div className="flex flex-col gap-5 p-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-card-title text-app-text">Exportação ERP</h1>
        <p className="text-body-sm text-app-text-muted">
          Selecione a integração e envie os lotes pendentes diretamente para o ERP.
        </p>
      </div>

      {erroGeral && !stats && !loadingBase ? (
        <Card>
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 m-4">
            <p className="text-body-sm text-red-700">{erroGeral}</p>
            <button
              onClick={carregarBase}
              className="mt-2 text-caption font-semibold text-brand hover:underline cursor-pointer"
            >
              Tentar novamente
            </button>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <StatCard
              icon={Receipt}
              label="Caixinhas pendentes"
              value={String(stats?.caixa.quantidade ?? 0)}
              hint={`${fmtMoeda(stats?.caixa.valor ?? 0)} acumulados`}
            />
            <StatCard
              icon={HandCoins}
              label="Reembolsos pendentes"
              value={String(stats?.reembolso.quantidade ?? 0)}
              hint={`${fmtMoeda(stats?.reembolso.valor ?? 0)} acumulados`}
            />
            <StatCard
              icon={ClockCounterClockwise}
              label="Último lote exportado"
              value={ultimoLote ? fmtData(ultimoLote.created_at) : "—"}
              hint={
                ultimoLote
                  ? `${ultimoLote.quantidade_itens} itens • ${ultimoLote.template_utilizado}`
                  : "Nenhum lote gerado"
              }
            />
          </div>

          <Card>
            <div className="px-2 pt-1 border-b border-app-border-subtle relative">
              <div className="flex items-center gap-1">
                <Tab
                  active={tab === "CAIXA"}
                  onClick={() => trocarTab("CAIXA")}
                  icon={Receipt}
                  label="Prestações de Contas"
                  count={stats?.caixa.quantidade ?? 0}
                />
                <Tab
                  active={tab === "REEMBOLSO"}
                  onClick={() => trocarTab("REEMBOLSO")}
                  icon={HandCoins}
                  label="Reembolsos"
                  count={stats?.reembolso.quantidade ?? 0}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 px-5 py-4 border-b border-app-border-subtle">
              <div className="flex-1 max-w-2xl">
                <Input
                  label=""
                  placeholder="Buscar por identificador, descrição, prestador ou centro de custo…"
                  icon={<MagnifyingGlass size={16} />}
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="!py-3 !text-[13px] placeholder:!text-[13px]"
                />
              </div>
              <SelectorIntegracao
                integracoes={integracoes}
                onSelecionar={setIntegracaoModal}
                loading={loadingIntegracoes}
              />
            </div>

            <div className="px-5 py-4">
              {documentosFiltrados.length === 0 && !isLoadingAba ? (
                <EmptyState
                  icon={Sparkle}
                  title={busca ? "Nenhum resultado" : "Tudo em dia"}
                  description={
                    busca
                      ? "Nenhum documento encontrado para o filtro aplicado."
                      : "Não há lotes pendentes de exportação neste momento."
                  }
                />
              ) : (
                <TabelaPendentes
                  documentos={documentosFiltrados}
                  selecao={selecao}
                  onToggle={toggleDoc}
                  onToggleTodos={toggleTodos}
                  onBaixarPdf={handleBaixarPdfPendente}
                  loading={isLoadingAba}
                  onLoadMore={carregarMaisAba}
                  hasMore={hasMoreAba}
                  loadingMore={loadingMoreAba}
                />
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between px-5 py-4 border-b border-app-border-subtle">
              <div className="flex items-center gap-2">
                <ClockCounterClockwise size={18} className="text-app-text-muted" />
                <h2 className="text-feature-title text-app-text">Histórico de exportações</h2>
              </div>
            </div>

            {historico.length === 0 && !loadingHist ? (
              <div className="p-5">
                <EmptyState
                  icon={ClockCounterClockwise}
                  title="Nenhum lote exportado ainda"
                  description="Os lotes que você gerar aparecerão aqui."
                />
              </div>
            ) : (
              <TabelaHistorico
                lotes={historico}
                loading={loadingHist}
                onLoadMore={carregarMaisHist}
                hasMore={hasMoreHist}
                loadingMore={loadingMoreHist}
              />
            )}
          </Card>
        </>
      )}

      <AnimatePresence>
        {selecao.size > 0 && !loadingBase && !erroGeral && (
          <ActionBarEnviarIntegracao
            quantidade={selecao.size}
            valorTotal={valorSelecionado}
            integracaoNome={integracaoAtiva?.nome ?? null}
            integracaoConfigurada={integracaoAtiva?.configurada ?? false}
            loading={enviando}
            onLimpar={() => setSelecao(new Set())}
            onEnviar={abrirConfirmacao}
          />
        )}
      </AnimatePresence>

      {integracaoModal && (
        <ModalChaveIntegracao
          integracao={integracaoModal}
          onFechar={() => setIntegracaoModal(null)}
          onSalvo={() => {
            setIntegracaoModal(null);
            carregarIntegracoes();
          }}
        />
      )}

      <Modal open={confirmando} onClose={() => !enviando && setConfirmando(false)}>
        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/[0.08] shrink-0">
              <PaperPlaneTilt size={18} weight="fill" className="text-brand" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-feature-title text-app-text">Enviar lançamentos?</p>
              <p className="text-body-sm text-app-text-muted leading-relaxed">
                {selecao.size} {selecao.size === 1 ? "documento será enviado" : "documentos serão enviados"}{" "}
                via API para <strong className="text-app-text">{integracaoAtiva?.nome ?? "—"}</strong>.
                Lotes enviados com sucesso não podem ser revertidos.
              </p>
              <p className="text-small text-app-text-subtle font-normal">
                Total: {fmtMoeda(valorSelecionado)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-caption font-semibold text-app-text-muted">Conta bancária</label>
            {loadingContas ? (
              <div className="text-body-sm text-app-text-muted">Carregando contas…</div>
            ) : contasDisponiveis.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                <p className="text-body-sm text-amber-800">
                  Nenhuma conta bancária ativa com código ERP cadastrada. Cadastre uma em &quot;Contas Bancárias&quot; antes de enviar.
                </p>
              </div>
            ) : (
              <select
                value={contaSelecionadaId ?? ""}
                onChange={(e) => setContaSelecionadaId(Number(e.target.value))}
                disabled={enviando}
                className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-body-sm text-app-text outline-none transition-colors focus:border-brand disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {contasDisponiveis.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.descricao}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="light" size="sm" onClick={() => setConfirmando(false)} disabled={enviando}>
              Cancelar
            </Button>
            <Button
              variant="brand"
              size="sm"
              onClick={handleEnviar}
              disabled={enviando || loadingContas || contaSelecionadaId === null}
            >
              {enviando ? "Enviando…" : "Enviar agora"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
