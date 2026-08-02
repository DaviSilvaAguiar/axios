import { api } from "@/lib/api";
import { buildPageQuery, type Paginated, PAGE_SIZE } from "@/lib/pagination";
import {
  mapCnpjLookup,
  mapSupplierResponse,
  mapSupplierList,
} from "./supplier.mapper";
import type {
  CnpjLookupData,
  Supplier,
  SupplierFormData,
} from "./supplier.types";

export async function listSupplieresApi(
  page: number = 1,
  perPage: number = PAGE_SIZE,
  signal?: AbortSignal
): Promise<Paginated<Supplier>> {
  const raw = await api.get<unknown>(`/v1/suppliers${buildPageQuery(page, perPage)}`, { signal });
  return mapSupplierList(raw);
}

export async function listSupplieresAtivosApi(signal?: AbortSignal): Promise<Supplier[]> {
  const result = await listSupplieresApi(1, 9999, signal);
  return result.data.filter((f) => f.active);
}

export async function getSupplierApi(id: number): Promise<Supplier> {
  const raw = await api.get<unknown>(`/v1/suppliers/${id}`);
  return mapSupplierResponse(raw);
}

export async function createSupplierApi(data: SupplierFormData): Promise<Supplier> {
  const raw = await api.post<unknown>("/v1/suppliers", data);
  return mapSupplierResponse(raw);
}

export async function updateSupplierApi(
  id: number,
  data: Partial<SupplierFormData>
): Promise<Supplier> {
  const raw = await api.put<unknown>(`/v1/suppliers/${id}`, data);
  return mapSupplierResponse(raw);
}

export async function deleteSupplierApi(id: number): Promise<void> {
  await api.delete(`/v1/suppliers/${id}`);
}

export async function lookupCnpjApi(cnpj: string): Promise<CnpjLookupData | null> {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return null;
  try {
    const raw = await api.get<unknown>(`/v1/cnpj-lookup/${digits}`);
    return mapCnpjLookup(raw).data;
  } catch {
    return null;
  }
}
