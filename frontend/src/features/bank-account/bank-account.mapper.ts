import {
  bankAccountResponseSchema,
  listContasBancariasResponseSchema,
  type BankAccount,
  type ListarContasBancariasResponse,
} from "./bank-account.types";

export function mapListarContasBancarias(raw: unknown): ListarContasBancariasResponse {
  return listContasBancariasResponseSchema.parse(raw);
}

export function mapBankAccountResponse(raw: unknown): BankAccount {
  return bankAccountResponseSchema.parse(raw).data;
}
