import { api } from "@/lib/api";
import { mapListarLancamentos } from "./prestador.mapper";
import type { ListaLancamentos, FiltroTipo } from "./prestador.types";

export async function listarLancamentosApi(
  filtro: FiltroTipo = "todos",
  page = 1,
  perPage = 10
): Promise<ListaLancamentos> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  if (filtro !== "todos") params.append("tipo", filtro);

  const raw = await api.get<unknown>(`/v1/prestador/lancamentos?${params.toString()}`);
  return mapListarLancamentos(raw);
}
