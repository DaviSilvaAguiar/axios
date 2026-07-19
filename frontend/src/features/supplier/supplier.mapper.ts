import {
  consultaCnpjSchema,
  supplierResponseSchema,
  listSupplieresResponseSchema,
  type ConsultaCnpjResponse,
  type SupplierResponse,
  type ListarSupplieresResponse,
} from "./supplier.types";

export function mapListarSupplieres(raw: unknown): ListarSupplieresResponse {
  return listSupplieresResponseSchema.parse(raw);
}

export function mapSupplierResponse(raw: unknown): SupplierResponse {
  return supplierResponseSchema.parse(raw);
}

export function mapConsultaCnpj(raw: unknown): ConsultaCnpjResponse {
  return consultaCnpjSchema.parse(raw);
}
