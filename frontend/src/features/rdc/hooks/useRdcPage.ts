import { useEffect, useState, useCallback } from "react";
import { toast } from "@/lib/toast";
import { aprovarRdcComCaixaApi } from "@/features/caixa-conta/caixa-conta.api";
import {
  listarRdcsApi,
  buscarRdcApi,
  criarRdcApi,
  criarDespesaRdcApi,
  atualizarDespesaRdcApi,
  adicionarAnexoDespesaRdcApi,
  atualizarRdcApi,
  atualizarStatusRdcApi,
  deletarRdcApi,
} from "../rdc.api";
import {
  type DespesaRdcFormItem,
  type Rdc,
  type RdcStatus,
  type StoreRdcWithDespesasFormData,
} from "../rdc.types";

// ── Helpers ─────────────────────────────────────────────────────────────────

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

// ── Tipos de filtro ──────────────────────────────────────────────────────────

export interface RdcFiltros {
  requisitante: string;
  status: string;
  dataInicio: string;
  dataFim: string;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useRdcPage() {
  // Lista e carregamento
  const [rdcs, setRdcs] = useState<Rdc[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // UI
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "lista">("kanban");
  const [filtros, setFiltros] = useState<RdcFiltros>({
    requisitante: "",
    status: "",
    dataInicio: "",
    dataFim: "",
  });

  // RDC selecionado (auditoria)
  const [rdcSelecionado, setRdcSelecionado] = useState<Rdc | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editOrigemKanban, setEditOrigemKanban] = useState(false);

  // Modais de ação
  const [rdcParaAprovar, setRdcParaAprovar] = useState<Rdc | null>(null);
  const [rdcParaRejeitar, setRdcParaRejeitar] = useState<Rdc | null>(null);
  const [rejeitando, setRejeitando] = useState(false);
  const [motivoRejeicaoKanban, setMotivoRejeicaoKanban] = useState("");
  const [rdcParaAgendar, setRdcParaAgendar] = useState<Rdc | null>(null);
  const [rdcParaExcluir, setRdcParaExcluir] = useState<Rdc | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  // ── Carregamento ────────────────────────────────────────────────────────────

  const carregar = useCallback(async () => {
    try {
      const data = await listarRdcsApi();
      setRdcs(data);
      setErro(null);
    } catch {
      setErro("Não foi possível carregar os RDCs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  function recarregar() {
    setLoading(true);
    setErro(null);
    carregar();
  }

  // ── Filtro ──────────────────────────────────────────────────────────────────

  const rdcsFiltrados = rdcs.filter((r) => {
    if (filtros.requisitante && !(r.descricao_requisitante ?? "").toLowerCase().includes(filtros.requisitante.toLowerCase())) return false;
    if (filtros.status && String(r.status) !== filtros.status) return false;
    if (filtros.dataInicio && r.created_at.slice(0, 10) < filtros.dataInicio) return false;
    if (filtros.dataFim && r.created_at.slice(0, 10) > filtros.dataFim) return false;
    return true;
  });

  // ── Mutations locais ────────────────────────────────────────────────────────

  function atualizarRdcLocal(id: number, patch: Partial<Rdc>) {
    setRdcs((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  // ── Kanban ──────────────────────────────────────────────────────────────────

  async function handleMoverRdc(id: number, novoStatus: RdcStatus) {
    const rdc = rdcs.find((r) => r.id === id);

    if (novoStatus === 3) { if (rdc) { setRdcParaAprovar(rdc); return; } }
    if (novoStatus === 6) { if (rdc) { setRdcParaRejeitar(rdc); return; } }
    if (novoStatus === 4) { if (rdc) { setRdcParaAgendar(rdc); return; } }

    try {
      await atualizarStatusRdcApi(id, novoStatus);
      atualizarRdcLocal(id, { status: novoStatus });
    } catch {
      toast.error("Não foi possível mover o RDC. Tente novamente.");
    }
  }

  // ── Aprovação ───────────────────────────────────────────────────────────────

  async function handleConfirmarAprovacao(idCaixaConta: number) {
    if (!rdcParaAprovar) return;
    try {
      await aprovarRdcComCaixaApi(rdcParaAprovar.id, idCaixaConta);
      atualizarRdcLocal(rdcParaAprovar.id, { status: 4 });
      if (rdcSelecionado?.id === rdcParaAprovar.id) {
        setRdcSelecionado((prev) => prev ? { ...prev, status: 4 } : prev);
      }
      setRdcParaAprovar(null);
      toast.success("RDC aprovado e caixa debitado.");
    } catch {
      toast.error("Não foi possível aprovar o RDC.");
    }
  }

  // ── Rejeição ────────────────────────────────────────────────────────────────

  async function handleRejeitarRdc(rdc: Rdc, motivo?: string) {
    const atualizado = await atualizarStatusRdcApi(rdc.id, 7, motivo);
    atualizarRdcLocal(atualizado.id, atualizado);
    if (rdcSelecionado?.id === rdc.id) setRdcSelecionado(atualizado);
    toast.success("RDC rejeitado.");
  }

  async function handleConfirmarRejeicao() {
    if (!rdcParaRejeitar) return;
    setRejeitando(true);
    try {
      await handleRejeitarRdc(rdcParaRejeitar, motivoRejeicaoKanban || undefined);
      setRdcParaRejeitar(null);
      setMotivoRejeicaoKanban("");
    } catch (err) {
      console.error("Erro ao rejeitar RDC:", err);
      toast.error(err instanceof Error ? err.message : "Não foi possível rejeitar o RDC.");
    } finally {
      setRejeitando(false);
    }
  }

  // ── Agendamento de pagamento ─────────────────────────────────────────────────

  async function handleConfirmarAgendamento(dataPagamento: string) {
    if (!rdcParaAgendar) return;
    try {
      const atualizado = await atualizarStatusRdcApi(rdcParaAgendar.id, 5, undefined, dataPagamento);
      atualizarRdcLocal(atualizado.id, atualizado);
      if (rdcSelecionado?.id === rdcParaAgendar.id) setRdcSelecionado(atualizado);
      setRdcParaAgendar(null);
      toast.success("Pagamento agendado com sucesso!");
    } catch {
      toast.error("Não foi possível agendar o pagamento.");
    }
  }

  async function handleMarcarPago(rdc: Rdc) {
    try {
      const atualizado = await atualizarStatusRdcApi(rdc.id, 6);
      atualizarRdcLocal(atualizado.id, atualizado);
      if (rdcSelecionado?.id === rdc.id) setRdcSelecionado(atualizado);
      toast.success("RDC marcado como pago.");
    } catch {
      toast.error("Não foi possível marcar como pago.");
    }
  }

  // ── Criação ─────────────────────────────────────────────────────────────────

  async function handleCriarRdc(dados: StoreRdcWithDespesasFormData, arquivosPorItem: File[][]) {
    let novoId: number | null = null;
    try {
      const { despesas, ...rdcDados } = dados;
      const novo = await criarRdcApi(rdcDados);
      novoId = novo.id;

      for (const [idx, despesa] of (despesas ?? []).entries()) {
        await criarDespesaRdcApi(novo.id, buildDespesaFormData(despesa, arquivosPorItem[idx] ?? []));
      }

      const rdcCompleto = await buscarRdcApi(novo.id);
      setRdcs((prev) => [rdcCompleto, ...prev]);
      setShowForm(false);
      toast.success("RDC criado com sucesso!");
    } catch (err) {
      console.error("Erro ao criar RDC:", err);
      if (novoId !== null) {
        setShowForm(false);
        toast.success("RDC criado. Atualize a lista se o item não aparecer.");
        carregar();
        return;
      }
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar o RDC.");
    }
  }

  // ── Edição ──────────────────────────────────────────────────────────────────

  async function handleEditarRdc(dados: StoreRdcWithDespesasFormData, arquivos: File[][] = []) {
    if (!rdcSelecionado) return;
    try {
      const { despesas, ...rdcDados } = dados;
      await atualizarRdcApi(rdcSelecionado.id, rdcDados);

      const existingDespesas = rdcSelecionado.despesas ?? [];
      const existingCount = existingDespesas.length;
      const despesasForm = despesas ?? [];

      for (let idx = 0; idx < existingCount; idx++) {
        const despesaOriginal = existingDespesas[idx];
        const despesaForm = despesasForm[idx];
        if (!despesaOriginal || !despesaForm) continue;
        await atualizarDespesaRdcApi(rdcSelecionado.id, despesaOriginal.id, despesaForm);
      }

      await Promise.all(
        existingDespesas.flatMap((despesaOriginal, idx) =>
          (arquivos[idx] ?? []).map((file) =>
            adicionarAnexoDespesaRdcApi(rdcSelecionado.id, despesaOriginal.id, file)
          )
        )
      );

      const novasDespesas = despesasForm.slice(existingCount);
      for (const [i, despesa] of novasDespesas.entries()) {
        await criarDespesaRdcApi(rdcSelecionado.id, buildDespesaFormData(despesa, arquivos[existingCount + i] ?? []));
      }

      const rdcCompleto = await buscarRdcApi(rdcSelecionado.id);
      atualizarRdcLocal(rdcCompleto.id, rdcCompleto);

      if (editOrigemKanban) {
        setRdcSelecionado(null);
        setEditOrigemKanban(false);
      } else {
        setRdcSelecionado(rdcCompleto);
      }
      setIsEditing(false);
      toast.success("RDC atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar RDC:", err);
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar as alterações.");
    }
  }

  // ── Submissão (Rascunho → Em Análise) ──────────────────────────────────────

  async function handleSubmeterRdc() {
    if (!rdcSelecionado) return;
    const atualizado = await atualizarStatusRdcApi(rdcSelecionado.id, 2);
    atualizarRdcLocal(atualizado.id, atualizado);
    setRdcSelecionado(null);
    toast.success("RDC enviado para aprovação!");
  }

  // ── Exclusão ────────────────────────────────────────────────────────────────

  async function handleConfirmarExclusao() {
    if (!rdcParaExcluir) return;
    setExcluindo(true);
    try {
      await deletarRdcApi(rdcParaExcluir.id);
      setRdcs((prev) => prev.filter((r) => r.id !== rdcParaExcluir.id));
      setRdcParaExcluir(null);
      toast.success("RDC excluído com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir RDC:", err);
      toast.error(err instanceof Error ? err.message : "Não foi possível excluir o RDC.");
    } finally {
      setExcluindo(false);
    }
  }

  // ── Retorno ─────────────────────────────────────────────────────────────────

  return {
    // Lista
    rdcs,
    rdcsFiltrados,
    loading,
    erro,
    recarregar,

    // UI
    showForm,
    setShowForm,
    viewMode,
    setViewMode,
    filtros,
    setFiltros,

    // Auditoria
    rdcSelecionado,
    setRdcSelecionado,
    isEditing,
    setIsEditing,
    editOrigemKanban,
    setEditOrigemKanban,

    // Modais
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

    // Handlers
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
  };
}
