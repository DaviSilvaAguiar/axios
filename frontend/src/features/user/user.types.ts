import { z } from "zod";
import { userSchema } from "@/features/auth/auth.types";
import { paginatedSchema } from "@/lib/pagination";

export { userSchema };
export type { User } from "@/features/auth/auth.types";

export const listUsersResponseSchema = paginatedSchema(userSchema);

export const userResponseSchema = z.object({
  data: userSchema,
});

const roleField = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export const createUserFormSchema = z.object({
  role: roleField,
  name: z.string().min(1, "Enter the name"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Minimum 8 characters"),
  active: z.boolean(),
  erp_code: z.string().optional(),
  tax_id: z.string().optional(),
});

export const editarUserFormSchema = z.object({
  role: roleField,
  name: z.string().min(1, "Enter the name"),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .refine((v) => v === "" || v.length >= 8, "Minimum 8 characters")
    .optional(),
  active: z.boolean(),
  erp_code: z.string().optional(),
  tax_id: z.string().optional(),
});

export type ListarUsersResponse = z.infer<typeof listUsersResponseSchema>;
export type CriarUserFormData = z.infer<typeof createUserFormSchema>;
export type EditarUserFormData = z.infer<typeof editarUserFormSchema>;
