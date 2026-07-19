export function apenasDigitos(val: string): string {
  return val.replace(/\D/g, "");
}

export function maskCpfCnpj(val: string): string {
  const digits = apenasDigitos(val).slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function maskBanco(val: string): string {
  return val.replace(/\D/g, "").slice(0, 3);
}

export function maskAgencia(val: string) {
  const v = val.replace(/\D/g, "");
  if (v.length > 4) {
    return v.replace(/^(\d{4})(\d{0,1}).*/, "$1-$2");
  }
  return v;
}

export function maskConta(val: string) {
  const v = val.replace(/\D/g, "").slice(0, 15);
  if (v.length > 1) {
    return v.replace(/(\d+)(\d)$/, "$1-$2");
  }
  return v;
}

export function maskTelefone(val: string): string {
  const v = val.replace(/\D/g, "").slice(0, 11);
  if (v.length <= 10) {
    return v
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return v
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

