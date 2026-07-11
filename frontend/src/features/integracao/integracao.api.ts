import { api } from "@/lib/api";
import { mapListarIntegracoes, mapSalvarChave, mapEnviarIntegracao } from "./integracao.mapper";
import type {
  ListarIntegracoesResponse,
  SalvarChaveResponse,
  EnviarIntegracaoResponse,
} from "./integracao.types";
import type { TipoLote } from "@/features/exportacao/exportacao.types";

export async function listarIntegracoesApi(): Promise<ListarIntegracoesResponse> {
  const raw = await api.get<unknown>("/v1/integracao");
  return mapListarIntegracoes(raw);
}

export async function salvarChaveIntegracaoApi(
  idIntegracao: number,
  chave: string,
): Promise<SalvarChaveResponse> {
  const raw = await api.post<unknown>(`/v1/integracao/${idIntegracao}/chave`, { chave });
  return mapSalvarChave(raw);
}

export async function enviarLoteIntegracaoApi(
  tipoLote: TipoLote,
  idIntegracao: number,
  idContaBancaria: number,
  ids: number[],
): Promise<EnviarIntegracaoResponse> {
  const raw = await api.post<unknown>("/v1/integracao/enviar", {
    tipo_lote:          tipoLote,
    id_integracao:      idIntegracao,
    id_conta_bancaria:  idContaBancaria,
    ids,
  });
  return mapEnviarIntegracao(raw);
}
