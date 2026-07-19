import { z } from "zod";

export const locationSchema = z.object({
  latitude:  z.number(),
  longitude: z.number(),
  address:  z.string().nullable(),
});

export type Localizacao = z.infer<typeof locationSchema>;

export const nominatimResultSchema = z.object({
  lat:          z.string(),
  lon:          z.string(),
  display_name: z.string(),
});

export type NominatimResult = z.infer<typeof nominatimResultSchema>;
