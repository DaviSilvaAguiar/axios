import { z } from "zod";
import { userSchema } from "@/features/auth/auth.types";
import { paginatedSchema } from "@/lib/pagination";

export const batchTypeSchema = z.enum(["EXPENSE_REPORT", "REIMBURSEMENT"]);
export type BatchType = z.infer<typeof batchTypeSchema>;

export const pendingDocumentSchema = z.object({
  id: z.number(),
  identifier: z.string(),
  description: z.string().nullable(),
  provider: z.string(),
  cost_center: z.string().nullable(),
  amount: z.coerce.number(),
  date: z.string().nullable(),
  status: z.string(),
  type: batchTypeSchema,
});
export type PendingDocument = z.infer<typeof pendingDocumentSchema>;

export const pendingDocumentsResponseSchema = paginatedSchema(pendingDocumentSchema);

export const pendingStatsResponseSchema = z.object({
  data: z.object({
    expense_report: z.object({ quantity: z.number(), amount: z.coerce.number() }),
    reimbursement: z.object({ quantity: z.number(), amount: z.coerce.number() }),
  }),
});
export type PendingStats = z.infer<typeof pendingStatsResponseSchema>["data"];

export const batchHistorySchema = z.object({
  id: z.number(),
  batch_type: batchTypeSchema,
  template_used: z.string(),
  total_amount: z.coerce.number(),
  item_count: z.number(),
  file_name: z.string().nullable(),
  user: userSchema.pick({ id: true, name: true, email: true, role: true }).nullable(),
  created_at: z.string(),
});
export type BatchHistory = z.infer<typeof batchHistorySchema>;

export const historyResponseSchema = paginatedSchema(batchHistorySchema);
