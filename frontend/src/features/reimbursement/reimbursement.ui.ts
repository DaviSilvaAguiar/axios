import {
  type Icon,
  Receipt,
  ForkKnife,
  Car,
  House,
  Airplane,
  ClockCountdown,
  MagnifyingGlass,
  CheckCircle,
  CalendarCheck,
  Wallet,
  XCircle,
} from "@phosphor-icons/react";

export function getCategoryIcon(description: string | undefined | null): Icon {
  if (!description) return Receipt;
  const d = description.toLowerCase();
  if (/alimenta|refeição|almoço|jantar|lanche|restaurante/.test(d)) return ForkKnife;
  if (/combustível|gasolina|etanol|diesel|transporte|uber|taxi|táxi|ônibus/.test(d)) return Car;
  if (/hospedagem|hotel|pousada|airbnb/.test(d)) return House;
  if (/passagem|avião|aéreo|voo|flight/.test(d)) return Airplane;
  return Receipt;
}

export function getCategoryColors(description: string | undefined | null): { bg: string; fg: string } {
  if (!description) return { bg: "bg-app-surface-raised", fg: "text-app-text-muted" };
  const d = description.toLowerCase();
  if (/alimenta|refeição|almoço|jantar|lanche|restaurante/.test(d))
    return { bg: "bg-amber-100 dark:bg-amber-950/60", fg: "text-amber-700 dark:text-amber-300" };
  if (/combustível|gasolina|etanol|diesel|transporte|uber|taxi|táxi|ônibus/.test(d))
    return { bg: "bg-blue-100 dark:bg-blue-950/60", fg: "text-blue-700 dark:text-blue-300" };
  if (/hospedagem|hotel|pousada|airbnb/.test(d))
    return { bg: "bg-purple-100 dark:bg-purple-950/60", fg: "text-purple-700 dark:text-purple-300" };
  if (/passagem|avião|aéreo|voo|flight/.test(d))
    return { bg: "bg-indigo-100 dark:bg-indigo-950/60", fg: "text-indigo-700 dark:text-indigo-300" };
  return { bg: "bg-app-surface-raised", fg: "text-app-text-muted" };
}

export const STATUS_MINI_CONFIG: Record<
  number,
  { icon: Icon; bg: string; border: string; fg: string; helperFg: string; helper: string }
> = {
  1: {
    icon: ClockCountdown,
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-200 dark:border-blue-800",
    fg: "text-blue-700 dark:text-blue-300",
    helperFg: "text-blue-600/80 dark:text-blue-400/80",
    helper: "Awaiting approval",
  },
  2: {
    icon: MagnifyingGlass,
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
    fg: "text-amber-700 dark:text-amber-300",
    helperFg: "text-amber-600/80 dark:text-amber-400/80",
    helper: "Under financial review",
  },
  3: {
    icon: CheckCircle,
    bg: "bg-green-50 dark:bg-green-950/40",
    border: "border-green-200 dark:border-green-800",
    fg: "text-green-700 dark:text-green-300",
    helperFg: "text-green-600/80 dark:text-green-400/80",
    helper: "Approved for payment",
  },
  4: {
    icon: CalendarCheck,
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-200 dark:border-purple-800",
    fg: "text-purple-700 dark:text-purple-300",
    helperFg: "text-purple-600/80 dark:text-purple-400/80",
    helper: "Payment scheduled",
  },
  5: {
    icon: Wallet,
    bg: "bg-app-surface-raised",
    border: "border-app-border",
    fg: "text-app-text",
    helperFg: "text-app-text-muted",
    helper: "Reimbursement completed",
  },
  6: {
    icon: XCircle,
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-200 dark:border-red-900",
    fg: "text-red-600 dark:text-red-400",
    helperFg: "text-red-500/80 dark:text-red-400/70",
    helper: "Request rejected",
  },
};
