import { listaLancamentosSchema, type ListaLancamentos } from "./prestador.types";

export function mapListarLancamentos(raw: unknown): ListaLancamentos {
  return listaLancamentosSchema.parse(raw);
}
