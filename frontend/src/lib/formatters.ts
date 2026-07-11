export function formatarData(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function valorParaApi(valor: string | number): string {
  if (typeof valor === "number") return valor.toFixed(2);
  const limpo = valor.trim().replace(/\s/g, "");
  if (!limpo) return "0.00";
  const normalizado = limpo.includes(",")
    ? limpo.replace(/\./g, "").replace(",", ".")
    : limpo;
  const num = Number(normalizado);
  return Number.isFinite(num) ? num.toFixed(2) : "0.00";
}

export function nomeArquivo(caminho: string): string {
  return caminho.split("/").pop() ?? caminho;
}

export function formatarCpfCnpj(valor: string): string {
  const digits = valor.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{2})$/, "$1-$2");
  }
  if (digits.length === 14) {
    return digits
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{2})$/, "$1-$2");
  }
  return valor;
}
