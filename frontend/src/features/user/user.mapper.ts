import {
  listUsersResponseSchema,
  userResponseSchema,
  type ListarUsersResponse,
} from "./user.types";
import type { User } from "@/features/auth/auth.types";

export function mapListarUsers(raw: unknown): ListarUsersResponse {
  return listUsersResponseSchema.parse(raw);
}

export function mapUserResponse(raw: unknown): User {
  return userResponseSchema.parse(raw).data;
}
