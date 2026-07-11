import { z } from "zod";

export const localizacaoSchema = z.object({
  latitude:  z.number(),
  longitude: z.number(),
  endereco:  z.string().nullable(),
});

export type Localizacao = z.infer<typeof localizacaoSchema>;

export const nominatimResultSchema = z.object({
  lat:          z.string(),
  lon:          z.string(),
  display_name: z.string(),
});

export type NominatimResult = z.infer<typeof nominatimResultSchema>;
