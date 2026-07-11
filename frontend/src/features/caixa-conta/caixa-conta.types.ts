import { z } from "zod";

import { centroDeCustoSchema } from "@/features/centro-de-custo/centro-de-custo.types";
import { usuarioSchema } from "@/features/auth/auth.types";

export { centroDeCustoSchema, usuarioSchema };

// ── Status e Tipo ───────────────────────────────────────────────

export const caixaContaStatusSchema = z.union([
  z.literal(1), // Ativo
  z.literal(2), // Fechado
]);

export const CAIXA_CONTA_STATUS_ATIVO = 1 as const;
export const CAIXA_CONTA_STATUS_FECHADO = 2 as const;

export const CAIXA_CONTA_STATUS_LABEL: Record<number, string> = {
  1: "Aberto",
  2: "Fechado",
};

export const caixaContaTipoSchema = z.union([
  z.literal(1), // Dinheiro/PIX
  z.literal(2), // Cartão Pré-Pago
  z.literal(3), // Outro
]);

export const CAIXA_CONTA_TIPO_LABEL: Record<number, string> = {
  1: "Dinheiro / PIX",
  2: "Cartão Pré-Pago",
  3: "Outro",
};

// ── Caixa Conta ─────────────────────────────────────────────────

export const caixaContaSchema = z.object({
  id:              z.number(),
  id_usuario:      z.number(),
  id_centro_custo: z.number(),
  descricao:       z.string(),
  saldo:           z.string(),
  tipo:            caixaContaTipoSchema,
  status:          caixaContaStatusSchema,
  banco:           z.string().nullish(),
  agencia:         z.string().nullish(),
  numero_banco:    z.string().nullish(),
  chave_pix:       z.string().nullish(),
  data_pagamento:  z.string().nullish(),
  usuario:         usuarioSchema.optional(),
  centro_de_custo: centroDeCustoSchema.optional(),
  created_at:      z.string(),
  updated_at:      z.string(),
});

// ── Transações / Extrato ────────────────────────────────────────

export const TIPO_TRANSACAO_CREDITO = 1 as const;
export const TIPO_TRANSACAO_DEBITO = 2 as const;

export const SUBTIPO_ADIANTAMENTO     = 1 as const;
export const SUBTIPO_ABATIMENTO_RDC   = 2 as const;
export const SUBTIPO_DEVOLUCAO        = 3 as const;
export const SUBTIPO_AJUSTE_POSITIVO  = 4 as const;
export const SUBTIPO_AJUSTE_NEGATIVO  = 5 as const;

export const SUBTIPO_LABEL: Record<number, string> = {
  1: "Adiantamento",
  2: "Abatimento RDC",
  3: "Devolução",
  4: "Ajuste Positivo",
  5: "Ajuste Negativo",
};

export const transacaoExtratoSchema = z.object({
  id:               z.number(),
  data_transacao:   z.string(),
  tipo_transacao:   z.union([z.literal(1), z.literal(2)]),
  subtipo:          z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  valor:            z.string(),
  observacao:       z.string().nullish(),
  motivo:           z.string().nullish(),
  id_caixa:         z.number().nullish(),
  caixa:            z.object({ id: z.number(), descricao: z.string() }).nullish(),
  saldo_acumulado:  z.string(),
});

export const extratoResponseSchema = z.object({
  caixa_conta: caixaContaSchema,
  transacoes:  z.array(transacaoExtratoSchema),
});

// ── Respostas ───────────────────────────────────────────────────

export const listarCaixaContasResponseSchema = z.array(caixaContaSchema);

// ── Formulários ─────────────────────────────────────────────────

export const storeCaixaContaFormSchema = z.object({
  id_usuario:      z.string().min(1, "Selecione o responsável"),
  id_centro_custo: z.string().min(1, "Selecione o centro de custo"),
  descricao:       z.string().min(1, "Informe a descrição").max(100, "Máximo de 100 caracteres"),
  tipo:            z.string().min(1, "Selecione o tipo"),
  banco:           z.string().max(3).optional(),
  agencia:         z.string().max(6).optional(),
  numero_banco:    z.string().max(16).optional(),
  chave_pix:       z.string().max(77).optional(),
});

export const lancarCreditoFormSchema = z.object({
  valor:          z.string().min(1, "Informe o valor"),
  data_transacao: z.string().min(1, "Informe a data"),
  observacao:     z.string().optional(),
});

export const lancarAjusteFormSchema = z.object({
  subtipo:        z.string().min(1, "Selecione o tipo de ajuste"),
  valor:          z.string().min(1, "Informe o valor"),
  data_transacao: z.string().min(1, "Informe a data"),
  motivo:         z.string().min(1, "Informe o motivo"),
});

// ── Tipos inferidos ─────────────────────────────────────────────

export type CaixaContaStatus       = z.infer<typeof caixaContaStatusSchema>;
export type CaixaContaTipo         = z.infer<typeof caixaContaTipoSchema>;
export type CaixaConta             = z.infer<typeof caixaContaSchema>;
export type TransacaoExtrato       = z.infer<typeof transacaoExtratoSchema>;
export type ExtratoResponse        = z.infer<typeof extratoResponseSchema>;
export type StoreCaixaContaFormData = z.infer<typeof storeCaixaContaFormSchema>;
export type LancarCreditoFormData  = z.infer<typeof lancarCreditoFormSchema>;
export type LancarAjusteFormData   = z.infer<typeof lancarAjusteFormSchema>;
