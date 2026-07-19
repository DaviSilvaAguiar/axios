import { api } from "@/lib/api";
import { valorParaApi } from "@/lib/formatters";
import {
  mapFundResponse,
  mapExtratoResponse,
  mapListarFundsResponse,
} from "./fund.mapper";
import type {
  Fund,
  ExtratoResponse,
  LancarAjusteFormData,
  LancarCreditoFormData,
  StoreFundFormData,
} from "./fund.types";

export type FundStatusFiltro = "abertos" | "fechados";

export async function listFundsApi(
  status: FundStatusFiltro = "abertos",
): Promise<Fund[]> {
  const raw = await api.get<unknown>(`/v1/funds?status=${status}`);
  return mapListarFundsResponse(raw);
}

export async function getFundApi(id: number): Promise<Fund> {
  const raw = await api.get<unknown>(`/v1/funds/${id}`);
  return mapFundResponse(raw);
}

export async function createFundApi(
  dados: StoreFundFormData,
): Promise<Fund> {
  const payload = {
    ...dados,
    user_id:      Number(dados.user_id),
    cost_center_id: Number(dados.cost_center_id),
    type:            Number(dados.type),
  };
  const raw = await api.post<unknown>("/v1/funds", payload);
  return mapFundResponse(raw);
}

export async function updateFundApi(
  id: number,
  dados: Partial<StoreFundFormData>,
): Promise<Fund> {
  const payload: Record<string, unknown> = { ...dados };
  if (dados.type !== undefined) payload.type = Number(dados.type);
  const raw = await api.put<unknown>(`/v1/funds/${id}`, payload);
  return mapFundResponse(raw);
}

export async function fecharFundApi(id: number): Promise<Fund> {
  const raw = await api.post<unknown>(`/v1/funds/${id}/close`, {});
  return mapFundResponse(raw);
}

export async function extratoFundApi(id: number): Promise<ExtratoResponse> {
  const raw = await api.get<unknown>(`/v1/funds/${id}/statement`);
  return mapExtratoResponse(raw);
}

export async function lancarCreditoApi(
  id: number,
  dados: LancarCreditoFormData,
): Promise<void> {
  await api.post(`/v1/funds/${id}/transactions/credit`, {
    ...dados,
    amount: valorParaApi(dados.amount),
  });
}

export async function lancarAjusteApi(
  id: number,
  dados: LancarAjusteFormData,
): Promise<void> {
  await api.post(`/v1/funds/${id}/transactions/adjustment`, {
    ...dados,
    subtype: Number(dados.subtype),
    amount:   valorParaApi(dados.amount),
  });
}

export async function aprovarExpenseReportComCaixaApi(
  idExpenseReport: number,
  idFund: number,
): Promise<unknown> {
  return api.post(`/v1/expense-reports/${idExpenseReport}/approve`, {
    expense_report_id_conta: idFund,
  });
}
