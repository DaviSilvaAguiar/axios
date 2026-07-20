"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useInfiniteList } from "@/lib/useInfiniteList";
import { queryKeys } from "@/lib/queryKeys";
import {
  listSupplieresApi,
  listSupplieresAtivosApi,
  createSupplierApi,
  updateSupplierApi,
  deleteSupplierApi,
} from "./supplier.api";
import type { Supplier, SupplierFormData } from "./supplier.types";

export function useSuppliers() {
  return useInfiniteList<Supplier>(
    queryKeys.suppliers.list,
    (page, perPage, signal) => listSupplieresApi(page, perPage, signal),
  );
}

export function useActiveSuppliers() {
  return useQuery({
    queryKey: queryKeys.suppliers.active,
    queryFn: ({ signal }) => listSupplieresAtivosApi(signal),
  });
}

export function useSupplierMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });

  const create = useMutation({
    mutationFn: (data: SupplierFormData) => createSupplierApi(data),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SupplierFormData> }) =>
      updateSupplierApi(id, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteSupplierApi(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
