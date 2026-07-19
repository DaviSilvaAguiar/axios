import {
  listarUsuariosResponseSchema,
  usuarioResponseSchema,
  type ListarUsuariosResponse,
  type UsuarioResponse,
} from "./usuario.types";

export function mapListarUsuarios(raw: unknown): ListarUsuariosResponse {
  return listarUsuariosResponseSchema.parse(raw);
}

export function mapUsuarioResponse(raw: unknown): UsuarioResponse {
  return usuarioResponseSchema.parse(raw);
}
