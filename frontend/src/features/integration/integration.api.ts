import { api } from "@/lib/api";
import { mapListarIntegracoes, mapSaveKey, mapSendIntegration } from "./integration.mapper";
import type {
  ListarIntegracoesResponse,
  SaveKeyResponse,
  SendIntegrationResponse,
} from "./integration.types";
import type { BatchType } from "@/features/export/export.types";

export async function listIntegracoesApi(): Promise<ListarIntegracoesResponse> {
  const raw = await api.get<unknown>("/v1/integration");
  return mapListarIntegracoes(raw);
}

export async function saveKeyIntegrationApi(
  idIntegration: number,
  key: string,
): Promise<SaveKeyResponse> {
  const raw = await api.post<unknown>(`/v1/integration/${idIntegration}/key`, { key });
  return mapSaveKey(raw);
}

export async function sendLoteIntegrationApi(
  batchType: BatchType,
  idIntegration: number,
  idBankAccount: number,
  ids: number[],
): Promise<SendIntegrationResponse> {
  const raw = await api.post<unknown>("/v1/integration/send", {
    batch_type:          batchType,
    integration_id:      idIntegration,
    bank_account_id:  idBankAccount,
    ids,
  });
  return mapSendIntegration(raw);
}
