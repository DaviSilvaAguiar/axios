import {
  contaBancariaResponseSchema,
  listarContasBancariasResponseSchema,
  type ContaBancariaResponse,
  type ListarContasBancariasResponse,
} from "./conta-bancaria.types";

export function mapListarContasBancarias(raw: unknown): ListarContasBancariasResponse {
  return listarContasBancariasResponseSchema.parse(raw);
}

export function mapContaBancariaResponse(raw: unknown): ContaBancariaResponse {
  return contaBancariaResponseSchema.parse(raw);
}
