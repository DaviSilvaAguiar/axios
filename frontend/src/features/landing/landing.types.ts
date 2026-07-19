import { z } from "zod";

export const leadFormSchema = z.object({
  name:                 z.string().min(1, "Enter your name"),
  email:                z.string().min(1, "Enter your email").email("Invalid email"),
  company:              z.string().min(1, "Enter the company name"),
  monthly_project_volume: z.string().min(1, "Enter the monthly project volume"),
});

export const leadResponseSchema = z.object({
  message: z.string(),
  lead: z.object({
    id:                   z.number(),
    name:                 z.string(),
    email:                z.string(),
    company:              z.string(),
    monthly_project_volume: z.string(),
    created_at:           z.string(),
    updated_at:           z.string(),
  }),
});

export type LeadFormData     = z.infer<typeof leadFormSchema>;
export type LeadResponse     = z.infer<typeof leadResponseSchema>;
