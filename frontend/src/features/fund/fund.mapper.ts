import {
  caixaContaSchema,
  extratoResponseSchema,
  listFundsResponseSchema,
} from "./fund.types";
import type { Fund, ExtratoResponse } from "./fund.types";

export function mapListarFundsResponse(raw: unknown): Fund[] {
  return listFundsResponseSchema.parse(raw);
}

export function mapFundResponse(raw: unknown): Fund {
  return caixaContaSchema.parse(raw);
}

export function mapExtratoResponse(raw: unknown): ExtratoResponse {
  return extratoResponseSchema.parse(raw);
}
