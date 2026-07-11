import { z } from "zod";

// ── Entidades relacionadas ──────────────────────────────────────

import { centroDeCustoSchema } from "@/features/centro-de-custo/centro-de-custo.types";
import { categoriaDespesaSchema } from "@/features/categoria-despesa/categoria-despesa.types";
import { usuarioSchema } from "@/features/auth/auth.types";
import { fornecedorSchema } from "@/features/fornecedor/fornecedor.types";
export { centroDeCustoSchema };
export type { CentroDeCusto } from "@/features/centro-de-custo/centro-de-custo.types";
export type { CategoriaDespesa } from "@/features/categoria-despesa/categoria-despesa.types";

// ── Status ──────────────────────────────────────────────────────

export const rdcStatusSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
]);

export const RDC_STATUS_RASCUNHO = 1 as const;

export const RDC_STATUS_LABEL: Record<number, string> = {
  1: "Rascunho",
  2: "Pendente",
  3: "Em Análise",
  4: "Aprovado",
  5: "Pagamento Agendado",
  6: "Pago",
  7: "Rejeitado",
};

// ── Anexo de Despesa ────────────────────────────────────────────

export const anexoCaixaSchema = z.object({
  id: z.number(),
  id_caixa_despesa: z.number(),
  caminho: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// ── Despesa de RDC ──────────────────────────────────────────────

export const despesaRdcSchema = z.object({
  id: z.number(),
  id_caixa: z.number(),
  id_centro_custo: z.number().nullish(),
  id_categoria_despesa: z.number().nullish(),
  descricao: z.string(),
  valor: z.string().nullish(),
  data_despesa: z.string(),
  latitude: z.union([z.string(), z.number()]).nullish(),
  longitude: z.union([z.string(), z.number()]).nullish(),
  endereco: z.string().nullish(),
  descricao_fornecedor: z.string().nullish(),
  cpf_cnpj_fornecedor: z.string().nullish(),
  id_fornecedor: z.number().nullish(),
  fornecedor: fornecedorSchema.nullish(),
  centro_de_custo: centroDeCustoSchema.nullish(),
  categoria_despesa: categoriaDespesaSchema.nullish(),
  anexos: z.array(anexoCaixaSchema).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

// ── RDC principal ───────────────────────────────────────────────

export const rdcSchema = z.object({
  id: z.number(),
  id_usuario: z.number(),
  id_centro_custo: z.number(),
  descricao: z.string(),
  status: rdcStatusSchema,
  data_necessidade: z.string().nullish(),
  data_inicio_periodo: z.string().nullish(),
  data_fim_periodo: z.string().nullish(),
  obs: z.string().nullish(),
  banco: z.string().nullish(),
  agencia: z.string().nullish(),
  numero_banco: z.string().nullish(),
  chave_pix: z.string().nullish(),
  descricao_requisitante: z.string().nullish(),
  setor_requisitante: z.string().nullish(),
  cpf_cnpj_requisitante: z.string().nullish(),
  id_usuario_requisitante: z.number().nullish(),
  usuario_requisitante: usuarioSchema.nullish(),
  data_exportacao: z.string().nullish(),
  data_pagamento: z.string().nullish(),
  motivo_rejeicao: z.string().nullish(),
  centro_de_custo: centroDeCustoSchema.optional(),
  despesas: z.array(despesaRdcSchema).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

// ── Respostas da API ────────────────────────────────────────────

export const listarRdcsResponseSchema = z.array(rdcSchema);

// ── Formulários ─────────────────────────────────────────────────

export const storeRdcFormSchema = z.object({
  id_centro_custo: z.string().min(1, "Selecione o centro de custo"),
  descricao: z.string().min(1, "Informe a descrição"),
  data_inicio_periodo: z.string().min(1, "Informe a data de início"),
  data_fim_periodo: z.string().min(1, "Informe a data de fim"),
  descricao_requisitante: z.string(),
  setor_requisitante: z.string().min(1, "Informe o setor"),
  cpf_cnpj_requisitante: z.string(),
  id_usuario_requisitante: z.string().optional(),
  obs: z.string().optional(),
  banco: z.string().optional(),
  agencia: z.string().optional(),
  numero_banco: z.string().optional(),
  chave_pix: z.string().optional(),
});

export const despesaRdcFormItemSchema = z.object({
  data_despesa: z.string().min(1, "Informe a data"),
  valor: z.string().min(1, "Informe o valor"),
  id_centro_custo: z.string().min(1, "Selecione o centro de custo"),
  descricao: z.string().min(1, "Informe a descrição"),
  id_categoria_despesa: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  endereco: z.string().nullable().optional(),
  descricao_fornecedor: z.string().optional(),
  cpf_cnpj_fornecedor: z.string().optional(),
  id_fornecedor: z.string().optional(),
});

export const storeRdcWithDespesasFormSchema = storeRdcFormSchema
  .extend({
    despesas: z.array(despesaRdcFormItemSchema),
  })
  .superRefine((data, ctx) => {
    const inicio = data.data_inicio_periodo;
    const fim = data.data_fim_periodo;

    if (!data.despesas || data.despesas.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Adicione pelo menos uma despesa",
        path: ["despesas"],
      });
    }

    if (inicio && fim && fim < inicio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A data de fim deve ser igual ou posterior ao início",
        path: ["data_fim_periodo"],
      });
    }

    // Quando não vincula colaborador, nome e CPF/CNPJ são obrigatórios.
    if (!data.id_usuario_requisitante) {
      if (!data.descricao_requisitante) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe o nome do requisitante",
          path: ["descricao_requisitante"],
        });
      }
      if (!data.cpf_cnpj_requisitante) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe o CPF/CNPJ",
          path: ["cpf_cnpj_requisitante"],
        });
      }
    }
  });

// ── Tipos inferidos ─────────────────────────────────────────────

export type RdcStatus = z.infer<typeof rdcStatusSchema>;
export type AnexoCaixa = z.infer<typeof anexoCaixaSchema>;
export type DespesaRdc = z.infer<typeof despesaRdcSchema>;
export type Rdc = z.infer<typeof rdcSchema>;
export type StoreRdcFormData = z.infer<typeof storeRdcFormSchema>;
export type DespesaRdcFormItem = z.infer<typeof despesaRdcFormItemSchema>;
export type StoreRdcWithDespesasFormData = z.infer<typeof storeRdcWithDespesasFormSchema>;
