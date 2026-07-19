import {
  listReimbursementsResponseSchema,
  rcmResponseSchema,
  type ListarReimbursementsResponse,
  type ReimbursementResponse,
} from "./reimbursement.types";

export function mapListarReimbursementsResponse(raw: unknown): ListarReimbursementsResponse {
  return listReimbursementsResponseSchema.parse(raw);
}

export function mapReimbursementResponse(raw: unknown): ReimbursementResponse {
  return rcmResponseSchema.parse(raw);
}
