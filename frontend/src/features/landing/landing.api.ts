import { api } from "@/lib/api";
import { mapLeadResponse } from "./landing.mapper";
import type { LeadFormData, LeadResponse } from "./landing.types";

export async function enviarLeadApi(dados: LeadFormData): Promise<LeadResponse> {
  const raw = await api.post<unknown>("/v1/leads", dados);
  return mapLeadResponse(raw);
}
