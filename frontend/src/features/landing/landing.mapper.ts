import { leadResponseSchema, type LeadResponse } from "./landing.types";

export function mapLeadResponse(raw: unknown): LeadResponse {
  return leadResponseSchema.parse(raw);
}
