import {
  listReimbursementsResponseSchema,
  rcmResponseSchema,
  type ListarReimbursementsResponse,
  type Reimbursement,
} from "./reimbursement.types";

export function mapListarReimbursementsResponse(raw: unknown): ListarReimbursementsResponse {
  return listReimbursementsResponseSchema.parse(raw);
}

export function mapReimbursementResponse(raw: unknown): Reimbursement {
  return rcmResponseSchema.parse(raw).data;
}
