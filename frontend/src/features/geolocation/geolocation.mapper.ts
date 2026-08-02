import {
  nominatimResultSchema,
  reverseGeocodeResponseSchema,
  type NominatimResult,
  type ReverseGeocodeResponse,
} from "./geolocation.types";

export function mapNominatimResults(raw: unknown): NominatimResult[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      const parsed = nominatimResultSchema.safeParse(item);
      return parsed.success ? parsed.data : null;
    })
    .filter((result): result is NominatimResult => result !== null);
}

export function mapReverseGeocode(raw: unknown): ReverseGeocodeResponse {
  const parsed = reverseGeocodeResponseSchema.safeParse(raw);
  return parsed.success ? parsed.data : {};
}
