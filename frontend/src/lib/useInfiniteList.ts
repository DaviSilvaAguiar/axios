"use client";

import { useInfiniteQuery, type QueryKey } from "@tanstack/react-query";
import type { Paginated } from "./pagination";
import { PAGE_SIZE } from "./pagination";

type Fetcher<T> = (
  page: number,
  perPage: number,
  signal: AbortSignal,
) => Promise<Paginated<T>>;

interface Options {
  perPage?: number;
  enabled?: boolean;
}

export interface UseInfiniteListResult<T> {
  items: T[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  reload: () => void;
  loadMore: () => void;
}

export function useInfiniteList<T>(
  queryKey: QueryKey,
  fetcher: Fetcher<T>,
  options: Options = {},
): UseInfiniteListResult<T> {
  const { perPage = PAGE_SIZE, enabled = true } = options;

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam, signal }) => fetcher(pageParam, perPage, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage: Paginated<T>) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
    enabled,
  });

  return {
    items: query.data?.pages.flatMap((page) => page.data) ?? [],
    loading: query.isLoading,
    loadingMore: query.isFetchingNextPage,
    hasMore: query.hasNextPage,
    error: query.error instanceof Error ? query.error.message : null,
    reload: () => void query.refetch(),
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
    },
  };
}
