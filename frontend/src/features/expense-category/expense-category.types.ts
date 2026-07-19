import { z } from "zod";
import { paginatedSchema } from "@/lib/pagination";

export const expenseCategorySchema = z.object({
  id:          z.number(),
  description:   z.string(),
  erp_code:  z.string().nullable(),
  active:       z.boolean(),
});

export const listCategoriasDespesaResponseSchema = paginatedSchema(expenseCategorySchema);

export const expenseCategoryResponseSchema = z.object({
  message:           z.string(),
  expense_category:  expenseCategorySchema,
});

export function buildExpenseCategoryFormSchema(erpCodeRequired: boolean) {
  return z.object({
    description:   z.string().min(1, "Enter a description"),
    erp_code:  erpCodeRequired
      ? z.string().min(1, "Enter the ERP code")
      : z.string().optional(),
    active:       z.boolean(),
  });
}

export const expenseCategoryFormSchema = buildExpenseCategoryFormSchema(false);

export type ExpenseCategory                    = z.infer<typeof expenseCategorySchema>;
export type ListarCategoriasDespesaResponse     = z.infer<typeof listCategoriasDespesaResponseSchema>;
export type ExpenseCategoryResponse            = z.infer<typeof expenseCategoryResponseSchema>;
export type ExpenseCategoryFormData            = z.infer<typeof expenseCategoryFormSchema>;
