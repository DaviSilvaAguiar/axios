import {
  overviewResponseSchema,
  pendingApprovalResponseSchema,
  type Overview,
  type PendingApprovalItem,
} from "./dashboard.types";

export function mapOverviewResponse(raw: unknown): Overview {
  return overviewResponseSchema.parse(raw).data;
}

export function mapPendingApprovalResponse(raw: unknown): PendingApprovalItem[] {
  return pendingApprovalResponseSchema.parse(raw).data;
}
