import { z } from "zod";

export const loginFormSchema = z.object({
  company:     z.string().min(1, "Enter the company"),
  email:       z.string().min(1, "Enter your email").email("Invalid email"),
  password:       z.string().min(1, "Enter your password"),
  remember_me: z.boolean(),
});

export const userSchema = z.object({
  id: z.number(),
  role: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  name: z.string(),
  email: z.string().email(),
  active: z.boolean(),
  erp_code: z.string().nullable(),
  tax_id: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const tenantInfoSchema = z.object({
  id: z.number(),
  slug: z.string(),
  legal_name: z.string(),
  trade_name: z.string().nullable(),
  max_users: z.number().nullable().optional(),
});

export const loginPayloadSchema = z.object({
  token:      z.string(),
  expires_at: z.string().datetime(),
  user:    userSchema,
  tenant:     tenantInfoSchema,
});

export const loginResponseSchema = z.object({
  data: loginPayloadSchema,
});

export const mePayloadSchema = z.object({
  user: userSchema,
  tenant: tenantInfoSchema,
  modules: z.array(z.string()).default([]),
});

export const meResponseSchema = z.object({
  data: mePayloadSchema,
});

export const passwordRecoveryFormSchema = z.object({
  company: z.string().min(1, "Enter the company"),
  email: z.string().min(1, "Enter your email").email("Invalid email"),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;
export type User = z.infer<typeof userSchema>;
export type TenantInfo = z.infer<typeof tenantInfoSchema>;
export type LoginResponse = z.infer<typeof loginPayloadSchema>;
export type MeResponse = z.infer<typeof mePayloadSchema>;
export type PasswordRecoveryFormData = z.infer<typeof passwordRecoveryFormSchema>;
