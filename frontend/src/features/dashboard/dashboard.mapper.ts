import {
  overviewResponseSchema,
  pendentesAprovacaoResponseSchema,
  type Overview,
  type PendenteAprovacaoItem,
} from "./dashboard.types";

export function mapOverviewResponse(raw: unknown): Overview {
  return overviewResponseSchema.parse(raw).data;
}

export function mapPendentesAprovacaoResponse(raw: unknown): PendenteAprovacaoItem[] {
  return pendentesAprovacaoResponseSchema.parse(raw).data;
}
