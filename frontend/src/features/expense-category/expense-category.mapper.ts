import {
  expenseCategoryResponseSchema,
  listExpenseCategoriesResponseSchema,
  type ExpenseCategory,
  type ExpenseCategoryListResponse,
} from "./expense-category.types";

export function mapExpenseCategoryList(raw: unknown): ExpenseCategoryListResponse {
  return listExpenseCategoriesResponseSchema.parse(raw);
}

export function mapExpenseCategoryResponse(raw: unknown): ExpenseCategory {
  return expenseCategoryResponseSchema.parse(raw).data;
}
