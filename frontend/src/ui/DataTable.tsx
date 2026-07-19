"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type UIEvent,
} from "react";
import { CaretDown, CaretUp, CheckCircle } from "@phosphor-icons/react";

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T, idx: number) => ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
  sortAccessor?: (row: T) => string | number | Date | null | undefined;
  width?: string;
}

export interface DataTableSelection<K extends string | number> {
  selecao: Set<K>;
  onToggle: (key: K) => void;
  onToggleTodos: () => void;
}

interface Props<T, K extends string | number> {
  columns: DataTableColumn<T>[];
  rows: T[];
  keyExtractor: (row: T) => K;
  loading?: boolean;
  empty?: ReactNode;
  selection?: DataTableSelection<K>;
  tamanho?: number;
  rowHeight?: number;
  pageSize?: number;
  defaultSort?: { columnKey: string; direction: "asc" | "desc" };
  onRowClick?: (row: T) => void;
  getRowClassName?: (row: T, idx: number) => string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

const HEADER_HEIGHT = 40;

export default function DataTable<T, K extends string | number>({
  columns,
  rows,
  keyExtractor,
  loading,
  empty,
  selection,
  tamanho = 10,
  rowHeight = 44,
  pageSize = 50,
  defaultSort,
  onRowClick,
  getRowClassName,
  onLoadMore,
  hasMore,
  loadingMore,
}: Props<T, K>) {
  const serverPaginated = typeof onLoadMore === "function";
  const [sort, setSort] = useState<{ columnKey: string; direction: "asc" | "desc" } | null>(
    defaultSort ?? null
  );
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.columnKey);
    if (!col?.sortAccessor) return rows;
    const dir = sort.direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = col.sortAccessor!(a);
      const vb = col.sortAccessor!(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (va instanceof Date && vb instanceof Date) {
        return (va.getTime() - vb.getTime()) * dir;
      }
      if (typeof va === "number" && typeof vb === "number") {
        return (va - vb) * dir;
      }
      return String(va).localeCompare(String(vb), undefined, { numeric: true }) * dir;
    });
  }, [rows, sort, columns]);

  useEffect(() => {
    setVisibleCount(pageSize);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [pageSize, rows, sort]);

  const renderedRows = useMemo(
    () => (serverPaginated ? sortedRows : sortedRows.slice(0, visibleCount)),
    [sortedRows, visibleCount, serverPaginated]
  );

  function handleScroll(e: UIEvent<HTMLDivElement>) {
    const t = e.currentTarget;
    const nearBottom = t.scrollHeight - t.scrollTop - t.clientHeight < 120;
    if (!nearBottom) return;

    if (serverPaginated) {
      if (hasMore && !loadingMore) onLoadMore!();
      return;
    }

    setVisibleCount((v) => (v >= sortedRows.length ? v : Math.min(v + pageSize, sortedRows.length)));
  }

  function clickHeader(col: DataTableColumn<T>) {
    if (!col.sortable) return;
    setSort((cur) => {
      if (!cur || cur.columnKey !== col.key) {
        return { columnKey: col.key, direction: "asc" };
      }
      if (cur.direction === "asc") {
        return { columnKey: col.key, direction: "desc" };
      }
      return null;
    });
  }

  const totalCols = columns.length + (selection ? 1 : 0);
  const limitHeight =
    loading || sortedRows.length > tamanho || (serverPaginated && !!hasMore);
  const maxHeight = limitHeight ? tamanho * rowHeight + HEADER_HEIGHT : undefined;

  const allSelected =
    !!selection && sortedRows.length > 0 && selection.selecao.size === sortedRows.length;
  const someSelected =
    !!selection && selection.selecao.size > 0 && !allSelected;

  if (!loading && sortedRows.length === 0 && empty) {
    return (
      <div className="rounded-2xl border border-app-border bg-app-surface">
        {empty}
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className={[
        "rounded-2xl border border-app-border bg-app-surface",
        limitHeight ? "overflow-auto" : "overflow-x-auto",
      ].join(" ")}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className="w-full border-collapse text-[13px]">
        <thead className="sticky top-0 z-10 bg-app-surface">
          <tr className="border-b border-app-border bg-app-surface-raised/30">
            {selection && (
              <th className="px-3 py-2.5 w-10 text-left">
                <button
                  type="button"
                  onClick={selection.onToggleTodos}
                  aria-label="Select all"
                  className={[
                    "flex h-4 w-4 items-center justify-center rounded-md border transition-colors cursor-pointer",
                    allSelected
                      ? "bg-brand border-brand"
                      : someSelected
                        ? "bg-brand/30 border-brand"
                        : "bg-app-surface border-app-border hover:border-brand/50",
                  ].join(" ")}
                >
                  {allSelected && (
                    <CheckCircle size={12} weight="fill" className="text-white" />
                  )}
                  {someSelected && (
                    <span className="h-0.5 w-2 rounded-full bg-white" />
                  )}
                </button>
              </th>
            )}
            {columns.map((col) => {
              const isActive = sort?.columnKey === col.key;
              return (
                <th
                  key={col.key}
                  onClick={() => clickHeader(col)}
                  className={[
                    "px-3 py-2.5 text-small text-app-text-muted font-medium",
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                        ? "text-center"
                        : "text-left",
                    col.sortable ? "cursor-pointer select-none hover:text-app-text" : "",
                    col.headerClassName ?? "",
                    col.width ?? "",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "inline-flex items-center gap-1.5",
                      col.align === "right" ? "justify-end" : "",
                    ].join(" ")}
                  >
                    {col.header}
                    {col.sortable && (
                      <span className="flex flex-col items-center -space-y-1">
                        <CaretUp
                          size={8}
                          weight="fill"
                          className={
                            isActive && sort?.direction === "asc"
                              ? "text-app-text"
                              : "text-app-text-subtle/40"
                          }
                        />
                        <CaretDown
                          size={8}
                          weight="fill"
                          className={
                            isActive && sort?.direction === "desc"
                              ? "text-app-text"
                              : "text-app-text-subtle/40"
                          }
                        />
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: tamanho }).map((_, i) => (
              <tr key={`sk-${i}`} className="border-b border-app-border-subtle last:border-0">
                {selection && (
                  <td className="px-3 py-2.5">
                    <div className="h-4 w-4 rounded-md bg-app-surface-raised animate-pulse" />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={[
                      "px-3 py-2.5",
                      col.align === "right" ? "text-right" : "",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "h-3 rounded bg-app-surface-raised animate-pulse",
                        col.align === "right" ? "ml-auto w-16" : "w-3/4",
                      ].join(" ")}
                    />
                  </td>
                ))}
              </tr>
            ))
            : renderedRows.map((row, idx) => {
              const k = keyExtractor(row);
              const selected = selection?.selecao.has(k) ?? false;
              return (
                <tr
                  key={k}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={[
                    "border-b border-app-border-subtle last:border-0 transition-colors",
                    onRowClick ? "cursor-pointer" : "",
                    selected
                      ? "bg-brand/[0.04] hover:bg-brand/[0.06]"
                      : "hover:bg-app-hover",
                    getRowClassName?.(row, idx) ?? "",
                  ].join(" ")}
                >
                  {selection && (
                    <td className="px-3 py-2.5 w-10">
                      <span
                        className={[
                          "flex h-4 w-4 items-center justify-center rounded-md border transition-colors",
                          selected
                            ? "bg-brand border-brand"
                            : "bg-app-surface border-app-border",
                        ].join(" ")}
                      >
                        {selected && (
                          <CheckCircle size={12} weight="fill" className="text-white" />
                        )}
                      </span>
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={[
                        "px-3 py-2.5",
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                            ? "text-center"
                            : "",
                        col.className ?? "",
                      ].join(" ")}
                    >
                      {col.render(row, idx)}
                    </td>
                  ))}
                </tr>
              );
            })}
          {!loading && (
            (serverPaginated && (loadingMore || hasMore)) ||
            (!serverPaginated && visibleCount < sortedRows.length)
          ) && (
              <tr>
                <td colSpan={totalCols} className="px-3 py-2 text-center text-small text-app-text-subtle">
                  {loadingMore || !serverPaginated ? "Loading more…" : ""}
                </td>
              </tr>
            )}
        </tbody>
      </table>
    </div>
  );
}
