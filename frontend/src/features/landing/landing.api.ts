import { api } from "@/lib/api";
import { mapLeadResponse } from "./landing.mapper";
import type { LeadFormData, LeadResponse } from "./landing.types";

export async function sendLeadApi(data: LeadFormData): Promise<LeadResponse> {
  const raw = await api.post<unknown>("/v1/leads", data);
  return mapLeadResponse(raw);
}
