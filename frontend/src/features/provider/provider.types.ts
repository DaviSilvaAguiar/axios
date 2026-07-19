import { z } from "zod";

export const lancamentoSchema = z.object({
  id: z.number(),
  tipo: z.enum(["rdc", "rcm"]),
  titulo: z.string(),
  valor_total: z.string(),
  status: z.number(),
  created_at: z.string(),
});
export type Lancamento = z.infer<typeof lancamentoSchema>;

export const listaLancamentosSchema = z.object({
  data: z.array(lancamentoSchema),
  meta: z.object({
    current_page: z.number(),
    last_page: z.number(),
    per_page: z.number(),
    total: z.number(),
  }),
});
export type ListaLancamentos = z.infer<typeof listaLancamentosSchema>;

export type TipoLancamento = "rdc" | "rcm";
export type FiltroTipo = "todos" | TipoLancamento;
