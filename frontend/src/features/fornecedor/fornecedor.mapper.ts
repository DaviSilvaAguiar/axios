import {
  consultaCnpjSchema,
  fornecedorResponseSchema,
  listarFornecedoresResponseSchema,
  type ConsultaCnpjResponse,
  type FornecedorResponse,
  type ListarFornecedoresResponse,
} from "./fornecedor.types";

export function mapListarFornecedores(raw: unknown): ListarFornecedoresResponse {
  return listarFornecedoresResponseSchema.parse(raw);
}

export function mapFornecedorResponse(raw: unknown): FornecedorResponse {
  return fornecedorResponseSchema.parse(raw);
}

export function mapConsultaCnpj(raw: unknown): ConsultaCnpjResponse {
  return consultaCnpjSchema.parse(raw);
}
