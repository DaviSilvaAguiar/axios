"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import {
  listFundsApi,
  extratoFundApi,
  createFundApi,
  fecharFundApi,
  lancarCreditoApi,
  lancarAjusteApi,
  type FundStatusFiltro,
} from "./fund.api";
import type {
  StoreFundFormData,
  LancarCreditoFormData,
  LancarAjusteFormData,
} from "./fund.types";

export function useFunds(status: FundStatusFiltro) {
  return useQuery({
    queryKey: queryKeys.funds.list(status),
    queryFn: ({ signal }) => listFundsApi(status, signal),
  });
}

export function useFundStatement(fundId: number) {
  return useQuery({
    queryKey: queryKeys.funds.statement(fundId),
    queryFn: ({ signal }) => extratoFundApi(fundId, signal),
  });
}

export function useFundMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.funds.all });

  const create = useMutation({
    mutationFn: (data: StoreFundFormData) => createFundApi(data),
    onSuccess: invalidate,
  });

  const close = useMutation({
    mutationFn: (id: number) => fecharFundApi(id),
    onSuccess: invalidate,
  });

  const postCredit = useMutation({
    mutationFn: ({ id, data }: { id: number; data: LancarCreditoFormData }) =>
      lancarCreditoApi(id, data),
    onSuccess: invalidate,
  });

  const postAdjustment = useMutation({
    mutationFn: ({ id, data }: { id: number; data: LancarAjusteFormData }) =>
      lancarAjusteApi(id, data),
    onSuccess: invalidate,
  });

  return { create, close, postCredit, postAdjustment };
}
