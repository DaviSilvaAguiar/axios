"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Receipt,
  Wallet,
  ArrowUUpLeft,
  DownloadSimple,
  Users,
  Gear,
  ArrowRight,
  ClockCountdown,
  CurrencyCircleDollar,
  Files,
} from "@phosphor-icons/react";
import { type ElementType, useEffect, useState } from "react";
import Card from "@/ui/Card";
import Loading from "@/ui/Loading";
import MobileScreen from "@/ui/MobileScreen";
import LancamentoCard from "@/ui/LancamentoCard";
import { useAuth } from "@/contexts/AuthContext";
import { listarLancamentosApi } from "@/features/prestador/prestador.api";
import type { Lancamento } from "@/features/prestador/prestador.types";
import PendentesAprovacaoList from "./PendentesAprovacaoList";

// ── Dados ─────────────────────────────────────────────────────

const modulosOperacao = [
  {
    icon: Receipt,
    label: "Caixa de Obra",
    desc: "Registre e audite prestações de contas de campo",
    href: "/rdc",
    modulo: "rdc",
  },
  {
    icon: Wallet,
    label: "Gestão de Caixas",
    desc: "Controle saldos e adiantamentos pré-pagos",
    href: "/caixas",
    modulo: "caixas",
  },
  {
    icon: ArrowUUpLeft,
    label: "Reembolso",
    desc: "Solicite e aprove reembolsos de despesas",
    href: "/rcm",
    modulo: "rcm",
  },
  {
    icon: DownloadSimple,
    label: "Exportação ERP",
    desc: "Gere arquivos de integração para Sienge e Protheus",
    href: "/exportacao",
    modulo: "exportacao",
  },
];

const modulosConfig = [
  {
    icon: Users,
    label: "Usuários",
    desc: "Gerencie perfis e acessos da equipe",
    href: "/usuarios",
    modulo: "usuarios",
  },
  {
    icon: Gear,
    label: "Configurações",
    desc: "Ajuste as preferências do sistema",
    href: "/configuracoes",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

function ModuleCard({
  icon: Icon,
  label,
  desc,
  href,
}: {
  icon: ElementType;
  label: string;
  desc: string;
  href: string;
  modulo?: string;
}) {
  return (
    <motion.div variants={item}>
      <Link href={href} className="block h-full">
        <Card className="p-4 h-full hover:border-brand/30 transition-colors cursor-pointer group">
          <div className="flex flex-col gap-3 h-full">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/[0.07]">
                <Icon size={20} weight="light" className="text-brand" />
              </div>
              <ArrowRight
                size={14}
                weight="bold"
                className="text-brand opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <div>
              <p className="text-feature-title text-app-text group-hover:text-brand transition-colors leading-tight">
                {label}
              </p>
              <p className="text-small text-app-text-muted mt-1">{desc}</p>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

// ── Dashboard do Prestador ────────────────────────────────────

function fmtValor(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function PrestadorDashboard() {
  const [recentes, setRecentes] = useState<Lancamento[]>([]);
  const [pendenteRcm, setPendenteRcm] = useState(0);
  const [rdcRascunho, setRdcRascunho] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listarLancamentosApi("todos", 1, 3),
      listarLancamentosApi("rcm", 1, 50),
      listarLancamentosApi("rdc", 1, 50),
    ])
      .then(([recentesRes, rcmRes, rdcRes]) => {
        setRecentes(recentesRes.data);
        const pendente = rcmRes.data
          .filter((r) => r.status === 1 || r.status === 2 || r.status === 3)
          .reduce((s, r) => s + Number(r.valor_total), 0);
        setPendenteRcm(pendente);
        setRdcRascunho(rdcRes.data.filter((r) => r.status === 1).length);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  return (
    <MobileScreen>
      {loading ? (
        <Loading size="sm" />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.06 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <Card className="p-4 flex flex-col gap-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60">
              <Files size={18} weight="light" className="text-blue-700 dark:text-blue-300" />
            </div>
            <p className="text-small text-app-text-muted mt-1">RDCs em rascunho</p>
            <p className="text-feature-title text-app-text">{rdcRascunho}</p>
          </Card>

          <Card className="p-4 flex flex-col gap-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
              <CurrencyCircleDollar size={18} weight="light" className="text-amber-600" />
            </div>
            <p className="text-small text-app-text-muted mt-1">Reembolso pendente</p>
            <p className="text-feature-title text-app-text">{fmtValor(pendenteRcm)}</p>
          </Card>
        </motion.div>
      )}

      {!loading && recentes.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.18 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-caption font-semibold text-app-text-muted uppercase tracking-widest">
              Recentes
            </p>
            <Link href="/meus-lancamentos" className="text-small text-brand hover:underline">
              Ver todos
            </Link>
          </div>

          <div className="space-y-3">
            {recentes.map((l) => (
              <LancamentoCard key={`${l.tipo}-${l.id}`} lancamento={l} />
            ))}
          </div>
        </motion.section>
      )}

      {!loading && recentes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-3 py-10 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/[0.07]">
            <ClockCountdown size={28} weight="light" className="text-brand" />
          </div>
          <p className="text-feature-title text-app-text">Nenhum lançamento ainda</p>
          <p className="text-body-sm text-app-text-muted">
            Toque no + abaixo pra começar
          </p>
        </motion.div>
      )}
    </MobileScreen>
  );
}

// ── Página ────────────────────────────────────────────────────

export default function DashboardPage() {
  const { usuario, temModulo } = useAuth();

  if (usuario?.perfil === 3) {
    return <PrestadorDashboard />;
  }

  const operacaoVisiveis = modulosOperacao.filter((m) => temModulo(m.modulo));
  const configVisiveis = modulosConfig.filter((m) => !m.modulo || temModulo(m.modulo));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Acesso rápido — Operações */}
      {operacaoVisiveis.length === 0 && configVisiveis.length === 0 ? (
        <div className="rounded-2xl border border-app-border bg-app-surface p-8 text-center">
          <p className="text-feature-title text-app-text">Nenhum módulo habilitado</p>
          <p className="text-body-sm text-app-text-muted mt-2">
            Fale com o administrador para liberar os módulos do sistema.
          </p>
        </div>
      ) : (
        <section className="space-y-4">
          {operacaoVisiveis.length > 0 && (
            <>
              <p className="text-caption text-app-text-muted uppercase tracking-widest">
                Acesso rápido
              </p>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
              >
                {operacaoVisiveis.map((mod) => (
                  <ModuleCard key={mod.href} {...mod} />
                ))}
              </motion.div>
            </>
          )}

          {configVisiveis.length > 0 && (
            <>
              {operacaoVisiveis.length > 0 && (
                <div className="flex items-center gap-3 pt-2">
                  <div className="h-px flex-1 bg-app-border" />
                  <span className="text-small text-app-text-muted shrink-0">
                    Configurações
                  </span>
                  <div className="h-px flex-1 bg-app-border" />
                </div>
              )}

              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 gap-3"
              >
                {configVisiveis.map((mod) => (
                  <ModuleCard key={mod.href} {...mod} />
                ))}
              </motion.div>
            </>
          )}
        </section>
      )}

      {/* Pendentes de aprovação */}
      <section>
        <PendentesAprovacaoList />
      </section>
    </div>
  );
}
