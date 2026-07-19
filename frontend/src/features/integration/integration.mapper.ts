import {
  listIntegracoesResponseSchema,
  saveKeyResponseSchema,
  sendIntegrationResponseSchema,
  type ListarIntegracoesResponse,
  type SaveKeyResponse,
  type SendIntegrationResponse,
} from "./integration.types";

export function mapListarIntegracoes(raw: unknown): ListarIntegracoesResponse {
  return listIntegracoesResponseSchema.parse(raw);
}

export function mapSaveKey(raw: unknown): SaveKeyResponse {
  return saveKeyResponseSchema.parse(raw);
}

export function mapSendIntegration(raw: unknown): SendIntegrationResponse {
  return sendIntegrationResponseSchema.parse(raw);
}
