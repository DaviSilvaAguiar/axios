"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Paginated } from "./pagination";
import { PAGE_SIZE } from "./pagination";

type Fetcher<T> = (page: number, perPage: number) => Promise<Paginated<T>>;

interface Options {
  perPage?: number;
  errorMessage?: string;
}

export interface UsePaginatedListResult<T> {
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  reload: () => Promise<void>;
  loadMore: () => void;
}

export function usePaginatedList<T>(
  fetcher: Fetcher<T>,
  options: Options = {}
): UsePaginatedListResult<T> {
  const { perPage = PAGE_SIZE, errorMessage = "Unable to load." } = options;

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setErro] = useState<string | null>(null);

  const pageRef = useRef(0);
  const inFlightRef = useRef(false);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const reload = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    setErro(null);
    try {
      const r = await fetcherRef.current(1, perPage);
      setItems(r.data);
      setHasMore(r.meta.current_page < r.meta.last_page);
      pageRef.current = r.meta.current_page;
    } catch (err) {
      setErro(err instanceof Error ? err.message : errorMessage);
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [perPage, errorMessage]);

  const loadMore = useCallback(() => {
    if (inFlightRef.current || !hasMore) return;
    inFlightRef.current = true;
    setLoadingMore(true);
    const nextPage = pageRef.current + 1;
    fetcherRef.current(nextPage, perPage)
      .then((r) => {
        setItems((prev) => [...prev, ...r.data]);
        setHasMore(r.meta.current_page < r.meta.last_page);
        pageRef.current = r.meta.current_page;
      })
      .catch((err) => {
        setErro(err instanceof Error ? err.message : errorMessage);
      })
      .finally(() => {
        setLoadingMore(false);
        inFlightRef.current = false;
      });
  }, [hasMore, perPage, errorMessage]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    items,
    setItems,
    loading,
    loadingMore,
    hasMore,
    error,
    reload,
    loadMore,
  };
}
