import { api } from "@/lib/api";
import { mapOverviewResponse, mapPendentesAprovacaoResponse } from "./dashboard.mapper";
import type { Overview, PendenteAprovacaoItem } from "./dashboard.types";

export async function overviewDashboardApi(ano?: number, mes?: number): Promise<Overview> {
  const params = new URLSearchParams();
  if (ano !== undefined) params.append("ano", String(ano));
  if (mes !== undefined) params.append("mes", String(mes));
  const query = params.toString();
  const url = query ? `/v1/dashboard/overview?${query}` : "/v1/dashboard/overview";

  const raw = await api.get<unknown>(url);
  return mapOverviewResponse(raw);
}

export async function pendentesAprovacaoApi(): Promise<PendenteAprovacaoItem[]> {
  const raw = await api.get<unknown>("/v1/dashboard/pendentes-aprovacao");
  return mapPendentesAprovacaoResponse(raw);
}
