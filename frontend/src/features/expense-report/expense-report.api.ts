import { api } from "@/lib/api";
import { mapListarExpenseReportsResponse, mapExpenseReportResponse } from "./expense-report.mapper";
import { expenseReportItemSchema } from "./expense-report.types";
import type { ExpenseReportItem, ExpenseReportItemFormItem, ExpenseReport, StoreExpenseReportFormData } from "./expense-report.types";

export async function listExpenseReportsApi(signal?: AbortSignal): Promise<ExpenseReport[]> {
  const raw = await api.get<unknown>("/v1/expense-reports", { signal });
  return mapListarExpenseReportsResponse(raw);
}

export async function getExpenseReportApi(id: number, signal?: AbortSignal): Promise<ExpenseReport> {
  const raw = await api.get<unknown>(`/v1/expense-reports/${id}`, { signal });
  return mapExpenseReportResponse(raw);
}

export async function createExpenseReportApi(dados: StoreExpenseReportFormData): Promise<ExpenseReport> {
  const raw = await api.post<unknown>("/v1/expense-reports", {
    ...dados,
    cost_center_id: Number(dados.cost_center_id),
    requester_user_id: dados.requester_user_id
      ? Number(dados.requester_user_id)
      : null,
  });
  return mapExpenseReportResponse(raw);
}

export async function updateExpenseReportApi(
  id: number,
  dados: Partial<StoreExpenseReportFormData>
): Promise<ExpenseReport> {
  const payload: Record<string, unknown> = {
    ...dados,
    ...(dados.cost_center_id !== undefined && {
      cost_center_id: Number(dados.cost_center_id),
    }),
  };
  if (dados.requester_user_id !== undefined) {
    payload.requester_user_id = dados.requester_user_id
      ? Number(dados.requester_user_id)
      : null;
  }
  const raw = await api.put<unknown>(`/v1/expense-reports/${id}`, payload);
  return mapExpenseReportResponse(raw);
}

export async function updateStatusExpenseReportApi(
  id: number,
  status: number,
  reasonRejeicao?: string,
  dataPagamento?: string,
): Promise<ExpenseReport> {
  const raw = await api.put<unknown>(`/v1/expense-reports/${id}`, {
    status,
    ...(reasonRejeicao ? { rejection_reason: reasonRejeicao } : {}),
    ...(dataPagamento ? { paid_at: dataPagamento } : {}),
  });
  return mapExpenseReportResponse(raw);
}

export async function deleteExpenseReportApi(id: number): Promise<void> {
  await api.delete(`/v1/expense-reports/${id}`);
}

export async function downloadPdfExpenseReportApi(id: number): Promise<Blob> {
  return api.blob(`/v1/expense-reports/${id}/pdf`);
}

export async function createExpenseReportItemApi(
  idExpenseReport: number,
  dados: FormData
): Promise<ExpenseReportItem> {
  const raw = await api.upload<unknown>(`/v1/expense-reports/${idExpenseReport}/items`, dados);
  return expenseReportItemSchema.parse((raw as { item?: unknown })?.item ?? raw);
}

export async function updateExpenseReportItemApi(
  idExpenseReport: number,
  idDespesa: number,
  dados: ExpenseReportItemFormItem
): Promise<ExpenseReportItem> {
  const payload = {
    expense_date:         dados.expense_date,
    amount:                dados.amount,
    cost_center_id:      Number(dados.cost_center_id),
    description:            dados.description,
    expense_category_id: dados.expense_category_id ? Number(dados.expense_category_id) : null,
    latitude:             dados.latitude  ?? null,
    longitude:            dados.longitude ?? null,
    address:             dados.address  ?? null,
    description_supplier: dados.description_supplier || null,
    supplier_tax_id:  dados.supplier_tax_id ? dados.supplier_tax_id.replace(/\D/g, "") : null,
    supplier_id:        dados.supplier_id ? Number(dados.supplier_id) : null,
  };
  const raw = await api.put<unknown>(`/v1/expense-reports/${idExpenseReport}/items/${idDespesa}`, payload);
  return expenseReportItemSchema.parse((raw as { item?: unknown })?.item ?? raw);
}

export async function deleteExpenseReportItemApi(
  idExpenseReport: number,
  idDespesa: number
): Promise<void> {
  await api.delete(`/v1/expense-reports/${idExpenseReport}/items/${idDespesa}`);
}

export async function adicionarAnexoExpenseReportItemApi(
  idExpenseReport: number,
  idDespesa: number,
  arquivo: File
): Promise<void> {
  const fd = new FormData();
  fd.append("anexo", arquivo);
  await api.upload<unknown>(`/v1/expense-reports/${idExpenseReport}/items/${idDespesa}/attachments`, fd);
}

export async function getAnexoExpenseReportApi(
  idExpenseReport: number,
  idDespesa: number,
  idAnexo: number,
  signal?: AbortSignal,
): Promise<Blob> {
  return api.blob(`/v1/expense-reports/${idExpenseReport}/items/${idDespesa}/attachments/${idAnexo}`, signal);
}

export { listCentrosDeCustoApi } from "@/features/cost-center/cost-center.api";
export { listCategoriasDespesaApi } from "@/features/expense-category/expense-category.api";
