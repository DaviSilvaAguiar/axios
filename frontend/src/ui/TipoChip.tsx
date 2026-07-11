import type { TipoLancamento } from "@/features/prestador/prestador.types";

const STYLES: Record<TipoLancamento, string> = {
  rdc: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  rcm: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
};

const LABELS: Record<TipoLancamento, string> = {
  rdc: "Caixa",
  rcm: "Reembolso",
};

export default function TipoChip({ tipo }: { tipo: TipoLancamento }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-small font-semibold ${STYLES[tipo]}`}
    >
      {LABELS[tipo]}
    </span>
  );
}
