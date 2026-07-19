import { modulesUserResponseSchema, type ModulosUserResponse } from "./module.types";

export function mapModulosUser(raw: unknown): ModulosUserResponse {
  return modulesUserResponseSchema.parse(raw);
}
