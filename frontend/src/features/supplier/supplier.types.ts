import { z } from "zod";
import { paginatedSchema } from "@/lib/pagination";

export const tipoPessoaSchema = z.enum(["F", "J"]);
export type TipoPessoa = z.infer<typeof tipoPessoaSchema>;

export const fornecedorSchema = z.object({
  id:           z.number(),
  descricao:    z.string(),
  cpf_cnpj:     z.string(),
  tipo_pessoa:  tipoPessoaSchema,
  email:        z.string().nullable(),
  telefone:     z.string().nullable(),
  cep:          z.string().nullable(),
  logradouro:   z.string().nullable(),
  numero:       z.string().nullable(),
  complemento:  z.string().nullable(),
  bairro:       z.string().nullable(),
  cidade:       z.string().nullable(),
  uf:           z.string().nullable(),
  codigo_erp:   z.string().nullable(),
  ativo:        z.boolean(),
});

export const listarFornecedoresResponseSchema = paginatedSchema(fornecedorSchema);

export const fornecedorResponseSchema = z.object({
  mensagem:    z.string(),
  fornecedor:  fornecedorSchema,
});

const apenasDigitos = (v: string) => v.replace(/\D/g, "");

export function buildFornecedorFormSchema(codigoErpObrigatorio: boolean) {
  return z
    .object({
      descricao:    z.string().min(1, "Informe a descrição"),
      cpf_cnpj:     z.string().min(1, "Informe o CPF ou CNPJ"),
      tipo_pessoa:  tipoPessoaSchema,
      email:        z.string().email("E-mail inválido").or(z.literal("")).optional(),
      telefone:     z.string().optional(),
      cep:          z.string().optional(),
      logradouro:   z.string().optional(),
      numero:       z.string().optional(),
      complemento:  z.string().optional(),
      bairro:       z.string().optional(),
      cidade:       z.string().optional(),
      uf:           z.string().optional(),
      codigo_erp:   codigoErpObrigatorio
        ? z.string().min(1, "Informe o código no ERP")
        : z.string().optional(),
      ativo:        z.boolean(),
    })
    .superRefine((data, ctx) => {
      const digits = apenasDigitos(data.cpf_cnpj);
      if (data.tipo_pessoa === "F" && digits.length !== 11) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cpf_cnpj"],
          message: "CPF deve ter 11 dígitos",
        });
      }
      if (data.tipo_pessoa === "J" && digits.length !== 14) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cpf_cnpj"],
          message: "CNPJ deve ter 14 dígitos",
        });
      }
    });
}

export const fornecedorFormSchema = buildFornecedorFormSchema(false);

export const consultaCnpjSchema = z.object({
  data: z
    .object({
      descricao:    z.string().nullable(),
      email:        z.string().nullable(),
      telefone:     z.string().nullable(),
      cep:          z.string().nullable(),
      logradouro:   z.string().nullable(),
      numero:       z.string().nullable(),
      complemento:  z.string().nullable(),
      bairro:       z.string().nullable(),
      cidade:       z.string().nullable(),
      uf:           z.string().nullable(),
    })
    .nullable(),
});

export type Fornecedor                   = z.infer<typeof fornecedorSchema>;
export type ListarFornecedoresResponse   = z.infer<typeof listarFornecedoresResponseSchema>;
export type FornecedorResponse           = z.infer<typeof fornecedorResponseSchema>;
export type FornecedorFormData           = z.infer<typeof fornecedorFormSchema>;
export type ConsultaCnpjResponse         = z.infer<typeof consultaCnpjSchema>;
export type ConsultaCnpjData             = NonNullable<ConsultaCnpjResponse["data"]>;
