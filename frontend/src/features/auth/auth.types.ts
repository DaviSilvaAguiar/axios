import { z } from "zod";

export const loginFormSchema = z.object({
  empresa:     z.string().min(1, "Informe a empresa"),
  email:       z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  senha:       z.string().min(1, "Informe a senha"),
  remember_me: z.boolean(),
});

export const usuarioSchema = z.object({
  id: z.number(),
  perfil: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  nome: z.string(),
  email: z.string().email(),
  ativo: z.boolean(),
  codigo_credor_erp: z.string().nullable(),
  cpf_cnpj: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const tenantInfoSchema = z.object({
  id: z.number(),
  slug: z.string(),
  razao_social: z.string(),
  fantasia: z.string().nullable(),
  max_usuarios: z.number().nullable().optional(),
});

export const loginResponseSchema = z.object({
  token:      z.string(),
  expires_at: z.string().datetime(),
  usuario:    usuarioSchema,
  tenant:     tenantInfoSchema,
});

export const meResponseSchema = z.object({
  usuario: usuarioSchema,
  tenant: tenantInfoSchema,
  modulos: z.array(z.string()).default([]),
});

export const recuperarSenhaFormSchema = z.object({
  empresa: z.string().min(1, "Informe a empresa"),
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;
export type Usuario = z.infer<typeof usuarioSchema>;
export type TenantInfo = z.infer<typeof tenantInfoSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;
export type RecuperarSenhaFormData = z.infer<typeof recuperarSenhaFormSchema>;
