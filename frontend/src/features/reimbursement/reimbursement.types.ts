import { z } from "zod";
import { paginatedSchema } from "@/lib/pagination";
import { formatarData } from "@/lib/formatters";

import { costCenterSchema } from "@/features/cost-center/cost-center.types";
export { costCenterSchema };
export type { CostCenter } from "@/features/cost-center/cost-center.types";

import { expenseCategorySchema } from "@/features/expense-category/expense-category.types";
export { expenseCategorySchema };
export type { ExpenseCategory } from "@/features/expense-category/expense-category.types";

import { supplierSchema } from "@/features/supplier/supplier.types";

export const anexoReimbursementSchema = z.object({
  id: z.number(),
  reimbursement_item_id: z.number(),
  path: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const userReimbursementSchema = z.object({
  id: z.number(),
  name: z.string(),
  role: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  erp_code: z.string().nullable(),
});

export const itemReimbursementSchema = z.object({
  id: z.number(),
  reimbursement_id: z.number(),
  cost_center_id: z.number(),
  description: z.string(),
  amount: z.string(),
  expense_date: z.string(),
  expense_category_id: z.number().nullable().optional(),
  latitude: z.union([z.string(), z.number()]).nullish(),
  longitude: z.union([z.string(), z.number()]).nullish(),
  address: z.string().nullish(),
  description_supplier: z.string().nullish(),
  supplier_tax_id: z.string().nullish(),
  supplier_id: z.number().nullish(),
  supplier: supplierSchema.nullish(),
  expense_category: expenseCategorySchema.nullish(),
  cost_center: costCenterSchema.nullish(),
  attachments: z.array(anexoReimbursementSchema).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const rcmStatusSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
]);

export const REIMBURSEMENT_STATUS_LABEL: Record<number, string> = {
  1: "Draft",
  2: "Pending",
  3: "In Review",
  4: "Approved",
  5: "Payment Scheduled",
  6: "Paid",
  7: "Rejected",
};

export const loteExportacaoRefSchema = z.object({
  id: z.number(),
  created_at: z.string(),
});

export const reimbursementSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  cost_center_id: z.number().nullish(),
  cost_center: costCenterSchema.nullish(),
  title: z.string(),
  requester_name: z.string().nullish(),
  requester_tax_id: z.string().nullish(),
  requester_department: z.string().nullish(),
  requester_user_id: z.number().nullish(),
  notes: z.string().nullish(),
  requester_user: userReimbursementSchema.nullish(),
  period_start_date: z.string(),
  period_end_date: z.string(),
  status: rcmStatusSchema,
  scheduled_payment_date: z.string().nullish(),
  rejection_reason: z.string().nullish(),
  exported_at: z.string().nullish(),
  export_batch_id: z.number().nullish(),
  bank: z.string().nullish(),
  branch: z.string().nullish(),
  account_number: z.string().nullish(),
  pix_key: z.string().nullish(),
  user: userReimbursementSchema.nullish(),
  items: z.array(itemReimbursementSchema).optional(),
  lote_exportacao: loteExportacaoRefSchema.nullish(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const listReimbursementsResponseSchema = paginatedSchema(reimbursementSchema);

export const rcmResponseSchema = z.object({
  data: reimbursementSchema,
});

export const storeReimbursementFormSchema = z.object({
  title: z.string().min(1, "Enter the title"),
  cost_center_id: z.string().min(1, "Select the cost center"),
  requester_name: z.string().optional(),
  requester_tax_id: z.string().optional(),
  requester_department: z.string().min(1, "Enter the department"),
  requester_user_id: z.string().optional(),
  notes: z.string().optional(),
  period_start_date: z.string().min(1, "Enter the date"),
  period_end_date: z.string().min(1, "Enter the date"),
  bank: z.string().optional(),
  branch: z.string().optional(),
  account_number: z.string().optional(),
  pix_key: z.string().optional(),
});

export const updateReimbursementStatusFormSchema = z.object({
  status: rcmStatusSchema,
  scheduled_payment_date: z.string().optional(),
  rejection_reason: z.string().optional(),
}).superRefine((val, ctx) => {
  if (val.status === 5 && !val.scheduled_payment_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["scheduled_payment_date"],
      message: "Enter the scheduled payment date",
    });
  }
  if (val.status === 7 && !val.rejection_reason) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["rejection_reason"],
      message: "Enter the rejection reason",
    });
  }
});

