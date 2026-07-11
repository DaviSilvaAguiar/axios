import { CheckCircle, XCircle } from "@phosphor-icons/react";

export default function BadgeAtivo({ ativo }: { ativo: boolean }) {
  if (ativo) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-small ring-1 bg-green-100 text-green-700 ring-green-200 dark:bg-green-500/15 dark:text-green-400 dark:ring-green-500/30">
        <CheckCircle size={11} weight="bold" />
        Ativo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-small ring-1 bg-app-surface-raised text-app-text-muted ring-app-border">
      <XCircle size={11} weight="bold" />
      Inativo
    </span>
  );
}
