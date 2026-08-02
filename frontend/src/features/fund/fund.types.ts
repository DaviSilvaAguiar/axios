import { z } from "zod";

import { costCenterSchema } from "@/features/cost-center/cost-center.types";
import { userSchema } from "@/features/auth/auth.types";

export { costCenterSchema, userSchema };

export const fundStatusSchema = z.union([
  z.literal(1),
  z.literal(2),
]);

export const FUND_STATUS_ACTIVE = 1 as const;
export const FUND_STATUS_CLOSED = 2 as const;

export const FUND_STATUS_LABEL: Record<number, string> = {
  1: "Open",
  2: "Closed",
};

export const fundTypeSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);

export const FUND_TYPE_LABEL: Record<number, string> = {
  1: "Cash / PIX",
  2: "Prepaid Card",
  3: "Other",
};

export const fundSchema = z.object({
  id:              z.number(),
  user_id:      z.number(),
  cost_center_id: z.number(),
  description:       z.string(),
  balance:           z.string(),
  type:            fundTypeSchema,
  status:          fundStatusSchema,
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

export const TRANSACTION_TYPE_CREDIT = 1 as const;
export const TRANSACTION_TYPE_DEBIT = 2 as const;

export const SUBTYPE_ADVANCE     = 1 as const;
export const SUBTYPE_EXPENSE_REPORT_CHARGE   = 2 as const;
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

export const statementTransactionSchema = z.object({
  id:               z.number(),
  transaction_date:   z.string(),
  transaction_type:   z.union([z.literal(1), z.literal(2)]),
  subtype:          z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  amount:            z.string(),
  notes:       z.string().nullish(),
  reason:           z.string().nullish(),
  expense_report_id:         z.number().nullish(),
  expense_report:            z.object({ id: z.number(), description: z.string() }).nullish(),
  accumulated_balance:  z.string(),
});

export const statementPayloadSchema = z.object({
  fund: fundSchema,
  transactions:  z.array(statementTransactionSchema),
});

export const statementResponseSchema = z.object({
  data: statementPayloadSchema,
});

export const listFundsResponseSchema = z.object({
  data: z.array(fundSchema),
});

export const fundResponseSchema = z.object({
  data: fundSchema,
});

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

export const postCreditFormSchema = z.object({
  amount:          z.string().min(1, "Enter an amount"),
  transaction_date: z.string().min(1, "Enter a date"),
  notes:     z.string().optional(),
});

export const postAdjustmentFormSchema = z.object({
  subtype:        z.string().min(1, "Select the adjustment type"),
  amount:          z.string().min(1, "Enter an amount"),
  transaction_date: z.string().min(1, "Enter a date"),
  reason:         z.string().min(1, "Enter a reason"),
});

export type FundStatus       = z.infer<typeof fundStatusSchema>;
export type FundType         = z.infer<typeof fundTypeSchema>;
export type Fund             = z.infer<typeof fundSchema>;
export type StatementTransaction   = z.infer<typeof statementTransactionSchema>;
export type StatementResponse      = z.infer<typeof statementPayloadSchema>;
export type StoreFundFormData = z.infer<typeof storeFundFormSchema>;
export type PostCreditFormData  = z.infer<typeof postCreditFormSchema>;
export type PostAdjustmentFormData   = z.infer<typeof postAdjustmentFormSchema>;
