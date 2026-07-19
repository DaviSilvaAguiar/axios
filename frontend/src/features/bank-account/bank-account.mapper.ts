import {
  bankAccountResponseSchema,
  listContasBancariasResponseSchema,
  type BankAccountResponse,
  type ListarContasBancariasResponse,
} from "./bank-account.types";

export function mapListarContasBancarias(raw: unknown): ListarContasBancariasResponse {
  return listContasBancariasResponseSchema.parse(raw);
}

export function mapBankAccountResponse(raw: unknown): BankAccountResponse {
  return bankAccountResponseSchema.parse(raw);
}
