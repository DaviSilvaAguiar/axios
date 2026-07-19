import {
  configSchema,
  listarConfigsResponseSchema,
  type Config,
  type ListarConfigsResponse,
} from "./config.types";

export function mapListarConfigs(raw: unknown): ListarConfigsResponse {
  return listarConfigsResponseSchema.parse(raw);
}

export function mapConfig(raw: unknown): Config {
  return configSchema.parse(raw);
}
