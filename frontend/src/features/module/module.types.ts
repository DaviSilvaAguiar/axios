import { z } from "zod";

export const moduloSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  active: z.boolean(),
});

export const modulesUserResponseSchema = z.object({
  modules: z.array(moduloSchema),
  habilitados: z.array(z.number()),
});

export const modulesUserDataResponseSchema = z.object({
  data: modulesUserResponseSchema,
});

export type Modulo = z.infer<typeof moduloSchema>;
export type ModulosUserResponse = z.infer<typeof modulesUserResponseSchema>;
