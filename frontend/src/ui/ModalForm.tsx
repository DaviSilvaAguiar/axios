"use client";

import { useId, type FormEvent, type ReactNode } from "react";
import { X } from "@phosphor-icons/react";
import Button from "./Button";

interface Props {
  titulo: string;
  onCancelar: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  submitting?: boolean;
  submitLabel?: string;
  children: ReactNode;
}

export default function ModalForm({
  titulo,
  onCancelar,
  onSubmit,
  submitting = false,
  submitLabel = "Salvar",
  children,
}: Props) {
  const formId = useId();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b border-app-border">
        <h2 className="text-feature-title text-app-text">{titulo}</h2>
        <button
          type="button"
          onClick={onCancelar}
          className="text-app-text-muted hover:text-app-text transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>
      </div>

      <form
        id={formId}
        onSubmit={onSubmit}
        className="flex flex-col gap-4 flex-1 overflow-y-auto px-6 py-5"
      >
        {children}
      </form>

      <div className="flex items-center justify-end gap-3 px-4 md:px-6 py-3 md:py-4 border-t border-app-border bg-app-surface">
        <Button
          type="button"
          variant="light"
          size="sm"
          onClick={onCancelar}
          className="flex-1 md:flex-initial"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form={formId}
          variant="dark"
          size="sm"
          disabled={submitting}
          className="flex-1 md:flex-initial"
        >
          {submitting ? "Salvando…" : submitLabel}
        </Button>
      </div>
    </div>
  );
}
