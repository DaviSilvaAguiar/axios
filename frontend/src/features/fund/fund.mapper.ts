import {
  fundResponseSchema,
  statementResponseSchema,
  listFundsResponseSchema,
} from "./fund.types";
import type { Fund, StatementResponse } from "./fund.types";

export function mapFundList(raw: unknown): Fund[] {
  return listFundsResponseSchema.parse(raw).data;
}

export function mapFundResponse(raw: unknown): Fund {
  return fundResponseSchema.parse(raw).data;
}

export function mapStatementResponse(raw: unknown): StatementResponse {
  return statementResponseSchema.parse(raw).data;
}
