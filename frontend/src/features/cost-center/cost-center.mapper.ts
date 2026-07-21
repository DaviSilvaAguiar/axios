import {
  costCenterResponseSchema,
  listCentrosDeCustoResponseSchema,
  type CostCenter,
  type ListarCentrosDeCustoResponse,
} from "./cost-center.types";

export function mapListarCentrosDeCusto(raw: unknown): ListarCentrosDeCustoResponse {
  return listCentrosDeCustoResponseSchema.parse(raw);
}

export function mapCostCenterResponse(raw: unknown): CostCenter {
  return costCenterResponseSchema.parse(raw).data;
}
