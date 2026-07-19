import { rdcSchema, listarRdcsResponseSchema } from "./rdc.types";
import type { Rdc } from "./rdc.types";

export function mapListarRdcsResponse(raw: unknown): Rdc[] {
  return listarRdcsResponseSchema.parse(raw);
}

export function mapRdcResponse(raw: unknown): Rdc {
  return rdcSchema.parse(raw);
}
