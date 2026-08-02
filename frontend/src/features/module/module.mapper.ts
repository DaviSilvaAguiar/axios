import { modulesUserDataResponseSchema, type UserModulesResponse } from "./module.types";

export function mapUserModules(raw: unknown): UserModulesResponse {
  return modulesUserDataResponseSchema.parse(raw).data;
}
