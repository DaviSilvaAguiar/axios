import { api } from "@/lib/api";
import { buildPageQuery, type Paginated, PAGE_SIZE } from "@/lib/pagination";
import {
  mapExpenseCategoryResponse,
  mapListarCategoriasDespesa,
} from "./expense-category.mapper";
import type {
  ExpenseCategory,
  ExpenseCategoryFormData,
  ExpenseCategoryResponse,
} from "./expense-category.types";

export async function listCategoriasDespesaApi(
  page: number = 1,
  perPage: number = PAGE_SIZE,
  signal?: AbortSignal
): Promise<Paginated<ExpenseCategory>> {
  const raw = await api.get<unknown>(`/v1/expense-categories${buildPageQuery(page, perPage)}`, { signal });
  return mapListarCategoriasDespesa(raw);
}

export async function getExpenseCategoryApi(id: number): Promise<ExpenseCategory> {
  const raw = await api.get<unknown>(`/v1/expense-categories/${id}`);
  return mapExpenseCategoryResponse(raw).expense_category;
}

export async function createExpenseCategoryApi(
  data: ExpenseCategoryFormData
): Promise<ExpenseCategoryResponse> {
  const raw = await api.post<unknown>("/v1/expense-categories", data);
  return mapExpenseCategoryResponse(raw);
}

export async function updateExpenseCategoryApi(
  id: number,
  data: Partial<ExpenseCategoryFormData>
): Promise<ExpenseCategoryResponse> {
  const raw = await api.put<unknown>(`/v1/expense-categories/${id}`, data);
  return mapExpenseCategoryResponse(raw);
}

export async function deleteExpenseCategoryApi(id: number): Promise<void> {
  await api.delete(`/v1/expense-categories/${id}`);
}
