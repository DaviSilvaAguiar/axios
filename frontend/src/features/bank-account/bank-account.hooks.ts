"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useInfiniteList } from "@/lib/useInfiniteList";
import { queryKeys } from "@/lib/queryKeys";
import {
  listContasBancariasApi,
  createBankAccountApi,
  updateBankAccountApi,
  deleteBankAccountApi,
} from "./bank-account.api";
import type { BankAccount, BankAccountFormData } from "./bank-account.types";

export function useBankAccounts() {
  return useInfiniteList<BankAccount>(
    queryKeys.bankAccounts.list,
    (page, perPage, signal) => listContasBancariasApi(page, perPage, signal),
  );
}

export function useBankAccountMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.bankAccounts.all });

  const create = useMutation({
    mutationFn: (data: BankAccountFormData) => createBankAccountApi(data),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BankAccountFormData> }) =>
      updateBankAccountApi(id, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteBankAccountApi(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
