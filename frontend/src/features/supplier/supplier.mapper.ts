import {
  cnpjLookupSchema,
  supplierResponseSchema,
  listSuppliersResponseSchema,
  type CnpjLookupResponse,
  type Supplier,
  type SupplierListResponse,
} from "./supplier.types";

export function mapSupplierList(raw: unknown): SupplierListResponse {
  return listSuppliersResponseSchema.parse(raw);
}

export function mapSupplierResponse(raw: unknown): Supplier {
  return supplierResponseSchema.parse(raw).data;
}

export function mapCnpjLookup(raw: unknown): CnpjLookupResponse {
  return cnpjLookupSchema.parse(raw);
}
