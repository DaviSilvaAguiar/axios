"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "@phosphor-icons/react";
import { AnimatePresence } from "framer-motion";
import Button from "@/ui/Button";
import Card from "@/ui/Card";
import Loading from "@/ui/Loading";
import { toast } from "@/lib/toast";
import DashboardCaixas from "@/features/caixa-conta/components/DashboardCaixas";
import FormCaixaConta from "@/features/caixa-conta/components/FormCaixaConta";
import {
  criarCaixaContaApi,
  listarCaixaContasApi,
  type CaixaContaStatusFiltro,
} from "@/features/caixa-conta/caixa-conta.api";
import {
  type CaixaConta,
  type StoreCaixaContaFormData,
} from "@/features/caixa-conta/caixa-conta.types";

export default function CaixasPage() {
  const router = useRouter();
  const [caixas, setCaixas] = useState<CaixaConta[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<CaixaContaStatusFiltro>("abertos");
  const [showForm, setShowForm] = useState(false);

  const carregar = useCallback(async (filtro: CaixaContaStatusFiltro) => {
    setLoading(true);
    try {
      setCaixas(await listarCaixaContasApi(filtro));
    } catch {
      toast.error("Não foi possível carregar os caixas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar(tab);
  }, [carregar, tab]);

  async function handleCriar(dados: StoreCaixaContaFormData) {
    const novo = await criarCaixaContaApi(dados);
    setCaixas((prev) => [novo, ...prev]);
    setShowForm(false);
    toast.success("Caixa criado com sucesso!");
  }

  return (
    <>
      <div className="flex flex-col gap-4 p-6">
        <Card>
          <div className="flex items-center justify-between px-5 py-4">
            <h1 className="text-feature-title text-app-text">Gestão de Caixas</h1>
            <Button variant="dark" size="sm" onClick={() => setShowForm(true)}>
              <Plus size={14} />
              Novo Caixa
            </Button>
          </div>

          <div className="flex items-center gap-3 border-t border-app-border px-5 py-3">
            <div className="flex rounded-xl border border-app-border bg-app-surface overflow-hidden">
              <button
                onClick={() => setTab("abertos")}
                className={`px-4 py-2 text-caption font-semibold transition-colors cursor-pointer ${
                  tab === "abertos"
                    ? "bg-app-surface-raised text-app-text"
                    : "text-app-text-muted hover:bg-app-hover"
                }`}
              >
                Abertos
              </button>
              <button
                onClick={() => setTab("fechados")}
                className={`px-4 py-2 text-caption font-semibold transition-colors cursor-pointer ${
                  tab === "fechados"
                    ? "bg-app-surface-raised text-app-text"
                    : "text-app-text-muted hover:bg-app-hover"
                }`}
              >
                Fechados
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5">
            {loading ? (
              <Loading />
            ) : (
              <DashboardCaixas
                caixas={caixas}
                onSelecionarCaixa={(c) => router.push(`/caixas/${c.id}`)}
                fechados={tab === "fechados"}
              />
            )}
          </div>
        </Card>
      </div>

      <AnimatePresence>
        {showForm && (
          <FormCaixaConta
            onSalvar={handleCriar}
            onFechar={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
