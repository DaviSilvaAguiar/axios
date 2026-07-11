import {
  categoriaDespesaResponseSchema,
  listarCategoriasDespesaResponseSchema,
  type CategoriaDespesaResponse,
  type ListarCategoriasDespesaResponse,
} from "./categoria-despesa.types";

export function mapListarCategoriasDespesa(raw: unknown): ListarCategoriasDespesaResponse {
  return listarCategoriasDespesaResponseSchema.parse(raw);
}

export function mapCategoriaDespesaResponse(raw: unknown): CategoriaDespesaResponse {
  return categoriaDespesaResponseSchema.parse(raw);
}
