"use client";

import { useState } from "react";
import { MapPin, X } from "@phosphor-icons/react";
import SeletorLocalizacao from "./SeletorLocalizacao";
import type { Localizacao } from "../geolocalizacao.types";

interface Props {
  valor: Localizacao | null;
  onChange: (loc: Localizacao | null) => void;
  label?: string;
  disabled?: boolean;
}

export default function CampoLocalizacao({ valor, onChange, label = "Localização", disabled }: Props) {
  const [open, setOpen] = useState(false);

  function abrir() {
    if (disabled) return;
    setOpen(true);
  }

  function remover(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="text-caption font-semibold text-app-text-muted">{label}</label>
        <button
          type="button"
          onClick={abrir}
          disabled={disabled}
          className="flex items-center gap-2.5 w-full text-left rounded-xl border border-app-border bg-app-surface px-3 py-2.5 hover:bg-app-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MapPin size={18} className="text-app-text-muted shrink-0" />
          {valor ? (
            <span className="flex-1 min-w-0">
              <span className="block text-body-sm text-app-text truncate">
                {valor.endereco ?? `${valor.latitude.toFixed(6)}, ${valor.longitude.toFixed(6)}`}
              </span>
              {valor.endereco && (
                <span className="block text-caption text-app-text-subtle">
                  {valor.latitude.toFixed(6)}, {valor.longitude.toFixed(6)}
                </span>
              )}
            </span>
          ) : (
            <span className="flex-1 text-body-sm text-app-text-subtle">
              Selecionar localização
            </span>
          )}
          {valor && !disabled && (
            <span
              onClick={remover}
              role="button"
              aria-label="Remover localização"
              className="p-1 rounded-md text-app-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <X size={14} />
            </span>
          )}
        </button>
      </div>

      <SeletorLocalizacao
        open={open}
        onClose={() => setOpen(false)}
        valorInicial={valor}
        onConfirmar={onChange}
      />
    </>
  );
}
