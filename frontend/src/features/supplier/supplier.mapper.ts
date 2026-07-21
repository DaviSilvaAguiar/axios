import {
  consultaCnpjSchema,
  supplierResponseSchema,
  listSupplieresResponseSchema,
  type ConsultaCnpjResponse,
  type Supplier,
  type ListarSupplieresResponse,
} from "./supplier.types";

export function mapListarSupplieres(raw: unknown): ListarSupplieresResponse {
  return listSupplieresResponseSchema.parse(raw);
}

export function mapSupplierResponse(raw: unknown): Supplier {
  return supplierResponseSchema.parse(raw).data;
}

export function mapConsultaCnpj(raw: unknown): ConsultaCnpjResponse {
  return consultaCnpjSchema.parse(raw);
}
