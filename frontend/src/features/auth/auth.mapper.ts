import {
  loginResponseSchema,
  meResponseSchema,
  type LoginResponse,
  type MeResponse,
} from "./auth.types";

export function mapLoginResponse(raw: unknown): LoginResponse {
  return loginResponseSchema.parse(raw).data;
}

export function mapMeResponse(raw: unknown): MeResponse {
  return meResponseSchema.parse(raw).data;
}
