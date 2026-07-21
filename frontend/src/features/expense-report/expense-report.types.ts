import { z } from "zod";

import { costCenterSchema } from "@/features/cost-center/cost-center.types";
import { expenseCategorySchema } from "@/features/expense-category/expense-category.types";
import { userSchema } from "@/features/auth/auth.types";
import { supplierSchema } from "@/features/supplier/supplier.types";
export { costCenterSchema };
export type { CostCenter } from "@/features/cost-center/cost-center.types";
export type { ExpenseCategory } from "@/features/expense-category/expense-category.types";

export const rdcStatusSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
]);

export const EXPENSE_REPORT_STATUS_DRAFT = 1 as const;

export const EXPENSE_REPORT_STATUS_LABEL: Record<number, string> = {
  1: "Draft",
  2: "Pending",
  3: "Under Review",
  4: "Approved",
  5: "Payment Scheduled",
  6: "Paid",
  7: "Rejected",
};

export const anexoCaixaSchema = z.object({
  id: z.number(),
  expense_report_id_item: z.number(),
  path: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const expenseReportItemSchema = z.object({
  id: z.number(),
  expense_report_id: z.number(),
  cost_center_id: z.number().nullish(),
  expense_category_id: z.number().nullish(),
  description: z.string(),
  amount: z.string().nullish(),
  expense_date: z.string(),
  latitude: z.union([z.string(), z.number()]).nullish(),
  longitude: z.union([z.string(), z.number()]).nullish(),
  address: z.string().nullish(),
  description_supplier: z.string().nullish(),
  supplier_tax_id: z.string().nullish(),
  supplier_id: z.number().nullish(),
  supplier: supplierSchema.nullish(),
  cost_center: costCenterSchema.nullish(),
  expense_category: expenseCategorySchema.nullish(),
  attachments: z.array(anexoCaixaSchema).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const rdcSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  cost_center_id: z.number(),
  description: z.string(),
  status: rdcStatusSchema,
  needed_at: z.string().nullish(),
  period_start_date: z.string().nullish(),
  period_end_date: z.string().nullish(),
  notes: z.string().nullish(),
  bank: z.string().nullish(),
  branch: z.string().nullish(),
  account_number: z.string().nullish(),
  pix_key: z.string().nullish(),
  requester_description: z.string().nullish(),
  requester_department: z.string().nullish(),
  requester_tax_id: z.string().nullish(),
  requester_user_id: z.number().nullish(),
  requester_user: userSchema.nullish(),
  exported_at: z.string().nullish(),
  paid_at: z.string().nullish(),
  rejection_reason: z.string().nullish(),
  cost_center: costCenterSchema.optional(),
  items: z.array(expenseReportItemSchema).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const listExpenseReportsResponseSchema = z.object({
  data: z.array(rdcSchema),
});

export const expenseReportResponseSchema = z.object({
  data: rdcSchema,
});

export const expenseReportItemResponseSchema = z.object({
  data: expenseReportItemSchema,
});

export const storeExpenseReportFormSchema = z.object({
  cost_center_id: z.string().min(1, "Select the cost center"),
  description: z.string().min(1, "Enter a description"),
  period_start_date: z.string().min(1, "Enter the start date"),
  period_end_date: z.string().min(1, "Enter the end date"),
  requester_description: z.string(),
  requester_department: z.string().min(1, "Enter the department"),
  requester_tax_id: z.string(),
  requester_user_id: z.string().optional(),
  notes: z.string().optional(),
  bank: z.string().optional(),
  branch: z.string().optional(),
  account_number: z.string().optional(),
  pix_key: z.string().optional(),
});

export const expenseReportItemFormItemSchema = z.object({
  expense_date: z.string().min(1, "Enter a date"),
  amount: z.string().min(1, "Enter an amount"),
  cost_center_id: z.string().min(1, "Select the cost center"),
  description: z.string().min(1, "Enter a description"),
  expense_category_id: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  address: z.string().nullable().optional(),
  description_supplier: z.string().optional(),
  supplier_tax_id: z.string().optional(),
  supplier_id: z.string().optional(),
});

export const storeExpenseReportWithDespesasFormSchema = storeExpenseReportFormSchema
  .extend({
    items: z.array(expenseReportItemFormItemSchema),
  })
  .superRefine((data, ctx) => {
    const start = data.period_start_date;
    const end = data.period_end_date;

    if (!data.items || data.items.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one item",
        path: ["items"],
      });
    }

    if (start && end && end < start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "The end date must be the same as or after the start date",
        path: ["period_end_date"],
      });
    }

    if (!data.requester_user_id) {
      if (!data.requester_description) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter the requester name",
          path: ["requester_description"],
        });
      }
      if (!data.requester_tax_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter the tax ID",
          path: ["requester_tax_id"],
        });
      }
    }
  });

export type ExpenseReportStatus = z.infer<typeof rdcStatusSchema>;
export type AnexoCaixa = z.infer<typeof anexoCaixaSchema>;
export type ExpenseReportItem = z.infer<typeof expenseReportItemSchema>;
export type ExpenseReport = z.infer<typeof rdcSchema>;
export type StoreExpenseReportFormData = z.infer<typeof storeExpenseReportFormSchema>;
export type ExpenseReportItemFormItem = z.infer<typeof expenseReportItemFormItemSchema>;
export type StoreExpenseReportWithDespesasFormData = z.infer<typeof storeExpenseReportWithDespesasFormSchema>;
