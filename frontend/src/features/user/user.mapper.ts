import {
  listUsersResponseSchema,
  userResponseSchema,
  type UserListResponse,
} from "./user.types";
import type { User } from "@/features/auth/auth.types";

export function mapUserList(raw: unknown): UserListResponse {
  return listUsersResponseSchema.parse(raw);
}

export function mapUserResponse(raw: unknown): User {
  return userResponseSchema.parse(raw).data;
}
