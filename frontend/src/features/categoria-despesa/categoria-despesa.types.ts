import { z } from "zod";
import { paginatedSchema } from "@/lib/pagination";

export const categoriaDespesaSchema = z.object({
  id:          z.number(),
  descricao:   z.string(),
  codigo_erp:  z.string().nullable(),
  ativo:       z.boolean(),
});

export const listarCategoriasDespesaResponseSchema = paginatedSchema(categoriaDespesaSchema);

export const categoriaDespesaResponseSchema = z.object({
  mensagem:           z.string(),
  categoria_despesa:  categoriaDespesaSchema,
});

export function buildCategoriaDespesaFormSchema(codigoErpObrigatorio: boolean) {
  return z.object({
    descricao:   z.string().min(1, "Informe a descrição"),
    codigo_erp:  codigoErpObrigatorio
      ? z.string().min(1, "Informe o código no ERP")
      : z.string().optional(),
    ativo:       z.boolean(),
  });
}

export const categoriaDespesaFormSchema = buildCategoriaDespesaFormSchema(false);

export type CategoriaDespesa                    = z.infer<typeof categoriaDespesaSchema>;
export type ListarCategoriasDespesaResponse     = z.infer<typeof listarCategoriasDespesaResponseSchema>;
export type CategoriaDespesaResponse            = z.infer<typeof categoriaDespesaResponseSchema>;
export type CategoriaDespesaFormData            = z.infer<typeof categoriaDespesaFormSchema>;
