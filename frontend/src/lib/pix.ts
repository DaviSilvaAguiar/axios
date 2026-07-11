import { maskCpfCnpj, maskTelefone } from "@/lib/masks";

export type TipoChavePix = "cpf_cnpj" | "telefone" | "email" | "aleatoria";

export const TIPO_CHAVE_PIX_OPTIONS = [
  { value: "cpf_cnpj",  label: "CPF / CNPJ" },
  { value: "telefone",  label: "Telefone" },
  { value: "email",     label: "E-mail" },
  { value: "aleatoria", label: "Chave aleatória" },
] as const;

export const TIPO_CHAVE_PIX_PLACEHOLDER: Record<TipoChavePix, string> = {
  cpf_cnpj:  "000.000.000-00 ou 00.000.000/0000-00",
  telefone:  "(11) 99999-9999",
  email:     "seuemail@exemplo.com",
  aleatoria: "Chave gerada pelo banco",
};

const TIPOS_CHAVE_PIX = new Set<string>(["cpf_cnpj", "telefone", "email", "aleatoria"]);

export function isTipoChavePix(val: string): val is TipoChavePix {
  return TIPOS_CHAVE_PIX.has(val);
}

export function inferirTipoChavePix(chave: string): TipoChavePix | null {
  if (!chave) return null;
  if (chave.includes("@")) return "email";
  if (/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(chave) || /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(chave)) return "cpf_cnpj";
  if (/^\(\d{2}\)\s?\d{4,5}-\d{4}$/.test(chave)) return "telefone";
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(chave)) return "aleatoria";
  return null;
}

export function aplicarMascaraChavePix(valor: string, tipo: TipoChavePix): string {
  switch (tipo) {
    case "cpf_cnpj":  return maskCpfCnpj(valor);
    case "telefone":  return maskTelefone(valor);
    default:          return valor.slice(0, 77);
  }
}
