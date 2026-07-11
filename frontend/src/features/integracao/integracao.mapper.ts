import {
  listarIntegracoesResponseSchema,
  salvarChaveResponseSchema,
  enviarIntegracaoResponseSchema,
  type ListarIntegracoesResponse,
  type SalvarChaveResponse,
  type EnviarIntegracaoResponse,
} from "./integracao.types";

export function mapListarIntegracoes(raw: unknown): ListarIntegracoesResponse {
  return listarIntegracoesResponseSchema.parse(raw);
}

export function mapSalvarChave(raw: unknown): SalvarChaveResponse {
  return salvarChaveResponseSchema.parse(raw);
}

export function mapEnviarIntegracao(raw: unknown): EnviarIntegracaoResponse {
  return enviarIntegracaoResponseSchema.parse(raw);
}
