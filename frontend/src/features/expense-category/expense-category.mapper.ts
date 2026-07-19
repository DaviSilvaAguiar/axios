import {
  expenseCategoryResponseSchema,
  listCategoriasDespesaResponseSchema,
  type ExpenseCategoryResponse,
  type ListarCategoriasDespesaResponse,
} from "./expense-category.types";

export function mapListarCategoriasDespesa(raw: unknown): ListarCategoriasDespesaResponse {
  return listCategoriasDespesaResponseSchema.parse(raw);
}

export function mapExpenseCategoryResponse(raw: unknown): ExpenseCategoryResponse {
  return expenseCategoryResponseSchema.parse(raw);
}
