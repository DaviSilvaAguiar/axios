"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaretDown, CheckCircle, Plug, Key } from "@phosphor-icons/react";
import type { Integracao } from "../integracao.types";

interface Props {
  integracoes: Integracao[];
  onSelecionar: (i: Integracao) => void;
  loading?: boolean;
}

export default function SelectorIntegracao({ integracoes, onSelecionar, loading }: Props) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const configurada = integracoes.find((i) => i.configurada);

  useEffect(() => {
    if (!aberto) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [aberto]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        disabled={loading}
        className="flex items-center justify-between gap-3 w-full md:w-[320px] rounded-xl border border-app-border bg-app-surface px-4 py-3 text-left hover:border-brand/40 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Plug size={16} className="text-app-text-subtle shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-small text-app-text-subtle font-normal">Integração</span>
            <span className="text-body-sm text-app-text font-medium truncate">
              {loading
                ? "Carregando…"
                : configurada
                ? configurada.nome
                : "Selecione uma integração"}
            </span>
          </div>
        </div>
        <CaretDown
          size={14}
          className={`text-app-text-muted transition-transform ${aberto ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 md:left-auto md:right-0 md:w-[420px] z-20 mt-2 rounded-2xl border border-app-border bg-app-surface shadow-xl overflow-hidden"
          >
            <div className="px-4 py-2 border-b border-app-border-subtle">
              <span className="text-small text-app-text-subtle">Integrações disponíveis</span>
            </div>
            {integracoes.length === 0 ? (
              <div className="px-4 py-6 text-center text-body-sm text-app-text-muted">
                Nenhuma integração disponível.
              </div>
            ) : (
              <ul className="max-h-72 overflow-y-auto">
                {integracoes.map((i) => (
                  <li key={i.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelecionar(i);
                        setAberto(false);
                      }}
                      className={[
                        "w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-app-hover transition-colors cursor-pointer",
                        i.configurada ? "bg-brand/[0.04]" : "",
                      ].join(" ")}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef0f3] shrink-0">
                        <Key size={16} className="text-app-text-muted" />
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <span className="text-body-sm text-app-text font-semibold">{i.nome}</span>
                        <span className="text-small text-app-text-muted font-normal leading-snug">
                          {i.configurada
                            ? "Token configurado — clique para atualizar"
                            : "Aguardando token — clique para configurar"}
                        </span>
                      </div>
                      {i.configurada && (
                        <CheckCircle size={16} weight="fill" className="text-brand shrink-0 mt-0.5" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
