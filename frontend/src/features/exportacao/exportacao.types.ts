import { z } from "zod";
import { usuarioSchema } from "@/features/auth/auth.types";
import { paginatedSchema } from "@/lib/pagination";

export const tipoLoteSchema = z.enum(["CAIXA", "REEMBOLSO"]);
export type TipoLote = z.infer<typeof tipoLoteSchema>;

export const documentoPendenteSchema = z.object({
  id: z.number(),
  identificador: z.string(),
  descricao: z.string().nullable(),
  prestador: z.string(),
  centro_custo: z.string().nullable(),
  valor: z.coerce.number(),
  data: z.string().nullable(),
  status: z.string(),
  tipo: tipoLoteSchema,
});
export type DocumentoPendente = z.infer<typeof documentoPendenteSchema>;

export const pendentesPaginadosResponseSchema = paginatedSchema(documentoPendenteSchema);

export const statsPendentesResponseSchema = z.object({
  data: z.object({
    caixa:     z.object({ quantidade: z.number(), valor: z.coerce.number() }),
    reembolso: z.object({ quantidade: z.number(), valor: z.coerce.number() }),
  }),
});
export type StatsPendentes = z.infer<typeof statsPendentesResponseSchema>["data"];

export const loteHistoricoSchema = z.object({
  id: z.number(),
  tipo_lote: tipoLoteSchema,
  template_utilizado: z.string(),
  valor_total: z.coerce.number(),
  quantidade_itens: z.number(),
  nome_arquivo: z.string().nullable(),
  usuario: usuarioSchema.pick({ id: true, nome: true, email: true, perfil: true }).nullable(),
  created_at: z.string(),
});
export type LoteHistorico = z.infer<typeof loteHistoricoSchema>;

export const historicoResponseSchema = paginatedSchema(loteHistoricoSchema);
