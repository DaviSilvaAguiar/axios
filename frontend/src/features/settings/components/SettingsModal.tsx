"use client";

import { useEffect, useState } from "react";
import { ArrowUUpLeft, Wallet, Gear, CircleNotch, X } from "@phosphor-icons/react";
import Modal from "@/ui/Modal";
import Button from "@/ui/Button";
import { toast } from "@/lib/toast";
import { useConfigs } from "@/contexts/ConfigContext";
import { listarConfigsApi, atualizarConfigApi } from "../config.api";
import type { Config } from "../config.types";

interface Props {
  open: boolean;
  onClose: () => void;
}

type ModuloKey = "geral" | "reembolso" | "caixa";

const MODULOS: { key: ModuloKey; label: string; icon: typeof Wallet }[] = [
  { key: "geral", label: "Geral", icon: Gear },
  { key: "reembolso", label: "Reembolso", icon: ArrowUUpLeft },
  { key: "caixa", label: "Caixa", icon: Wallet },
];

const CONFIGS_POR_MODULO: Record<ModuloKey, string[]> = {
  geral: ["obrigatorio_codigo_erp"],
  reembolso: ["habilitar_geolocalizacao_despesa_rcm"],
  caixa: ["habilitar_geolocalizacao_despesa_rdc"],
};

const SUFIXOS_MODULO = ["_rcm", "_rdc"];

function formatarLabelParametro(parametro: string): string {
  let base = parametro;
  for (const sufixo of SUFIXOS_MODULO) {
    if (base.endsWith(sufixo)) {
      base = base.slice(0, -sufixo.length);
      break;
    }
  }
  return base
    .split("_")
    .filter(Boolean)
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(" ");
}

export default function ConfiguracoesModal({ open, onClose }: Props) {
  const { recarregar: recarregarContextConfigs } = useConfigs();
  const [configsOriginais, setConfigsOriginais] = useState<Config[]>([]);
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [moduloAtivo, setModuloAtivo] = useState<ModuloKey>("geral");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listarConfigsApi()
      .then((res) => {
        setConfigsOriginais(res);
        setConfigs(res);
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Erro ao carregar configurações."))
      .finally(() => setLoading(false));
  }, [open]);

  function handleToggle(config: Config) {
    const novoValor = config.valor === 1 ? 0 : 1;
    setConfigs((prev) => prev.map((c) => (c.id === config.id ? { ...c, valor: novoValor } : c)));
  }

  function getAlteracoes(): Config[] {
    return configs.filter((atual) => {
      const original = configsOriginais.find((o) => o.id === atual.id);
      return original && original.valor !== atual.valor;
    });
  }

  async function handleSalvar() {
    const alteracoes = getAlteracoes();
    if (alteracoes.length === 0) {
      onClose();
      return;
    }

    setSalvando(true);
    try {
      const resultados = await Promise.all(
        alteracoes.map((c) => atualizarConfigApi(c.id, c.valor)),
      );
      setConfigs((prev) =>
        prev.map((c) => {
          const atualizado = resultados.find((r) => r.id === c.id);
          return atualizado ?? c;
        }),
      );
      setConfigsOriginais((prev) =>
        prev.map((c) => {
          const atualizado = resultados.find((r) => r.id === c.id);
          return atualizado ?? c;
        }),
      );
      await recarregarContextConfigs();
      toast.success("Configurações salvas.");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar as configurações.");
    } finally {
      setSalvando(false);
    }
  }

  function handleClose() {
    if (salvando) return;
    setConfigs(configsOriginais);
    onClose();
  }

  const parametrosDoModulo = CONFIGS_POR_MODULO[moduloAtivo];
  const configsDoModulo = configs.filter((c) => parametrosDoModulo.includes(c.parametro));
  const temAlteracoes = getAlteracoes().length > 0;

  return (
    <Modal open={open} onClose={handleClose} className="!max-w-4xl">
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-app-border">
          <h2 className="text-feature-title text-app-text">Configurações</h2>
          <button
            onClick={handleClose}
            aria-label="Fechar"
            className="text-app-text-muted hover:text-app-text transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row min-h-[420px]">
          <aside className="md:w-56 md:border-r border-app-border md:border-b-0 border-b">
            <ul className="p-3 space-y-0.5">
              {MODULOS.map(({ key, label, icon: Icon }) => {
                const active = moduloAtivo === key;
                return (
                  <li key={key}>
                    <button
                      onClick={() => setModuloAtivo(key)}
                      className={[
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer",
                        active
                          ? "bg-app-nav-active text-brand"
                          : "text-app-text-muted hover:text-app-text hover:bg-app-hover",
                      ].join(" ")}
                    >
                      <Icon size={18} weight={active ? "fill" : "regular"} />
                      <span>{label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <section className="flex-1 p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full text-app-text-muted">
                <CircleNotch size={22} className="animate-spin" />
              </div>
            ) : configsDoModulo.length === 0 ? (
              <p className="text-body-sm text-app-text-muted">
                Nenhuma configuração disponível para este módulo.
              </p>
            ) : (
              <ul className="space-y-3">
                {configsDoModulo.map((config) => (
                  <li
                    key={config.id}
                    className="flex items-start justify-between gap-4 p-4 rounded-xl border border-app-border bg-app-surface-raised"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-medium text-app-text">
                        {formatarLabelParametro(config.parametro)}
                      </p>
                      <p className="text-caption text-app-text-muted mt-1">
                        {config.descricao}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle(config)}
                      aria-pressed={config.valor === 1}
                      className={[
                        "relative shrink-0 w-11 h-6 rounded-full transition-colors cursor-pointer",
                        config.valor === 1 ? "bg-brand" : "bg-app-border",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                          config.valor === 1 ? "translate-x-5" : "translate-x-0",
                        ].join(" ")}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-app-border">
          <Button onClick={handleSalvar} disabled={salvando || !temAlteracoes}>
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
