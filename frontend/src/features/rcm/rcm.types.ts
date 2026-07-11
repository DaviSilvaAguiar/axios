import { z } from "zod";
import { paginatedSchema } from "@/lib/pagination";

// ── Entidades relacionadas ──────────────────────────────────────

import { centroDeCustoSchema } from "@/features/centro-de-custo/centro-de-custo.types";
export { centroDeCustoSchema };
export type { CentroDeCusto } from "@/features/centro-de-custo/centro-de-custo.types";

import { categoriaDespesaSchema } from "@/features/categoria-despesa/categoria-despesa.types";
export { categoriaDespesaSchema };
export type { CategoriaDespesa } from "@/features/categoria-despesa/categoria-despesa.types";

import { fornecedorSchema } from "@/features/fornecedor/fornecedor.types";

export const anexoRcmSchema = z.object({
  id: z.number(),
  id_despesa_rcm: z.number(),
  caminho: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const usuarioRcmSchema = z.object({
  id: z.number(),
  nome: z.string(),
  perfil: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  codigo_credor_erp: z.string().nullable(),
});

// ── Despesa por item ────────────────────────────────────────────

export const despesaRcmSchema = z.object({
  id: z.number(),
  id_rcm: z.number(),
  id_centro_custo: z.number(),
  descricao: z.string(),
  valor: z.string(),
  data_despesa: z.string(),
  id_categoria_despesa: z.number().nullable().optional(),
  latitude: z.union([z.string(), z.number()]).nullish(),
  longitude: z.union([z.string(), z.number()]).nullish(),
  endereco: z.string().nullish(),
  descricao_fornecedor: z.string().nullish(),
  cpf_cnpj_fornecedor: z.string().nullish(),
  id_fornecedor: z.number().nullish(),
  fornecedor: fornecedorSchema.nullish(),
  categoria_despesa: categoriaDespesaSchema.nullish(),
  centro_de_custo: centroDeCustoSchema.nullish(),
  anexos: z.array(anexoRcmSchema).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

// ── Status ──────────────────────────────────────────────────────

export const rcmStatusSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
]);

export const RCM_STATUS_LABEL: Record<number, string> = {
  1: "Rascunho",
  2: "Pendente",
  3: "Em Análise",
  4: "Aprovado",
  5: "Pagamento Agendado",
  6: "Pago",
  7: "Rejeitado",
};

// ── RCM principal ───────────────────────────────────────────────

export const loteExportacaoRefSchema = z.object({
  id: z.number(),
  created_at: z.string(),
});

export const rcmSchema = z.object({
  id: z.number(),
  id_usuario: z.number(),
  id_centro_custo: z.number().nullish(),
  centro_de_custo: centroDeCustoSchema.nullish(),
  titulo: z.string(),
  nome_solicitante: z.string().nullish(),
  cpf_cnpj_solicitante: z.string().nullish(),
  setor_requisitante: z.string().nullish(),
  id_usuario_requisitante: z.number().nullish(),
  obs: z.string().nullish(),
  usuario_requisitante: usuarioRcmSchema.nullish(),
  data_inicio_periodo: z.string(),
  data_fim_periodo: z.string(),
  status: rcmStatusSchema,
  data_pagamento_programado: z.string().nullish(),
  motivo_rejeicao: z.string().nullish(),
  data_exportacao: z.string().nullish(),
  id_lote_exportacao: z.number().nullish(),
  banco: z.string().nullish(),
  agencia: z.string().nullish(),
  numero_banco: z.string().nullish(),
  chave_pix: z.string().nullish(),
  usuario: usuarioRcmSchema.nullish(),
  despesas: z.array(despesaRcmSchema).optional(),
  lote_exportacao: loteExportacaoRefSchema.nullish(),
  created_at: z.string(),
  updated_at: z.string(),
});

// ── Respostas da API ────────────────────────────────────────────

export const listarRcmsResponseSchema = paginatedSchema(rcmSchema);

export const rcmResponseSchema = z.object({
  mensagem: z.string(),
  rcm: rcmSchema,
});

// ── Formulários ─────────────────────────────────────────────────

export const storeRcmFormSchema = z.object({
  titulo: z.string().min(1, "Informe o título"),
  id_centro_custo: z.string().min(1, "Selecione o centro de custo"),
  nome_solicitante: z.string().optional(),
  cpf_cnpj_solicitante: z.string().optional(),
  setor_requisitante: z.string().min(1, "Informe o setor"),
  id_usuario_requisitante: z.string().optional(),
  obs: z.string().optional(),
  data_inicio_periodo: z.string().min(1, "Informe a data"),
  data_fim_periodo: z.string().min(1, "Informe a data"),
  banco: z.string().optional(),
  agencia: z.string().optional(),
  numero_banco: z.string().optional(),
  chave_pix: z.string().optional(),
});

export const updateRcmStatusFormSchema = z.object({
  status: rcmStatusSchema,
  data_pagamento_programado: z.string().optional(),
  motivo_rejeicao: z.string().optional(),
}).superRefine((val, ctx) => {
  if (val.status === 5 && !val.data_pagamento_programado) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["data_pagamento_programado"],
      message: "Informe a data programada de pagamento",
    });
  }
  if (val.status === 7 && !val.motivo_rejeicao) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["motivo_rejeicao"],
      message: "Informe o motivo da rejeição",
    });
  }
});

