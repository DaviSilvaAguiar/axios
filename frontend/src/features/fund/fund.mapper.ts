import {
  caixaContaSchema,
  extratoResponseSchema,
  listarCaixaContasResponseSchema,
} from "./caixa-conta.types";
import type { CaixaConta, ExtratoResponse } from "./caixa-conta.types";

export function mapListarCaixaContasResponse(raw: unknown): CaixaConta[] {
  return listarCaixaContasResponseSchema.parse(raw);
}

export function mapCaixaContaResponse(raw: unknown): CaixaConta {
  return caixaContaSchema.parse(raw);
}

export function mapExtratoResponse(raw: unknown): ExtratoResponse {
  return extratoResponseSchema.parse(raw);
}
