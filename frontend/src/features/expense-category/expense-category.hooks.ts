"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useInfiniteList } from "@/lib/useInfiniteList";
import { queryKeys } from "@/lib/queryKeys";
import {
  listCategoriasDespesaApi,
  createExpenseCategoryApi,
  updateExpenseCategoryApi,
  deleteExpenseCategoryApi,
} from "./expense-category.api";
import type { ExpenseCategory, ExpenseCategoryFormData } from "./expense-category.types";

export function useExpenseCategories() {
  return useInfiniteList<ExpenseCategory>(
    queryKeys.expenseCategories.list,
    (page, perPage, signal) => listCategoriasDespesaApi(page, perPage, signal),
  );
}

export function useExpenseCategoriesLookup() {
  return useQuery({
    queryKey: queryKeys.expenseCategories.lookup,
    queryFn: ({ signal }) => listCategoriasDespesaApi(1, 200, signal),
    select: (result) => result.data.filter((category) => category.active),
  });
}

export function useExpenseCategoryMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.expenseCategories.all });

  const create = useMutation({
    mutationFn: (data: ExpenseCategoryFormData) => createExpenseCategoryApi(data),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ExpenseCategoryFormData> }) =>
      updateExpenseCategoryApi(id, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteExpenseCategoryApi(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
