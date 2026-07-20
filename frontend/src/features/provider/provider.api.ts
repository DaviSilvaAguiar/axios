import { api } from "@/lib/api";
import { mapSubmissionList } from "./provider.mapper";
import type { SubmissionList, SubmissionFilter } from "./provider.types";

export async function listSubmissionsApi(
  filter: SubmissionFilter = "all",
  page = 1,
  perPage = 10,
  signal?: AbortSignal
): Promise<SubmissionList> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  if (filter !== "all") params.append("type", filter);

  const raw = await api.get<unknown>(`/v1/provider/transactions?${params.toString()}`, { signal });
  return mapSubmissionList(raw);
}
