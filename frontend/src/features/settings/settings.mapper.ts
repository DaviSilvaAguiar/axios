import {
  settingResponseSchema,
  listSettingsResponseSchema,
  type Config,
  type ListSettingsResponse,
} from "./settings.types";

export function mapSettingList(raw: unknown): ListSettingsResponse {
  return listSettingsResponseSchema.parse(raw).data;
}

export function mapConfig(raw: unknown): Config {
  return settingResponseSchema.parse(raw).data;
}
