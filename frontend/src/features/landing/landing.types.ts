import { z } from "zod";

export const leadFormSchema = z.object({
  nome:                 z.string().min(1, "Informe seu nome"),
  email:                z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
  empresa:              z.string().min(1, "Informe o nome da empresa"),
  volume_obras_mensais: z.string().min(1, "Informe o volume de obras mensais"),
});

export const leadResponseSchema = z.object({
  mensagem: z.string(),
  lead: z.object({
    id:                   z.number(),
    nome:                 z.string(),
    email:                z.string(),
    empresa:              z.string(),
    volume_obras_mensais: z.string(),
    created_at:           z.string(),
    updated_at:           z.string(),
  }),
});

export type LeadFormData     = z.infer<typeof leadFormSchema>;
export type LeadResponse     = z.infer<typeof leadResponseSchema>;
