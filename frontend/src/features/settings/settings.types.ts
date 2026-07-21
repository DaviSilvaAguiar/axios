import { z } from "zod";

export const settingSchema = z.object({
  id:          z.number(),
  parameter:   z.string(),
  value:       z.number(),
  description: z.string(),
});

export const listSettingsResponseSchema = z.object({
  data: z.array(settingSchema),
});

export const settingResponseSchema = z.object({
  data: settingSchema,
});

export type Config                  = z.infer<typeof settingSchema>;
export type ListSettingsResponse   = Config[];
