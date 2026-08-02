"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { listUserModulesApi } from "./module.api";

export function useUserModules(userId: number) {
  return useQuery({
    queryKey: queryKeys.users.modules(userId),
    queryFn: ({ signal }) => listUserModulesApi(userId, signal),
    enabled: !!userId,
  });
}
