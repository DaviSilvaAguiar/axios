import { mapNominatimResults, mapReverseGeocode } from "./geolocation.mapper";
import { type NominatimResult } from "./geolocation.types";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

export async function searchAddressesApi(query: string): Promise<NominatimResult[]> {
  if (!query.trim()) return [];
  const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=pt-BR`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Failed to fetch address.");
  return mapNominatimResults(await response.json());
}

export async function reverseGeocodeApi(lat: number, lon: number): Promise<string | null> {
  const url = `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=pt-BR`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) return null;
  return mapReverseGeocode(await response.json()).display_name ?? null;
}
