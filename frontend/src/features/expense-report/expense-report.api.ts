import { api } from "@/lib/api";
import { mapListarRdcsResponse, mapRdcResponse } from "./rdc.mapper";
import { despesaRdcSchema } from "./rdc.types";
import type { DespesaRdc, DespesaRdcFormItem, Rdc, StoreRdcFormData } from "./rdc.types";

export async function listarRdcsApi(): Promise<Rdc[]> {
  const raw = await api.get<unknown>("/v1/caixas");
  return mapListarRdcsResponse(raw);
}

export async function buscarRdcApi(id: number): Promise<Rdc> {
  const raw = await api.get<unknown>(`/v1/caixas/${id}`);
  return mapRdcResponse(raw);
}

export async function criarRdcApi(dados: StoreRdcFormData): Promise<Rdc> {
  const raw = await api.post<unknown>("/v1/caixas", {
    ...dados,
    id_centro_custo: Number(dados.id_centro_custo),
    id_usuario_requisitante: dados.id_usuario_requisitante
      ? Number(dados.id_usuario_requisitante)
      : null,
  });
  return mapRdcResponse(raw);
}

export async function atualizarRdcApi(
  id: number,
  dados: Partial<StoreRdcFormData>
): Promise<Rdc> {
  const payload: Record<string, unknown> = {
    ...dados,
    ...(dados.id_centro_custo !== undefined && {
      id_centro_custo: Number(dados.id_centro_custo),
    }),
  };
  if (dados.id_usuario_requisitante !== undefined) {
    payload.id_usuario_requisitante = dados.id_usuario_requisitante
      ? Number(dados.id_usuario_requisitante)
      : null;
  }
  const raw = await api.put<unknown>(`/v1/caixas/${id}`, payload);
  return mapRdcResponse(raw);
}

export async function atualizarStatusRdcApi(
  id: number,
  status: number,
  motivoRejeicao?: string,
  dataPagamento?: string,
): Promise<Rdc> {
  const raw = await api.put<unknown>(`/v1/caixas/${id}`, {
    status,
    ...(motivoRejeicao ? { motivo_rejeicao: motivoRejeicao } : {}),
    ...(dataPagamento ? { data_pagamento: dataPagamento } : {}),
  });
  return mapRdcResponse(raw);
}

export async function deletarRdcApi(id: number): Promise<void> {
  await api.delete(`/v1/caixas/${id}`);
}

export async function baixarPdfRdcApi(id: number): Promise<Blob> {
  return api.blob(`/v1/caixas/${id}/pdf`);
}

export async function criarDespesaRdcApi(
  idRdc: number,
  dados: FormData
): Promise<DespesaRdc> {
  const raw = await api.upload<unknown>(`/v1/caixas/${idRdc}/despesas`, dados);
  return despesaRdcSchema.parse((raw as { despesa?: unknown })?.despesa ?? raw);
}

export async function atualizarDespesaRdcApi(
  idRdc: number,
  idDespesa: number,
  dados: DespesaRdcFormItem
): Promise<DespesaRdc> {
  const payload = {
    data_despesa:         dados.data_despesa,
    valor:                dados.valor,
    id_centro_custo:      Number(dados.id_centro_custo),
    descricao:            dados.descricao,
    id_categoria_despesa: dados.id_categoria_despesa ? Number(dados.id_categoria_despesa) : null,
    latitude:             dados.latitude  ?? null,
    longitude:            dados.longitude ?? null,
    endereco:             dados.endereco  ?? null,
    descricao_fornecedor: dados.descricao_fornecedor || null,
    cpf_cnpj_fornecedor:  dados.cpf_cnpj_fornecedor ? dados.cpf_cnpj_fornecedor.replace(/\D/g, "") : null,
    id_fornecedor:        dados.id_fornecedor ? Number(dados.id_fornecedor) : null,
  };
  const raw = await api.put<unknown>(`/v1/caixas/${idRdc}/despesas/${idDespesa}`, payload);
  return despesaRdcSchema.parse((raw as { despesa?: unknown })?.despesa ?? raw);
}

export async function deletarDespesaRdcApi(
  idRdc: number,
  idDespesa: number
): Promise<void> {
  await api.delete(`/v1/caixas/${idRdc}/despesas/${idDespesa}`);
}

export async function adicionarAnexoDespesaRdcApi(
  idRdc: number,
  idDespesa: number,
  arquivo: File
): Promise<void> {
  const fd = new FormData();
  fd.append("anexo", arquivo);
  await api.upload<unknown>(`/v1/caixas/${idRdc}/despesas/${idDespesa}/anexos`, fd);
}

export async function buscarAnexoRdcApi(
  idRdc: number,
  idDespesa: number,
  idAnexo: number,
): Promise<Blob> {
  return api.blob(`/v1/caixas/${idRdc}/despesas/${idDespesa}/anexos/${idAnexo}`);
}

export { listarCentrosDeCustoApi } from "@/features/centro-de-custo/centro-de-custo.api";
export { listarCategoriasDespesaApi } from "@/features/categoria-despesa/categoria-despesa.api";
