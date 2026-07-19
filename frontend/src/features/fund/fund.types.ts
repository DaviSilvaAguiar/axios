import { z } from "zod";

import { costCenterSchema } from "@/features/cost-center/cost-center.types";
import { userSchema } from "@/features/auth/auth.types";

export { costCenterSchema, userSchema };

export const caixaContaStatusSchema = z.union([
  z.literal(1),
  z.literal(2),
]);

export const FUND_STATUS_ACTIVE = 1 as const;
export const FUND_STATUS_CLOSED = 2 as const;

export const FUND_STATUS_LABEL: Record<number, string> = {
  1: "Open",
  2: "Closed",
};

export const caixaContaTipoSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);

export const FUND_TIPO_LABEL: Record<number, string> = {
  1: "Cash / PIX",
  2: "Prepaid Card",
  3: "Other",
};

export const caixaContaSchema = z.object({
  id:              z.number(),
  user_id:      z.number(),
  cost_center_id: z.number(),
  description:       z.string(),
  balance:           z.string(),
  type:            caixaContaTipoSchema,
  status:          caixaContaStatusSchema,
  bank:           z.string().nullish(),
  branch:         z.string().nullish(),
  account_number:    z.string().nullish(),
  pix_key:       z.string().nullish(),
  paid_at:  z.string().nullish(),
  user:         userSchema.optional(),
  cost_center: costCenterSchema.optional(),
  created_at:      z.string(),
  updated_at:      z.string(),
});

export const TIPO_TRANSACAO_CREDIT = 1 as const;
export const TIPO_TRANSACAO_DEBIT = 2 as const;

export const SUBTYPE_ADVANCE     = 1 as const;
export const SUBTYPE_DEDUCTION_RDC   = 2 as const;
export const SUBTYPE_REFUND        = 3 as const;
export const SUBTYPE_POSITIVE_ADJUSTMENT  = 4 as const;
export const SUBTYPE_NEGATIVE_ADJUSTMENT  = 5 as const;

export const SUBTYPE_LABEL: Record<number, string> = {
  1: "Advance",
  2: "Expense Report Deduction",
  3: "Return",
  4: "Positive Adjustment",
  5: "Negative Adjustment",
};

export const transacaoExtratoSchema = z.object({
  id:               z.number(),
  transaction_date:   z.string(),
  transaction_type:   z.union([z.literal(1), z.literal(2)]),
  subtype:          z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  amount:            z.string(),
  notes:       z.string().nullish(),
  reason:           z.string().nullish(),
  expense_report_id:         z.number().nullish(),
  caixa:            z.object({ id: z.number(), description: z.string() }).nullish(),
  accumulated_balance:  z.string(),
});

export const extratoResponseSchema = z.object({
  fund: caixaContaSchema,
  transactions:  z.array(transacaoExtratoSchema),
});

export const listFundsResponseSchema = z.array(caixaContaSchema);

export const storeFundFormSchema = z.object({
  user_id:      z.string().min(1, "Select the person in charge"),
  cost_center_id: z.string().min(1, "Select the cost center"),
  description:       z.string().min(1, "Enter a description").max(100, "Maximum of 100 characters"),
  type:            z.string().min(1, "Select the type"),
  bank:           z.string().max(3).optional(),
  branch:         z.string().max(6).optional(),
  account_number:    z.string().max(16).optional(),
  pix_key:       z.string().max(77).optional(),
});

export const lancarCreditoFormSchema = z.object({
  amount:          z.string().min(1, "Enter an amount"),
  transaction_date: z.string().min(1, "Enter a date"),
  notes:     z.string().optional(),
});

export const lancarAjusteFormSchema = z.object({
  subtype:        z.string().min(1, "Select the adjustment type"),
  amount:          z.string().min(1, "Enter an amount"),
  transaction_date: z.string().min(1, "Enter a date"),
  reason:         z.string().min(1, "Enter a reason"),
});

export type FundStatus       = z.infer<typeof caixaContaStatusSchema>;
export type FundTipo         = z.infer<typeof caixaContaTipoSchema>;
export type Fund             = z.infer<typeof caixaContaSchema>;
export type TransacaoExtrato       = z.infer<typeof transacaoExtratoSchema>;
export type ExtratoResponse        = z.infer<typeof extratoResponseSchema>;
export type StoreFundFormData = z.infer<typeof storeFundFormSchema>;
export type LancarCreditoFormData  = z.infer<typeof lancarCreditoFormSchema>;
export type LancarAjusteFormData   = z.infer<typeof lancarAjusteFormSchema>;
