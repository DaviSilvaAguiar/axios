import { z } from "zod";

export const integrationSchema = z.object({
  id:          z.number(),
  name:        z.string(),
  configurada: z.boolean(),
});
export type Integration = z.infer<typeof integrationSchema>;

export const listIntegracoesResponseSchema = z.object({
  data: z.array(integrationSchema),
});
export type ListarIntegracoesResponse = z.infer<typeof listIntegracoesResponseSchema>;

export const saveKeyResponseSchema = z.object({
  message: z.string(),
});
export type SaveKeyResponse = z.infer<typeof saveKeyResponseSchema>;

export const saveKeyFormSchema = z.object({
  key: z.string().trim().min(1, "Enter the integration token."),
});
export type SaveKeyForm = z.infer<typeof saveKeyFormSchema>;

export const sendIntegrationFalhaSchema = z.object({
  id: z.number(),
  error: z.string(),
});

export const sendIntegrationResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    lote_id:  z.number().nullable(),
    successes: z.number(),
    failures:   z.array(sendIntegrationFalhaSchema),
  }),
});
export type SendIntegrationResponse = z.infer<typeof sendIntegrationResponseSchema>;
