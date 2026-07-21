import { modulesUserDataResponseSchema, type ModulosUserResponse } from "./module.types";

export function mapModulosUser(raw: unknown): ModulosUserResponse {
  return modulesUserDataResponseSchema.parse(raw).data;
}
