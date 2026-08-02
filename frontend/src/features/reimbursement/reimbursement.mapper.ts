import {
  listReimbursementsResponseSchema,
  rcmResponseSchema,
  type ReimbursementListResponse,
  type Reimbursement,
} from "./reimbursement.types";

export function mapReimbursementList(raw: unknown): ReimbursementListResponse {
  return listReimbursementsResponseSchema.parse(raw);
}

export function mapReimbursementResponse(raw: unknown): Reimbursement {
  return rcmResponseSchema.parse(raw).data;
}
