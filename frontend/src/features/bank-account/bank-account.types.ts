import { z } from "zod";
import { paginatedSchema } from "@/lib/pagination";

export const bankAccountSchema = z.object({
  id:          z.number(),
  description:   z.string(),
  erp_code:  z.string().nullable(),
  active:       z.boolean(),
});

export const listContasBancariasResponseSchema = paginatedSchema(bankAccountSchema);

export const bankAccountResponseSchema = z.object({
  data: bankAccountSchema,
});

export function buildBankAccountFormSchema(erpCodeRequired: boolean) {
  return z.object({
    description:   z.string().min(1, "Enter a description"),
    erp_code:  erpCodeRequired
      ? z.string().min(1, "Enter the ERP code")
      : z.string().optional(),
    active:       z.boolean(),
  });
}

export const bankAccountFormSchema = buildBankAccountFormSchema(false);

export type BankAccount                 = z.infer<typeof bankAccountSchema>;
export type ListarContasBancariasResponse = z.infer<typeof listContasBancariasResponseSchema>;
export type BankAccountResponse         = z.infer<typeof bankAccountResponseSchema>;
export type BankAccountFormData         = z.infer<typeof bankAccountFormSchema>;
