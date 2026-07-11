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
import { RDC_STATUS_LABEL, type RdcStatus } from "../rdc.types";

const STATUS_CONFIG: Record<number, { classes: string; ringClass: string; StatusIcon: Icon }> = {
  1: { classes: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300", ringClass: "ring-blue-200 dark:ring-blue-800", StatusIcon: ClockCountdown },
  2: { classes: "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300", ringClass: "ring-orange-200 dark:ring-orange-800", StatusIcon: HourglassMedium },
  3: { classes: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300", ringClass: "ring-amber-200 dark:ring-amber-800", StatusIcon: MagnifyingGlass },
  4: { classes: "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300", ringClass: "ring-green-200 dark:ring-green-800", StatusIcon: CheckCircle },
  5: { classes: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300", ringClass: "ring-purple-200 dark:ring-purple-800", StatusIcon: CalendarCheck },
  6: { classes: "bg-[#eef0f3] text-[#5b616e] dark:bg-app-surface-raised dark:text-app-text-muted", ringClass: "ring-[#d8dce4] dark:ring-app-border", StatusIcon: Wallet },
  7: { classes: "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400", ringClass: "ring-red-200 dark:ring-red-900", StatusIcon: XCircle },
};

const FALLBACK_CONFIG = {
  classes:    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  ringClass:  "ring-gray-200 dark:ring-gray-700",
  StatusIcon: CheckCircle as Icon,
};

interface Props {
  status: RdcStatus;
}

export default function StatusTag({ status }: Props) {
  const { classes, ringClass, StatusIcon } = STATUS_CONFIG[status] ?? FALLBACK_CONFIG;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-small ring-1 ${classes} ${ringClass}`}
    >
      <StatusIcon size={11} weight="bold" />
      {RDC_STATUS_LABEL[status]}
    </span>
  );
}
