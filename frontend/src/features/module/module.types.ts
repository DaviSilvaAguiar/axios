import { z } from "zod";

export const moduloSchema = z.object({
  id: z.number(),
  nome: z.string(),
  slug: z.string(),
  descricao: z.string().nullable(),
  ativo: z.boolean(),
});

export const modulosUsuarioResponseSchema = z.object({
  modulos: z.array(moduloSchema),
  habilitados: z.array(z.number()),
});

export type Modulo = z.infer<typeof moduloSchema>;
export type ModulosUsuarioResponse = z.infer<typeof modulosUsuarioResponseSchema>;
