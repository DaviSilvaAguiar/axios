import { z } from "zod";

export const integracaoSchema = z.object({
  id:          z.number(),
  nome:        z.string(),
  configurada: z.boolean(),
});
export type Integracao = z.infer<typeof integracaoSchema>;

export const listarIntegracoesResponseSchema = z.object({
  data: z.array(integracaoSchema),
});
export type ListarIntegracoesResponse = z.infer<typeof listarIntegracoesResponseSchema>;

export const salvarChaveResponseSchema = z.object({
  message: z.string(),
});
export type SalvarChaveResponse = z.infer<typeof salvarChaveResponseSchema>;

export const salvarChaveFormSchema = z.object({
  chave: z.string().trim().min(1, "Informe o token da integração."),
});
export type SalvarChaveForm = z.infer<typeof salvarChaveFormSchema>;

export const enviarIntegracaoFalhaSchema = z.object({
  id: z.number(),
  erro: z.string(),
});

export const enviarIntegracaoResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    lote_id:  z.number().nullable(),
    sucessos: z.number(),
    falhas:   z.array(enviarIntegracaoFalhaSchema),
  }),
});
export type EnviarIntegracaoResponse = z.infer<typeof enviarIntegracaoResponseSchema>;
