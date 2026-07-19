import {
  centroDeCustoResponseSchema,
  listarCentrosDeCustoResponseSchema,
  type CentroDeCustoResponse,
  type ListarCentrosDeCustoResponse,
} from "./centro-de-custo.types";

export function mapListarCentrosDeCusto(raw: unknown): ListarCentrosDeCustoResponse {
  return listarCentrosDeCustoResponseSchema.parse(raw);
}

export function mapCentroDeCustoResponse(raw: unknown): CentroDeCustoResponse {
  return centroDeCustoResponseSchema.parse(raw);
}
