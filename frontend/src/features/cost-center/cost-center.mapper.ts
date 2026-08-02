import {
  costCenterResponseSchema,
  listCostCentersResponseSchema,
  type CostCenter,
  type CostCenterListResponse,
} from "./cost-center.types";

export function mapCostCenterList(raw: unknown): CostCenterListResponse {
  return listCostCentersResponseSchema.parse(raw);
}

export function mapCostCenterResponse(raw: unknown): CostCenter {
  return costCenterResponseSchema.parse(raw).data;
}
