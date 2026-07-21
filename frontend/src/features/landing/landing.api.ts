import { api } from "@/lib/api";
import { mapLeadResponse } from "./landing.mapper";
import type { Lead, LeadFormData } from "./landing.types";

export async function sendLeadApi(data: LeadFormData): Promise<Lead> {
  const raw = await api.post<unknown>("/v1/leads", data);
  return mapLeadResponse(raw);
}
