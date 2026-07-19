import { api } from "@/lib/api";
import { valorParaApi } from "@/lib/formatters";
import {
  mapCaixaContaResponse,
  mapExtratoResponse,
  mapListarCaixaContasResponse,
} from "./caixa-conta.mapper";
import type {
  CaixaConta,
  ExtratoResponse,
  LancarAjusteFormData,
  LancarCreditoFormData,
  StoreCaixaContaFormData,
} from "./caixa-conta.types";

export type CaixaContaStatusFiltro = "abertos" | "fechados";

export async function listarCaixaContasApi(
  status: CaixaContaStatusFiltro = "abertos",
): Promise<CaixaConta[]> {
  const raw = await api.get<unknown>(`/v1/caixa-conta?status=${status}`);
  return mapListarCaixaContasResponse(raw);
}

export async function buscarCaixaContaApi(id: number): Promise<CaixaConta> {
  const raw = await api.get<unknown>(`/v1/caixa-conta/${id}`);
  return mapCaixaContaResponse(raw);
}

export async function criarCaixaContaApi(
  dados: StoreCaixaContaFormData,
): Promise<CaixaConta> {
  const payload = {
    ...dados,
    id_usuario:      Number(dados.id_usuario),
    id_centro_custo: Number(dados.id_centro_custo),
    tipo:            Number(dados.tipo),
  };
  const raw = await api.post<unknown>("/v1/caixa-conta", payload);
  return mapCaixaContaResponse(raw);
}

export async function atualizarCaixaContaApi(
  id: number,
  dados: Partial<StoreCaixaContaFormData>,
): Promise<CaixaConta> {
  const payload: Record<string, unknown> = { ...dados };
  if (dados.tipo !== undefined) payload.tipo = Number(dados.tipo);
  const raw = await api.put<unknown>(`/v1/caixa-conta/${id}`, payload);
  return mapCaixaContaResponse(raw);
}

export async function fecharCaixaContaApi(id: number): Promise<CaixaConta> {
  const raw = await api.post<unknown>(`/v1/caixa-conta/${id}/fechar`, {});
  return mapCaixaContaResponse(raw);
}

export async function extratoCaixaContaApi(id: number): Promise<ExtratoResponse> {
  const raw = await api.get<unknown>(`/v1/caixa-conta/${id}/extrato`);
  return mapExtratoResponse(raw);
}

export async function lancarCreditoApi(
  id: number,
  dados: LancarCreditoFormData,
): Promise<void> {
  await api.post(`/v1/caixa-conta/${id}/transacoes/credito`, {
    ...dados,
    valor: valorParaApi(dados.valor),
  });
}

export async function lancarAjusteApi(
  id: number,
  dados: LancarAjusteFormData,
): Promise<void> {
  await api.post(`/v1/caixa-conta/${id}/transacoes/ajuste`, {
    ...dados,
    subtipo: Number(dados.subtipo),
    valor:   valorParaApi(dados.valor),
  });
}

export async function aprovarRdcComCaixaApi(
  idRdc: number,
  idCaixaConta: number,
): Promise<unknown> {
  return api.post(`/v1/caixas/${idRdc}/aprovar`, {
    id_caixa_conta: idCaixaConta,
  });
}
