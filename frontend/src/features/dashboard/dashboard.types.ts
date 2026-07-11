import { z } from "zod";

// ── KPIs ─────────────────────────────────────────────────────────

export const kpisSchema = z.object({
  caixas_ativos:        z.number(),
  saldo_total:          z.string(),
  rdcs_pendentes:       z.number(),
  lotes_exportados_mes: z.number(),
});

// ── Movimentação mensal ──────────────────────────────────────────

export const movMensalItemSchema = z.object({
  ano:           z.number(),
  mes:           z.number(),
  creditos:      z.string(),
  debitos:       z.string(),
  saldo_liquido: z.string(),
});

// ── Próximos pagamentos agendados ───────────────────────────────

export const proximoPagamentoItemSchema = z.object({
  id:                        z.number(),
  descricao:                 z.string(),
  requisitante:              z.string().nullable(),
  valor:                     z.string(),
  data_pagamento_programado: z.string().nullable(),
});

// ── Top centros de custo ─────────────────────────────────────────

export const topCentroCustoItemSchema = z.object({
  id:          z.number(),
  descricao:   z.string(),
  valor_gasto: z.string(),
});

// ── Resposta completa ────────────────────────────────────────────

export const overviewSchema = z.object({
  kpis:                  kpisSchema,
  movimentacao_mensal:   z.array(movMensalItemSchema),
  proximos_pagamentos:   z.array(proximoPagamentoItemSchema),
  top_centros_custo_mes: z.array(topCentroCustoItemSchema),
});

export const overviewResponseSchema = z.object({
  data: overviewSchema,
});

// ── Pendentes de aprovação (combinado RDC + RCM) ─────────────────

export const pendenteAprovacaoItemSchema = z.object({
  tipo:         z.union([z.literal("rdc"), z.literal("rcm")]),
  id:           z.number(),
  descricao:    z.string(),
  requisitante: z.string().nullable(),
  valor:        z.string(),
  created_at:   z.string().nullable(),
});

export const pendentesAprovacaoResponseSchema = z.object({
  data: z.array(pendenteAprovacaoItemSchema),
});

// ── Tipos inferidos ──────────────────────────────────────────────

export type Kpis                  = z.infer<typeof kpisSchema>;
export type MovMensalItem         = z.infer<typeof movMensalItemSchema>;
export type ProximoPagamentoItem  = z.infer<typeof proximoPagamentoItemSchema>;
export type TopCentroCustoItem    = z.infer<typeof topCentroCustoItemSchema>;
export type Overview              = z.infer<typeof overviewSchema>;
export type PendenteAprovacaoItem = z.infer<typeof pendenteAprovacaoItemSchema>;
