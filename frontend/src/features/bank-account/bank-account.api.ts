import { api } from "@/lib/api";
import { buildPageQuery, type Paginated, PAGE_SIZE } from "@/lib/pagination";
import {
  mapBankAccountResponse,
  mapListarContasBancarias,
} from "./bank-account.mapper";
import type {
  BankAccount,
  BankAccountFormData,
  BankAccountResponse,
} from "./bank-account.types";

export async function listContasBancariasApi(
  page: number = 1,
  perPage: number = PAGE_SIZE
): Promise<Paginated<BankAccount>> {
  const raw = await api.get<unknown>(`/v1/bank-accounts${buildPageQuery(page, perPage)}`);
  return mapListarContasBancarias(raw);
}

export async function getBankAccountApi(id: number): Promise<BankAccount> {
  const raw = await api.get<unknown>(`/v1/bank-accounts/${id}`);
  return mapBankAccountResponse(raw).bank_account;
}

export async function createBankAccountApi(
  data: BankAccountFormData
): Promise<BankAccountResponse> {
  const raw = await api.post<unknown>("/v1/bank-accounts", data);
  return mapBankAccountResponse(raw);
}

export async function updateBankAccountApi(
  id: number,
  data: Partial<BankAccountFormData>
): Promise<BankAccountResponse> {
  const raw = await api.put<unknown>(`/v1/bank-accounts/${id}`, data);
  return mapBankAccountResponse(raw);
}

export async function deleteBankAccountApi(id: number): Promise<void> {
  await api.delete(`/v1/bank-accounts/${id}`);
}
