import {
  listarRcmsResponseSchema,
  rcmResponseSchema,
  type ListarRcmsResponse,
  type RcmResponse,
} from "./rcm.types";

export function mapListarRcmsResponse(raw: unknown): ListarRcmsResponse {
  return listarRcmsResponseSchema.parse(raw);
}

export function mapRcmResponse(raw: unknown): RcmResponse {
  return rcmResponseSchema.parse(raw);
}
