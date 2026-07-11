import { z } from "zod";
import { paginatedSchema } from "@/lib/pagination";

export const centroDeCustoSchema = z.object({
  id:            z.number(),
  descricao:     z.string(),
  codigo_cc_erp: z.string().nullable(),
  ativo:         z.boolean(),
});

export const listarCentrosDeCustoResponseSchema = paginatedSchema(centroDeCustoSchema);

export const centroDeCustoResponseSchema = z.object({
  mensagem:      z.string(),
  centro_custo:  centroDeCustoSchema,
});

export function buildCentroDeCustoFormSchema(codigoErpObrigatorio: boolean) {
  return z.object({
    descricao:     z.string().min(1, "Informe a descrição"),
    codigo_cc_erp: codigoErpObrigatorio
      ? z.string().min(1, "Informe o código no ERP")
      : z.string().optional(),
    ativo:         z.boolean(),
  });
}

export const centroDeCustoFormSchema = buildCentroDeCustoFormSchema(false);

export type CentroDeCusto                    = z.infer<typeof centroDeCustoSchema>;
export type ListarCentrosDeCustoResponse     = z.infer<typeof listarCentrosDeCustoResponseSchema>;
export type CentroDeCustoResponse            = z.infer<typeof centroDeCustoResponseSchema>;
export type CentroDeCustoFormData            = z.infer<typeof centroDeCustoFormSchema>;
