"use client";

import { motion } from "framer-motion";
import { PaperPlaneTilt, Plug } from "@phosphor-icons/react";
import Button from "@/ui/Button";

const fmtMoeda = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Props {
  quantidade: number;
  valorTotal: number;
  integracaoNome: string | null;
  integracaoConfigurada: boolean;
  loading: boolean;
  onLimpar: () => void;
  onEnviar: () => void;
}

export default function ActionBarEnviarIntegracao({
  quantidade,
  valorTotal,
  integracaoNome,
  integracaoConfigurada,
  loading,
  onLimpar,
  onEnviar,
}: Props) {
  const pode = integracaoConfigurada && !loading;
  const hint = integracaoNome
    ? integracaoConfigurada
      ? `Pronto para enviar via ${integracaoNome}`
      : `Configure o token de ${integracaoNome} antes de enviar`
    : "Selecione uma integração";

  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 24, opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-[min(92vw,760px)]"
    >
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-app-border bg-app-surface shadow-2xl px-5 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/[0.08] shrink-0">
            <Plug size={16} weight="fill" className="text-brand" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-caption text-app-text">
              {quantidade} {quantidade === 1 ? "documento selecionado" : "documentos selecionados"}
            </span>
            <span className="text-small text-app-text-muted font-normal truncate">
              Total {fmtMoeda(valorTotal)} • {hint}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="light" size="sm" onClick={onLimpar} disabled={loading}>
            Limpar
          </Button>
          <Button variant="brand" size="sm" disabled={!pode} onClick={onEnviar}>
            <PaperPlaneTilt size={14} weight="bold" />
            {loading ? "Enviando…" : "Enviar"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