export const storeReimbursementItemFormSchema = z.object({
  expense_date: z.string().min(1, "Enter the date"),
  amount: z.string().min(1, "Enter the amount"),
  cost_center_id: z.number().min(1, "Select the cost center"),
  description: z.string().min(1, "Enter the description"),
  expense_category_id: z.string().optional(),
  anexo: z.any().optional(),
});

export const itemReimbursementFormItemSchema = z.object({
  itemId: z.number().optional(),
  expense_date: z.string().min(1, "Enter the date").refine(isValidDateYear, "Invalid date"),
  amount: z.string()
    .min(1, "Enter the amount")
    .refine((v) => parseFloat(v) >= 0.01, "The amount must be greater than zero"),
  cost_center_id: z.string().min(1, "Select the cost center"),
  description: z.string().min(1, "Enter the description"),
  expense_category_id: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  address: z.string().nullable().optional(),
  description_supplier: z.string().optional(),
  supplier_tax_id: z.string().optional(),
  supplier_id: z.string().optional(),
  anexo: z.any().optional(),
});

function isValidDateYear(v: string): boolean {
  if (!v) return true;
  const year = parseInt(v.split("-")[0], 10);
  return !isNaN(year) && year >= 1970 && year <= 2100;
}

export const storeReimbursementWithDespesasFormSchema = storeReimbursementFormSchema
  .extend({ items: z.array(itemReimbursementFormItemSchema) })
  .superRefine((val, ctx) => {
    const start = val.period_start_date;
    const end = val.period_end_date;

    if (!val.items || val.items.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one item",
        path: ["items"],
      });
    }

    if (!val.requester_user_id) {
      if (!val.requester_name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["requester_name"],
          message: "Enter the requester's name",
        });
      }
      if (!val.requester_tax_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["requester_tax_id"],
          message: "Enter the tax ID",
        });
      }
    }

    if (start && end && end < start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["period_end_date"],
        message: "The end date must be the same as or after the start date",
      });
    }

    if (start && end) {
      val.items.forEach((item, idx) => {
        const d = item.expense_date;
        if (!d) return;
        if (d < start) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["items", idx, "expense_date"],
            message: `Before the start of the period (${formatarData(start)})`,
          });
        } else if (d > end) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["items", idx, "expense_date"],
            message: `After the end of the period (${formatarData(end)})`,
          });
        }
      });
    }
  });

export type AnexoReimbursement = z.infer<typeof anexoReimbursementSchema>;
export type UserReimbursement = z.infer<typeof userReimbursementSchema>;
export type ReimbursementItem = z.infer<typeof itemReimbursementSchema>;
export type Reimbursement = z.infer<typeof reimbursementSchema>;
export type ReimbursementStatus = z.infer<typeof rcmStatusSchema>;
export type ListarReimbursementsResponse = z.infer<typeof listReimbursementsResponseSchema>;
export type ReimbursementResponse = z.infer<typeof rcmResponseSchema>;
export type StoreReimbursementFormData = z.infer<typeof storeReimbursementFormSchema>;
export type UpdateReimbursementStatusFormData = z.infer<typeof updateReimbursementStatusFormSchema>;
export type StoreReimbursementItemFormData = z.infer<typeof storeReimbursementItemFormSchema>;
export type StoreReimbursementWithDespesasFormData = z.infer<typeof storeReimbursementWithDespesasFormSchema>;
