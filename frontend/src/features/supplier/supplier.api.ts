import { api } from "@/lib/api";
import { buildPageQuery, type Paginated, PAGE_SIZE } from "@/lib/pagination";
import {
  mapConsultaCnpj,
  mapSupplierResponse,
  mapListarSupplieres,
} from "./supplier.mapper";
import type {
  ConsultaCnpjData,
  Supplier,
  SupplierFormData,
  SupplierResponse,
} from "./supplier.types";

export async function listSupplieresApi(
  page: number = 1,
  perPage: number = PAGE_SIZE
): Promise<Paginated<Supplier>> {
  const raw = await api.get<unknown>(`/v1/suppliers${buildPageQuery(page, perPage)}`);
  return mapListarSupplieres(raw);
}

export async function listSupplieresAtivosApi(): Promise<Supplier[]> {
  const result = await listSupplieresApi(1, 9999);
  return result.data.filter((f) => f.active);
}

export async function getSupplierApi(id: number): Promise<Supplier> {
  const raw = await api.get<unknown>(`/v1/suppliers/${id}`);
  return mapSupplierResponse(raw).supplier;
}

export async function createSupplierApi(data: SupplierFormData): Promise<SupplierResponse> {
  const raw = await api.post<unknown>("/v1/suppliers", data);
  return mapSupplierResponse(raw);
}

export async function updateSupplierApi(
  id: number,
  data: Partial<SupplierFormData>
): Promise<SupplierResponse> {
  const raw = await api.put<unknown>(`/v1/suppliers/${id}`, data);
  return mapSupplierResponse(raw);
}

export async function deleteSupplierApi(id: number): Promise<void> {
  await api.delete(`/v1/suppliers/${id}`);
}

export async function consultarCnpjApi(cnpj: string): Promise<ConsultaCnpjData | null> {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return null;
  try {
    const raw = await api.get<unknown>(`/v1/cnpj-lookup/${digits}`);
    return mapConsultaCnpj(raw).data;
  } catch {
    return null;
  }
}
