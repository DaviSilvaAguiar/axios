import { z } from "zod";

export const configSchema = z.object({
  id:        z.number(),
  parametro: z.string(),
  valor:     z.number(),
  descricao: z.string(),
});

export const listarConfigsResponseSchema = z.array(configSchema);

export type Config                  = z.infer<typeof configSchema>;
export type ListarConfigsResponse   = z.infer<typeof listarConfigsResponseSchema>;