// ── Formulário de despesa ───────────────────────────────────────

export const storeDespesaRcmFormSchema = z.object({
  data_despesa: z.string().min(1, "Informe a data"),
  valor: z.string().min(1, "Informe o valor"),
  id_centro_custo: z.number().min(1, "Selecione o centro de custo"),
  descricao: z.string().min(1, "Informe a descrição"),
  id_categoria_despesa: z.string().optional(),
  anexo: z.any().optional(),
});

// id_centro_custo e id_categoria_despesa como string pois o Combobox retorna string
// despesaId presente apenas em despesas já salvas (edição)
export const despesaRcmFormItemSchema = z.object({
  despesaId: z.number().optional(),
  data_despesa: z.string().min(1, "Informe a data").refine(isValidDateYear, "Data inválida"),
  valor: z.string()
    .min(1, "Informe o valor")
    .refine((v) => parseFloat(v) >= 0.01, "O valor deve ser maior que zero"),
  id_centro_custo: z.string().min(1, "Selecione o centro de custo"),
  descricao: z.string().min(1, "Informe a descrição"),
  id_categoria_despesa: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  endereco: z.string().nullable().optional(),
  descricao_fornecedor: z.string().optional(),
  cpf_cnpj_fornecedor: z.string().optional(),
  id_fornecedor: z.string().optional(),
  anexo: z.any().optional(),
});

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function isValidDateYear(v: string): boolean {
  if (!v) return true;
  const year = parseInt(v.split("-")[0], 10);
  return !isNaN(year) && year >= 1970 && year <= 2100;
}

export const storeRcmWithDespesasFormSchema = storeRcmFormSchema
  .extend({ despesas: z.array(despesaRcmFormItemSchema) })
  .superRefine((val, ctx) => {
    const inicio = val.data_inicio_periodo;
    const fim = val.data_fim_periodo;

    if (!val.despesas || val.despesas.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Adicione pelo menos uma despesa",
        path: ["despesas"],
      });
    }

    if (!val.id_usuario_requisitante) {
      if (!val.nome_solicitante) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["nome_solicitante"],
          message: "Informe o nome do solicitante",
        });
      }
      if (!val.cpf_cnpj_solicitante) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cpf_cnpj_solicitante"],
          message: "Informe o CPF/CNPJ",
        });
      }
    }

    if (inicio && fim && fim < inicio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["data_fim_periodo"],
        message: "A data de fim deve ser igual ou posterior à data de início",
      });
    }

    if (inicio && fim) {
      val.despesas.forEach((despesa, idx) => {
        const d = despesa.data_despesa;
        if (!d) return;
        if (d < inicio) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["despesas", idx, "data_despesa"],
            message: `Anterior ao início do período (${fmtDate(inicio)})`,
          });
        } else if (d > fim) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["despesas", idx, "data_despesa"],
            message: `Posterior ao fim do período (${fmtDate(fim)})`,
          });
        }
      });
    }
  });

// ── Tipos inferidos ─────────────────────────────────────────────

export type AnexoRcm = z.infer<typeof anexoRcmSchema>;
export type UsuarioRcm = z.infer<typeof usuarioRcmSchema>;
export type DespesaRcm = z.infer<typeof despesaRcmSchema>;
export type Rcm = z.infer<typeof rcmSchema>;
export type RcmStatus = z.infer<typeof rcmStatusSchema>;
export type ListarRcmsResponse = z.infer<typeof listarRcmsResponseSchema>;
export type RcmResponse = z.infer<typeof rcmResponseSchema>;
export type StoreRcmFormData = z.infer<typeof storeRcmFormSchema>;
export type UpdateRcmStatusFormData = z.infer<typeof updateRcmStatusFormSchema>;
export type StoreDespesaRcmFormData = z.infer<typeof storeDespesaRcmFormSchema>;
export type StoreRcmWithDespesasFormData = z.infer<typeof storeRcmWithDespesasFormSchema>;
