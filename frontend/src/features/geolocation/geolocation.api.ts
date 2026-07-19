import { nominatimResultSchema, type NominatimResult } from "./geolocalizacao.types";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

export async function buscarEnderecosApi(query: string): Promise<NominatimResult[]> {
  if (!query.trim()) return [];
  const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=pt-BR`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Falha ao buscar endereço.");
  const data = (await response.json()) as unknown[];
  return data
    .map((item) => {
      const parsed = nominatimResultSchema.safeParse(item);
      return parsed.success ? parsed.data : null;
    })
    .filter((r): r is NominatimResult => r !== null);
}

export async function reverseGeocodeApi(lat: number, lon: number): Promise<string | null> {
  const url = `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=pt-BR`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) return null;
  const data = (await response.json()) as { display_name?: string };
  return data.display_name ?? null;
}
