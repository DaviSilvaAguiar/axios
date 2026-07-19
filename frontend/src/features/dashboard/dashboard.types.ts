import { z } from "zod";

export const kpisSchema = z.object({
  active_funds:             z.number(),
  total_balance:            z.string(),
  pending_expense_reports:  z.number(),
  exported_batches_month:   z.number(),
});

export const movMensalItemSchema = z.object({
  year:          z.number(),
  month:         z.number(),
  credits:      z.string(),
  debits:       z.string(),
  net_balance: z.string(),
});

export const proximoPagamentoItemSchema = z.object({
  id:                        z.number(),
  description:                 z.string(),
  requester:              z.string().nullable(),
  amount:                     z.string(),
  scheduled_payment_date: z.string().nullable(),
});

export const topCentroCustoItemSchema = z.object({
  id:          z.number(),
  description:   z.string(),
  amount_spent: z.string(),
});

export const overviewSchema = z.object({
  kpis:                  kpisSchema,
  monthly_movement:   z.array(movMensalItemSchema),
  upcoming_payments:   z.array(proximoPagamentoItemSchema),
  top_cost_centers_month: z.array(topCentroCustoItemSchema),
});

export const overviewResponseSchema = z.object({
  data: overviewSchema,
});

export const pendingApprovalItemSchema = z.object({
  type:         z.union([z.literal("expense_report"), z.literal("reimbursement")]),
  id:           z.number(),
  description:    z.string(),
  requester: z.string().nullable(),
  amount:        z.string(),
  created_at:   z.string().nullable(),
});

export const pendingApprovalResponseSchema = z.object({
  data: z.array(pendingApprovalItemSchema),
});

export type Kpis                  = z.infer<typeof kpisSchema>;
export type MonthlyMovementItem         = z.infer<typeof movMensalItemSchema>;
export type UpcomingPaymentItem  = z.infer<typeof proximoPagamentoItemSchema>;
export type TopCostCenterItem    = z.infer<typeof topCentroCustoItemSchema>;
export type Overview              = z.infer<typeof overviewSchema>;
export type PendingApprovalItem = z.infer<typeof pendingApprovalItemSchema>;
