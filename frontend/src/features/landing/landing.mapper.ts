import { leadResponseSchema, type Lead } from "./landing.types";

export function mapLeadResponse(raw: unknown): Lead {
  return leadResponseSchema.parse(raw).data;
}
