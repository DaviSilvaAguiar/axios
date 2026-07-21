import { z } from "zod";
import { paginatedSchema } from "@/lib/pagination";

export const costCenterSchema = z.object({
  id:            z.number(),
  description:     z.string(),
  erp_code: z.string().nullable(),
  active:         z.boolean(),
});

export const listCentrosDeCustoResponseSchema = paginatedSchema(costCenterSchema);

export const costCenterResponseSchema = z.object({
  data: costCenterSchema,
});

export function buildCostCenterFormSchema(erpCodeRequired: boolean) {
  return z.object({
    description:     z.string().min(1, "Enter a description"),
    erp_code: erpCodeRequired
      ? z.string().min(1, "Enter the ERP code")
      : z.string().optional(),
    active:         z.boolean(),
  });
}

export const costCenterFormSchema = buildCostCenterFormSchema(false);

export type CostCenter                    = z.infer<typeof costCenterSchema>;
export type ListarCentrosDeCustoResponse     = z.infer<typeof listCentrosDeCustoResponseSchema>;
export type CostCenterResponse            = z.infer<typeof costCenterResponseSchema>;
export type CostCenterFormData            = z.infer<typeof costCenterFormSchema>;
