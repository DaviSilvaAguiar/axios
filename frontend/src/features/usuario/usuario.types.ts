import { z } from "zod";
import { usuarioSchema } from "@/features/auth/auth.types";
import { paginatedSchema } from "@/lib/pagination";

export { usuarioSchema };
export type { Usuario } from "@/features/auth/auth.types";

export const listarUsuariosResponseSchema = paginatedSchema(usuarioSchema);

export const usuarioResponseSchema = z.object({
  mensagem: z.string(),
  usuario: usuarioSchema,
});

const perfilField = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export const criarUsuarioFormSchema = z.object({
  perfil: perfilField,
  nome: z.string().min(1, "Informe o nome"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(8, "Mínimo 8 caracteres"),
  ativo: z.boolean(),
  codigo_credor_erp: z.string().optional(),
  cpf_cnpj: z.string().optional(),
});

export const editarUsuarioFormSchema = z.object({
  perfil: perfilField,
  nome: z.string().min(1, "Informe o nome"),
  email: z.string().email("E-mail inválido"),
  senha: z
    .string()
    .refine((v) => v === "" || v.length >= 8, "Mínimo 8 caracteres")
    .optional(),
  ativo: z.boolean(),
  codigo_credor_erp: z.string().optional(),
  cpf_cnpj: z.string().optional(),
});

export type ListarUsuariosResponse = z.infer<typeof listarUsuariosResponseSchema>;
export type UsuarioResponse = z.infer<typeof usuarioResponseSchema>;
export type CriarUsuarioFormData = z.infer<typeof criarUsuarioFormSchema>;
export type EditarUsuarioFormData = z.infer<typeof editarUsuarioFormSchema>;
