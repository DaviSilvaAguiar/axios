import {
  costCenterResponseSchema,
  listCentrosDeCustoResponseSchema,
  type CostCenterResponse,
  type ListarCentrosDeCustoResponse,
} from "./cost-center.types";

export function mapListarCentrosDeCusto(raw: unknown): ListarCentrosDeCustoResponse {
  return listCentrosDeCustoResponseSchema.parse(raw);
}

export function mapCostCenterResponse(raw: unknown): CostCenterResponse {
  return costCenterResponseSchema.parse(raw);
}
