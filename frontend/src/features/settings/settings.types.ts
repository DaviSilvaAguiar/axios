import { z } from "zod";

export const settingSchema = z.object({
  id:          z.number(),
  parameter:   z.string(),
  value:       z.number(),
  description: z.string(),
});

export const listSettingsResponseSchema = z.array(settingSchema);

export type Config                  = z.infer<typeof settingSchema>;
export type ListSettingsResponse   = z.infer<typeof listSettingsResponseSchema>;
