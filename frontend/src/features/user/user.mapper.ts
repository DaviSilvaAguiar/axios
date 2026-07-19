import {
  listUsersResponseSchema,
  userResponseSchema,
  type ListarUsersResponse,
  type UserResponse,
} from "./user.types";

export function mapListarUsers(raw: unknown): ListarUsersResponse {
  return listUsersResponseSchema.parse(raw);
}

export function mapUserResponse(raw: unknown): UserResponse {
  return userResponseSchema.parse(raw);
}
