"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useInfiniteList } from "@/lib/useInfiniteList";
import { queryKeys } from "@/lib/queryKeys";
import { listUsersApi, createUserApi, updateUserApi, deleteUserApi } from "./user.api";
import type { CriarUserFormData, EditarUserFormData, User } from "./user.types";

export function useUsers() {
  return useInfiniteList<User>(
    queryKeys.users.list,
    (page, perPage, signal) => listUsersApi(page, perPage, signal),
  );
}

export function useUsersLookup() {
  return useQuery({
    queryKey: queryKeys.users.lookup,
    queryFn: ({ signal }) => listUsersApi(1, 200, signal),
    select: (result) => result.data.filter((user) => user.active),
  });
}

export function useUserCount() {
  return useQuery({
    queryKey: queryKeys.users.count,
    queryFn: ({ signal }) => listUsersApi(1, 1, signal),
    select: (result) => result.meta.total,
  });
}

export function useUserMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });

  const create = useMutation({
    mutationFn: (data: CriarUserFormData) => createUserApi(data),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EditarUserFormData }) =>
      updateUserApi(id, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteUserApi(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
