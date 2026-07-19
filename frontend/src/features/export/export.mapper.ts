import type { Paginated } from "@/lib/pagination";
import {
  pendentesPaginadosResponseSchema,
  statsPendentesResponseSchema,
  historicoResponseSchema,
  type DocumentoPendente,
  type LoteHistorico,
  type StatsPendentes,
} from "./exportacao.types";

export function mapPendentesPaginados(raw: unknown): Paginated<DocumentoPendente> {
  return pendentesPaginadosResponseSchema.parse(raw);
}

export function mapStatsPendentes(raw: unknown): StatsPendentes {
  return statsPendentesResponseSchema.parse(raw).data;
}

export function mapHistorico(raw: unknown): Paginated<LoteHistorico> {
  return historicoResponseSchema.parse(raw);
}
