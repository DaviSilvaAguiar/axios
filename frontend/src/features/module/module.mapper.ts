import { modulosUsuarioResponseSchema, type ModulosUsuarioResponse } from "./modulo.types";

export function mapModulosUsuario(raw: unknown): ModulosUsuarioResponse {
  return modulosUsuarioResponseSchema.parse(raw);
}
