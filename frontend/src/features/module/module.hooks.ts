"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { listModulosUserApi } from "./module.api";

export function useUserModules(userId: number) {
  return useQuery({
    queryKey: queryKeys.users.modules(userId),
    queryFn: ({ signal }) => listModulosUserApi(userId, signal),
    enabled: !!userId,
  });
}
