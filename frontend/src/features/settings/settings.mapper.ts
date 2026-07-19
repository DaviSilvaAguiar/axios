import {
  settingSchema,
  listSettingsResponseSchema,
  type Config,
  type ListSettingsResponse,
} from "./settings.types";

export function mapListarSettings(raw: unknown): ListSettingsResponse {
  return listSettingsResponseSchema.parse(raw);
}

export function mapConfig(raw: unknown): Config {
  return settingSchema.parse(raw);
}
