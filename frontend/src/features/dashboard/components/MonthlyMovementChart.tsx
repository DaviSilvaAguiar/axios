"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "@/ui/Card";
import { formatarMoeda } from "@/lib/formatters";
import type { MovMensalItem } from "../dashboard.types";

interface Props {
  movimentacao: MovMensalItem[];
  /** Ano/mês selecionado — barra é destacada com brand color. */
  anoAtivo: number;
  mesAtivo: number;
}

const NOMES_MES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

interface TooltipItemPayload {
  ano: number;
  mes: number;
  debitos: number;
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { payload: TooltipItemPayload }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div
      className="rounded-xl border border-app-border bg-app-surface px-3 py-2 shadow-md"
      style={{ fontSize: 12 }}
    >
      <p className="text-app-text-muted mb-1">{`${label}/${p.ano}`}</p>
      <p className="font-semibold" style={{ color: "#dc2626" }}>
        {`Débitos: ${formatarMoeda(p.debitos)}`}
      </p>
    </div>
  );
}

export default function MovimentacaoMensalChart({ movimentacao, anoAtivo, mesAtivo }: Props) {
  // ≤768px: mostra últimos 6 meses; ≥768px: 12.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const dados = (isMobile ? movimentacao.slice(-6) : movimentacao).map((m) => ({
    label:    NOMES_MES[m.mes - 1],
    ano:      m.ano,
    mes:      m.mes,
    debitos:  Math.abs(parseFloat(m.debitos)),
    creditos: parseFloat(m.creditos),
    saldo:    parseFloat(m.saldo_liquido),
  }));

  const semDados = dados.every((d) => d.creditos === 0 && d.debitos === 0);

  return (
    <Card className="p-5">
      <p className="text-caption text-app-text-muted uppercase tracking-wide mb-4">
        Movimentação mensal
      </p>

      {semDados ? (
        <div className="flex h-[200px] items-center justify-center text-small text-app-text-subtle">
          Sem movimentação no período
        </div>
      ) : (
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dados} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "var(--app-text-subtle)" }}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "var(--app-surface-raised)" }}
                content={<ChartTooltip />}
              />
              <Bar dataKey="debitos" radius={[4, 4, 0, 0]}>
                {dados.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.ano === anoAtivo && d.mes === mesAtivo ? "#16a34a" : "#0052ff"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
