"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { listIntegracoesApi } from "./integration.api";

export function useIntegrations() {
  return useQuery({
    queryKey: queryKeys.export.integrations,
    queryFn: ({ signal }) => listIntegracoesApi(signal),
    select: (result) => result.data,
  });
}
