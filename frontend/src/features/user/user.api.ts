import { api } from "@/lib/api";
import { buildPageQuery, type Paginated, PAGE_SIZE } from "@/lib/pagination";
import { mapListarUsers, mapUserResponse } from "./user.mapper";
import type {
  CriarUserFormData,
  EditarUserFormData,
  User,
} from "./user.types";

export async function listUsersApi(
  page: number = 1,
  perPage: number = PAGE_SIZE,
  signal?: AbortSignal
): Promise<Paginated<User>> {
  const raw = await api.get<unknown>(`/v1/users${buildPageQuery(page, perPage)}`, { signal });
  return mapListarUsers(raw);
}

export async function getUserApi(id: number): Promise<User> {
  const raw = await api.get<unknown>(`/v1/users/${id}`);
  return mapUserResponse(raw);
}

export async function createUserApi(data: CriarUserFormData): Promise<User> {
  const raw = await api.post<unknown>("/v1/users", data);
  return mapUserResponse(raw);
}

export async function updateUserApi(
  id: number,
  data: EditarUserFormData
): Promise<User> {
  const payload: Partial<EditarUserFormData> = { ...data };
  if (!payload.password) delete payload.password;

  const raw = await api.put<unknown>(`/v1/users/${id}`, payload);
  return mapUserResponse(raw);
}

export async function deleteUserApi(id: number): Promise<void> {
  await api.delete(`/v1/users/${id}`);
}
