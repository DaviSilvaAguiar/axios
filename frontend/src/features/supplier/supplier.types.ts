import { z } from "zod";
import { paginatedSchema } from "@/lib/pagination";

export const personTypeSchema = z.enum(["F", "J"]);
export type PersonType = z.infer<typeof personTypeSchema>;

export const supplierSchema = z.object({
  id:           z.number(),
  description:  z.string(),
  tax_id:       z.string(),
  person_type:  personTypeSchema,
  email:        z.string().nullable(),
  phone:        z.string().nullable(),
  postal_code:  z.string().nullable(),
  street:       z.string().nullable(),
  number:       z.string().nullable(),
  complement:   z.string().nullable(),
  district:     z.string().nullable(),
  city:         z.string().nullable(),
  uf:           z.string().nullable(),
  erp_code:     z.string().nullable(),
  active:       z.boolean(),
});

export const listSuppliersResponseSchema = paginatedSchema(supplierSchema);

export const supplierResponseSchema = z.object({
  data: supplierSchema,
});

const onlyDigits = (v: string) => v.replace(/\D/g, "");

export function buildSupplierFormSchema(erpCodeRequired: boolean) {
  return z
    .object({
      description:  z.string().min(1, "Enter a description"),
      tax_id:       z.string().min(1, "Enter the tax ID"),
      person_type:  personTypeSchema,
      email:        z.string().email("Invalid email").or(z.literal("")).optional(),
      phone:        z.string().optional(),
      postal_code:  z.string().optional(),
      street:       z.string().optional(),
      number:       z.string().optional(),
      complement:   z.string().optional(),
      district:     z.string().optional(),
      city:         z.string().optional(),
      uf:           z.string().optional(),
      erp_code:     erpCodeRequired
        ? z.string().min(1, "Enter the ERP code")
        : z.string().optional(),
      active:       z.boolean(),
    })
    .superRefine((data, ctx) => {
      const digits = onlyDigits(data.tax_id);
      if (data.person_type === "F" && digits.length !== 11) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tax_id"],
          message: "CPF must have 11 digits",
        });
      }
      if (data.person_type === "J" && digits.length !== 14) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tax_id"],
          message: "CNPJ must have 14 digits",
        });
      }
    });
}

export const supplierFormSchema = buildSupplierFormSchema(false);

export const cnpjLookupSchema = z.object({
  data: z
    .object({
      description:  z.string().nullable(),
      email:        z.string().nullable(),
      phone:        z.string().nullable(),
      postal_code:  z.string().nullable(),
      street:       z.string().nullable(),
      number:       z.string().nullable(),
      complement:   z.string().nullable(),
      district:     z.string().nullable(),
      city:         z.string().nullable(),
      uf:           z.string().nullable(),
    })
    .nullable(),
});

export type Supplier                   = z.infer<typeof supplierSchema>;
export type SupplierListResponse   = z.infer<typeof listSuppliersResponseSchema>;
export type SupplierResponse           = z.infer<typeof supplierResponseSchema>;
export type SupplierFormData           = z.infer<typeof supplierFormSchema>;
export type CnpjLookupResponse         = z.infer<typeof cnpjLookupSchema>;
export type CnpjLookupData             = NonNullable<CnpjLookupResponse["data"]>;
