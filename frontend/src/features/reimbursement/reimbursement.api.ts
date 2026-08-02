import { api } from "@/lib/api";
import { PAGE_SIZE } from "@/lib/pagination";
import { mapReimbursementList, mapReimbursementResponse } from "./reimbursement.mapper";
import { reimbursementItemSchema } from "./reimbursement.types";
import type {
  ReimbursementItem,
  ReimbursementListResponse,
  Reimbursement,
  StoreReimbursementFormData,
  UpdateReimbursementStatusFormData,
} from "./reimbursement.types";

export async function listReimbursementsApi(
  page: number = 1,
  perPage: number = PAGE_SIZE,
  filters?: { employee?: string; status?: string; startDate?: string; endDate?: string },
  signal?: AbortSignal
): Promise<ReimbursementListResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  if (filters?.employee) params.append("employee", filters.employee);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const raw = await api.get<unknown>(`/v1/reimbursements?${params.toString()}`, { signal });
  return mapReimbursementList(raw);
}

export async function getReimbursementApi(id: number, signal?: AbortSignal): Promise<Reimbursement> {
  const raw = await api.get<unknown>(`/v1/reimbursements/${id}`, { signal });
  return mapReimbursementResponse(raw);
}

function normalizeReimbursementHeader<T extends Partial<StoreReimbursementFormData>>(data: T) {
  return {
    ...data,
    cost_center_id: data.cost_center_id ? Number(data.cost_center_id) : null,
    requester_user_id: data.requester_user_id
      ? Number(data.requester_user_id)
      : null,
  };
}

export async function createReimbursementApi(data: StoreReimbursementFormData): Promise<Reimbursement> {
  const raw = await api.post<unknown>("/v1/reimbursements", normalizeReimbursementHeader(data));
  return mapReimbursementResponse(raw);
}

export async function updateReimbursementApi(
  id: number,
  data: Partial<StoreReimbursementFormData>
): Promise<Reimbursement> {
  const raw = await api.put<unknown>(`/v1/reimbursements/${id}`, normalizeReimbursementHeader(data));
  return mapReimbursementResponse(raw);
}

export async function updateStatusReimbursementApi(
  id: number,
  data: UpdateReimbursementStatusFormData
): Promise<Reimbursement> {
  const raw = await api.patch<unknown>(`/v1/reimbursements/${id}/status`, data);
  return mapReimbursementResponse(raw);
}

export async function deleteReimbursementApi(id: number): Promise<void> {
  await api.delete(`/v1/reimbursements/${id}`);
}

export { listCostCentersApi } from "@/features/cost-center/cost-center.api";
export { listExpenseCategoriesApi } from "@/features/expense-category/expense-category.api";

export async function createReimbursementItemApi(
  reimbursementId: number,
  data: FormData
): Promise<ReimbursementItem> {
  const raw = await api.upload<unknown>(`/v1/reimbursements/${reimbursementId}/items`, data);
  return reimbursementItemSchema.parse((raw as { data: unknown }).data);
}

export async function updateReimbursementItemApi(
  reimbursementId: number,
  itemId: number,
  data: {
    expense_date: string;
    amount: string;
    cost_center_id: string;
    description: string;
    expense_category_id?: string;
    latitude?: number | null;
    longitude?: number | null;
    address?: string | null;
    description_supplier?: string;
    supplier_tax_id?: string;
    supplier_id?: string;
  }
): Promise<ReimbursementItem> {
  const raw = await api.put<unknown>(`/v1/reimbursements/${reimbursementId}/items/${itemId}`, {
    expense_date: data.expense_date,
    amount: data.amount,
    cost_center_id: parseInt(data.cost_center_id),
    description: data.description,
    expense_category_id: data.expense_category_id ? parseInt(data.expense_category_id) : null,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    address: data.address ?? null,
    description_supplier: data.description_supplier || null,
    supplier_tax_id: data.supplier_tax_id ? data.supplier_tax_id.replace(/\D/g, "") : null,
    supplier_id: data.supplier_id ? Number(data.supplier_id) : null,
  });
  return reimbursementItemSchema.parse((raw as { data: unknown }).data);
}

export async function deleteReimbursementItemApi(
  reimbursementId: number,
  itemId: number
): Promise<void> {
  await api.delete(`/v1/reimbursements/${reimbursementId}/items/${itemId}`);
}

export async function downloadPdfReimbursementApi(id: number): Promise<Blob> {
  return api.blob(`/v1/reimbursements/${id}/pdf`);
}

export async function addReimbursementAttachmentApi(
  reimbursementId: number,
  itemId: number,
  file: File
): Promise<void> {
  const fd = new FormData();
  fd.append("attachment", file);
  await api.upload(`/v1/reimbursements/${reimbursementId}/items/${itemId}/attachments`, fd);
}

export async function deleteReimbursementAttachmentApi(
  reimbursementId: number,
  itemId: number,
  attachmentId: number
): Promise<void> {
  await api.delete(`/v1/reimbursements/${reimbursementId}/items/${itemId}/attachments/${attachmentId}`);
}

export async function getReimbursementAttachmentApi(
  reimbursementId: number,
  itemId: number,
  attachmentId: number,
  signal?: AbortSignal
): Promise<Blob> {
  return api.blob(`/v1/reimbursements/${reimbursementId}/items/${itemId}/attachments/${attachmentId}`, signal);
}
