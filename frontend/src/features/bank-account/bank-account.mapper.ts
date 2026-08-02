import {
  bankAccountResponseSchema,
  listBankAccountsResponseSchema,
  type BankAccount,
  type BankAccountListResponse,
} from "./bank-account.types";

export function mapBankAccountList(raw: unknown): BankAccountListResponse {
  return listBankAccountsResponseSchema.parse(raw);
}

export function mapBankAccountResponse(raw: unknown): BankAccount {
  return bankAccountResponseSchema.parse(raw).data;
}
