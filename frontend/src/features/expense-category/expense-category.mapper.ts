import {
  expenseCategoryResponseSchema,
  listCategoriasDespesaResponseSchema,
  type ExpenseCategory,
  type ListarCategoriasDespesaResponse,
} from "./expense-category.types";

export function mapListarCategoriasDespesa(raw: unknown): ListarCategoriasDespesaResponse {
  return listCategoriasDespesaResponseSchema.parse(raw);
}

export function mapExpenseCategoryResponse(raw: unknown): ExpenseCategory {
  return expenseCategoryResponseSchema.parse(raw).data;
}
