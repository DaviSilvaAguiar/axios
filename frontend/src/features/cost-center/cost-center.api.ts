import { api } from "@/lib/api";
import { buildPageQuery, type Paginated, PAGE_SIZE } from "@/lib/pagination";
import {
  mapCostCenterResponse,
  mapListarCentrosDeCusto,
} from "./cost-center.mapper";
import type {
  CostCenter,
  CostCenterFormData,
  CostCenterResponse,
} from "./cost-center.types";

export async function listCentrosDeCustoApi(
  page: number = 1,
  perPage: number = PAGE_SIZE
): Promise<Paginated<CostCenter>> {
  const raw = await api.get<unknown>(`/v1/cost-center${buildPageQuery(page, perPage)}`);
  return mapListarCentrosDeCusto(raw);
}

export async function getCostCenterApi(id: number): Promise<CostCenter> {
  const raw = await api.get<unknown>(`/v1/cost-center/${id}`);
  return mapCostCenterResponse(raw).cost_center;
}

export async function createCostCenterApi(
  data: CostCenterFormData
): Promise<CostCenterResponse> {
  const raw = await api.post<unknown>("/v1/cost-center", data);
  return mapCostCenterResponse(raw);
}

export async function updateCostCenterApi(
  id: number,
  data: Partial<CostCenterFormData>
): Promise<CostCenterResponse> {
  const raw = await api.put<unknown>(`/v1/cost-center/${id}`, data);
  return mapCostCenterResponse(raw);
}

export async function deleteCostCenterApi(id: number): Promise<void> {
  await api.delete(`/v1/cost-center/${id}`);
}
