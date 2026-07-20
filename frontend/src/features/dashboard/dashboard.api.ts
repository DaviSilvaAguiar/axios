import { api } from "@/lib/api";
import { mapOverviewResponse, mapPendingApprovalResponse } from "./dashboard.mapper";
import type { Overview, PendingApprovalItem } from "./dashboard.types";

export async function overviewDashboardApi(
  year?: number,
  month?: number,
  signal?: AbortSignal,
): Promise<Overview> {
  const params = new URLSearchParams();
  if (year !== undefined) params.append("year", String(year));
  if (month !== undefined) params.append("month", String(month));
  const query = params.toString();
  const url = query ? `/v1/dashboard/overview?${query}` : "/v1/dashboard/overview";

  const raw = await api.get<unknown>(url, { signal });
  return mapOverviewResponse(raw);
}

export async function pendingApprovalApi(signal?: AbortSignal): Promise<PendingApprovalItem[]> {
  const raw = await api.get<unknown>("/v1/dashboard/pending-approval", { signal });
  return mapPendingApprovalResponse(raw);
}
