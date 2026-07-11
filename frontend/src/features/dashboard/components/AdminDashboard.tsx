"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowClockwise } from "@phosphor-icons/react";
import Card from "@/ui/Card";
import Button from "@/ui/Button";
import { formatarMoeda } from "@/lib/formatters";
import { overviewDashboardApi } from "../dashboard.api";
import type { Overview } from "../dashboard.types";
import KpiCard from "./KpiCard";
import KpiCardSkeleton from "./KpiCardSkeleton";
import MovimentacaoMensalSkeleton from "./MovimentacaoMensalSkeleton";

// Gráfico usa recharts (lib pesada) — carregado sob demanda para não bloquear
// a pintura inicial do painel. Mostra o skeleton enquanto o chunk chega.
const MovimentacaoMensalChart = dynamic(() => import("./MovimentacaoMensalChart"), {
  ssr: false,
  loading: () => <MovimentacaoMensalSkeleton />,
});
import MonthYearFilter from "./MonthYearFilter";
import ProximosPagamentosList from "./ProximosPagamentosList";
import TopCentrosCustoList from "./TopCentrosCustoList";
import ListaSkeleton from "./ListaSkeleton";
import PendentesAprovacaoList from "./PendentesAprovacaoList";

export default function AdminDashboard() {
  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(false);
    try {
      const overview = await overviewDashboardApi(ano, mes);
      setData(overview);
    } catch {
      setErro(true);
    } finally {
      setLoading(false);
    }
  }, [ano, mes]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function handleMudarPeriodo(novoAno: number, novoMes: number) {
    setAno(novoAno);
    setMes(novoMes);
  }

  if (erro) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <Card className="p-8 flex flex-col items-center gap-4 text-center">
          <p className="text-feature-title text-app-text">Não foi possível carregar o dashboard</p>
          <p className="text-body-sm text-app-text-muted">
            Verifique sua conexão e tente novamente.
          </p>
          <Button variant="dark" onClick={carregar}>
            <ArrowClockwise size={16} />
            Tentar novamente
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-card-title text-app-text">Dashboard</h1>
        <MonthYearFilter ano={ano} mes={mes} onChange={handleMudarPeriodo} />
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {loading || !data ? (
          <>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </>
        ) : (
          <>
            <KpiCard
              label="Caixas ativos"
              value={String(data.kpis.caixas_ativos)}
              href="/caixas"
            />
            <KpiCard
              label="Saldo total"
              value={formatarMoeda(parseFloat(data.kpis.saldo_total))}
              href="/caixas"
            />
            <KpiCard
              label="Pendentes de auditoria"
              value={String(data.kpis.rdcs_pendentes)}
              href="/rdc"
            />
            <KpiCard
              label="Lotes exportados"
              value={String(data.kpis.lotes_exportados_mes)}
              href="/exportacao"
            />
          </>
        )}
      </section>

      <section>
        {loading || !data ? (
          <MovimentacaoMensalSkeleton />
        ) : (
          <MovimentacaoMensalChart
            movimentacao={data.movimentacao_mensal}
            anoAtivo={ano}
            mesAtivo={mes}
          />
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {loading || !data ? (
          <>
            <ListaSkeleton />
            <ListaSkeleton />
          </>
        ) : (
          <>
            <ProximosPagamentosList itens={data.proximos_pagamentos} />
            <TopCentrosCustoList itens={data.top_centros_custo_mes} />
          </>
        )}
      </section>

      <section>
        <PendentesAprovacaoList />
      </section>
    </div>
  );
}
