import type { Paginated } from "@/lib/pagination";
import {
  pendingDocumentsResponseSchema,
  pendingStatsResponseSchema,
  historyResponseSchema,
  type PendingDocument,
  type BatchHistory,
  type PendingStats,
} from "./export.types";

export function mapPendingDocuments(raw: unknown): Paginated<PendingDocument> {
  return pendingDocumentsResponseSchema.parse(raw);
}

export function mapPendingStats(raw: unknown): PendingStats {
  return pendingStatsResponseSchema.parse(raw).data;
}

export function mapHistorico(raw: unknown): Paginated<BatchHistory> {
  return historyResponseSchema.parse(raw);
}
