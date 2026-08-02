import { z } from "zod";

export const moduleSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  active: z.boolean(),
});

export const modulesUserResponseSchema = z.object({
  modules: z.array(moduleSchema),
  enabled: z.array(z.number()),
});

export const modulesUserDataResponseSchema = z.object({
  data: modulesUserResponseSchema,
});

export type Module = z.infer<typeof moduleSchema>;
export type UserModulesResponse = z.infer<typeof modulesUserResponseSchema>;
