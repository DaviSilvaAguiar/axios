import {
  type Icon,
  ClockCountdown,
  HourglassMedium,
  MagnifyingGlass,
  CheckCircle,
  CalendarCheck,
  Wallet,
  XCircle,
} from "@phosphor-icons/react";
import type { TipoLancamento } from "@/features/prestador/prestador.types";

type Variant = { label: string; classes: string; ringClass: string; StatusIcon: Icon };

const STATUS_BY_ID: Record<number, Variant> = {
  1: { label: "Rascunho",           classes: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",       ringClass: "ring-blue-200 dark:ring-blue-800",     StatusIcon: ClockCountdown },
  2: { label: "Pendente",           classes: "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300", ringClass: "ring-orange-200 dark:ring-orange-800", StatusIcon: HourglassMedium },
  3: { label: "Em Análise",         classes: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",   ringClass: "ring-amber-200 dark:ring-amber-800",   StatusIcon: MagnifyingGlass },
  4: { label: "Aprovado",           classes: "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300",   ringClass: "ring-green-200 dark:ring-green-800",   StatusIcon: CheckCircle },
  5: { label: "Pagamento Agendado", classes: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300", ringClass: "ring-purple-200 dark:ring-purple-800", StatusIcon: CalendarCheck },
  6: { label: "Pago",               classes: "bg-[#eef0f3] text-[#5b616e] dark:bg-app-surface-raised dark:text-app-text-muted", ringClass: "ring-[#d8dce4] dark:ring-app-border", StatusIcon: Wallet },
  7: { label: "Rejeitado",          classes: "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400",            ringClass: "ring-red-200 dark:ring-red-900",       StatusIcon: XCircle },
};

const FALLBACK: Variant = {
  label: "—",
  classes: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  ringClass: "ring-gray-200 dark:ring-gray-700",
  StatusIcon: CheckCircle as Icon,
};

interface Props {
  tipo: TipoLancamento;
  status: number;
}

export default function StatusTagGenerico({ tipo: _tipo, status }: Props) {
  const variant = STATUS_BY_ID[status] ?? FALLBACK;
  const { label, classes, ringClass, StatusIcon } = variant;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-small ring-1 ${classes} ${ringClass}`}
    >
      <StatusIcon size={11} weight="bold" />
      {label}
    </span>
  );
}
