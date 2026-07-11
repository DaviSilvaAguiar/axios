import { z } from "zod";
import { paginatedSchema } from "@/lib/pagination";

export const contaBancariaSchema = z.object({
  id:          z.number(),
  descricao:   z.string(),
  codigo_erp:  z.string().nullable(),
  ativo:       z.boolean(),
});

export const listarContasBancariasResponseSchema = paginatedSchema(contaBancariaSchema);

export const contaBancariaResponseSchema = z.object({
  mensagem:        z.string(),
  conta_bancaria:  contaBancariaSchema,
});

export function buildContaBancariaFormSchema(codigoErpObrigatorio: boolean) {
  return z.object({
    descricao:   z.string().min(1, "Informe a descrição"),
    codigo_erp:  codigoErpObrigatorio
      ? z.string().min(1, "Informe o código no ERP")
      : z.string().optional(),
    ativo:       z.boolean(),
  });
}

export const contaBancariaFormSchema = buildContaBancariaFormSchema(false);

export type ContaBancaria                 = z.infer<typeof contaBancariaSchema>;
export type ListarContasBancariasResponse = z.infer<typeof listarContasBancariasResponseSchema>;
export type ContaBancariaResponse         = z.infer<typeof contaBancariaResponseSchema>;
export type ContaBancariaFormData         = z.infer<typeof contaBancariaFormSchema>;
