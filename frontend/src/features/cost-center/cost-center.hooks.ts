"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useInfiniteList } from "@/lib/useInfiniteList";
import { queryKeys } from "@/lib/queryKeys";
import {
  listCentrosDeCustoApi,
  createCostCenterApi,
  updateCostCenterApi,
  deleteCostCenterApi,
} from "./cost-center.api";
import type { CostCenter, CostCenterFormData } from "./cost-center.types";

export function useCostCenters() {
  return useInfiniteList<CostCenter>(
    queryKeys.costCenters.list,
    (page, perPage, signal) => listCentrosDeCustoApi(page, perPage, signal),
  );
}

export function useCostCentersLookup() {
  return useQuery({
    queryKey: queryKeys.costCenters.lookup,
    queryFn: ({ signal }) => listCentrosDeCustoApi(1, 1000, signal),
    select: (result) => result.data,
  });
}

export function useCostCenterMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.costCenters.all });

  const create = useMutation({
    mutationFn: (data: CostCenterFormData) => createCostCenterApi(data),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CostCenterFormData> }) =>
      updateCostCenterApi(id, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteCostCenterApi(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
