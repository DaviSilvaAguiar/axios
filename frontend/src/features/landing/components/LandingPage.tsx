"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Envelope,
  User,
  Buildings,
  ArrowRight,
  CheckCircle,
  Receipt,
  Wallet,
  CurrencyDollar,
  FileArrowDown,
  PlugsConnected,
} from "@phosphor-icons/react";
import Button from "@/ui/Button";
import InputPill from "@/ui/InputPill";
import { leadFormSchema, type LeadFormData } from "../landing.types";
import { enviarLeadApi } from "../landing.api";

/* ── Features ──────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <Receipt size={22} weight="bold" />,
    title: "Adiantamentos",
    resumo: "Prestação de contas de caixa criada em campo pelo prestador e auditada pelo financeiro — com validação automática.",
    bullets: [
      "Chave da NFe (44 dígitos) validada direto na Sefaz",
      "CNPJ e razão social conferidos na ReceitaWS",
      "Auditoria lado a lado: dados, anexo e retorno das APIs",
      "Ao aprovar, debita o caixa do prestador automaticamente",
    ],
  },
  {
    icon: <Wallet size={22} weight="bold" />,
    title: "Gestão de Caixas",
    resumo: "Saldos pré-pagos dos prestadores com extrato bancável e rastro de cada centavo movimentado.",
    bullets: [
      "Um caixa por usuário e centro de custo",
      "Crédito por adiantamento, débito na aprovação do RDC",
      "Extrato estilo banco com link para o RDC de origem",
      "Só fecha com saldo zerado — sem ponta solta",
    ],
  },
  {
    icon: <CurrencyDollar size={22} weight="bold" />,
    title: "Reembolsos",
    resumo: "Fluxo pós-pago para quem gasta do próprio bolso, sem burocracia e sem tocar nos caixas.",
    bullets: [
      "Kanban: Rascunho → Em análise → Aprovado → Agendado → Pago",
      "Centro de custo definido por item de despesa",
      "Data de pagamento obrigatória ao agendar",
      "No arquivo do ERP, o fornecedor é o código do colaborador",
    ],
  },
  {
    icon: <FileArrowDown size={22} weight="bold" />,
    title: "Exportação ERP",
    resumo: "Lotes aprovados viram arquivo pronto para o seu ERP, sem reformatar nem copiar e colar.",
    bullets: [
      "Abas separadas para Prestações (RDC) e Reembolsos (RCM)",
      "Templates por ERP via handlers (Sienge, Protheus e mais)",
      "Selecione vários lotes e baixe em CSV ou Excel",
      "Lote exportado nunca reverte — zero pagamento em dobro",
    ],
  },
];

const HERO_TITLE = "Controle total\nsobre as despesas\nda sua equipe.";
const HERO_SUBTITLE =
  "Do lançamento ao ERP, sem fricção e sem erros. Adiantamentos, reembolsos e prestações em um único lugar.";

function useTypewriter(text: string, speedMs: number, active: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active || count >= text.length) return;
    const id = setTimeout(() => setCount((c) => c + 1), speedMs);
    return () => clearTimeout(id);
  }, [active, count, text.length, speedMs]);

  return { typed: text.slice(0, count), done: active && count >= text.length };
}

function Caret() {
  return (
    <span
      aria-hidden="true"
      className="ml-1 inline-block w-[3px] h-[0.82em] translate-y-[0.12em] bg-brand animate-caret"
    />
  );
}

/* Detecta quando o elemento entra na viewport (dispara uma única vez). */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

/* Estado inicial (escondido) por direção de entrada. */
const REVEAL_HIDDEN = {
  left: "opacity-0 -translate-x-10",
  right: "opacity-0 translate-x-10",
  up: "opacity-0 translate-y-12",
} as const;

/* Revela o conteúdo ao entrar na viewport, deslizando da direção indicada. */
function Reveal({
  direction = "up",
  delay = 0,
  className = "",
  children,
}: {
  direction?: keyof typeof REVEAL_HIDDEN;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${inView ? "opacity-100 translate-x-0 translate-y-0" : REVEAL_HIDDEN[direction]
        } ${className}`}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [leadSent, setLeadSent] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({ resolver: zodResolver(leadFormSchema) });

  async function onSubmit(dados: LeadFormData) {
    try {
      await enviarLeadApi(dados);
      setLeadSent(true);
    } catch {
      setError("root", { message: "Erro ao enviar. Tente novamente." });
    }
  }

  const title = useTypewriter(HERO_TITLE, 22, true);
  const subtitle = useTypewriter(HERO_SUBTITLE, 7, title.done);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!subtitle.done) return;
    const id = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(id);
  }, [subtitle.done]);

  return (
    <div className="bg-white">

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <span className="font-ui text-[15px] font-semibold text-ink tracking-tight">Axios</span>
          <Link href="/login">
            <Button variant="outlined" size="sm">Entrar</Button>
          </Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="max-w-[1600px] mx-auto px-6 lg:px-10 py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-14 lg:gap-10">

        {/* Texto */}
        <div className="lg:flex-[0.8] flex flex-col gap-8 lg:max-w-[520px]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
              <span className="font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Gestão financeira para equipes
              </span>
            </div>

            {/* Título — o "fantasma" invisível reserva o espaço; a sobreposição digita */}
            <h1 className="text-display-hero text-ink relative">
              <span aria-hidden="true" className="block invisible whitespace-pre-line">
                {HERO_TITLE}
              </span>
              <span aria-hidden="true" className="block absolute inset-0 whitespace-pre-line">
                {title.typed}
                {!title.done && <Caret />}
              </span>
              <span className="sr-only">{HERO_TITLE}</span>
            </h1>
          </div>

          <p className="text-body text-ink-muted max-w-[420px] relative">
            <span aria-hidden="true" className="block invisible">{HERO_SUBTITLE}</span>
            <span aria-hidden="true" className="block absolute inset-0">
              {subtitle.typed}
              {title.done && !subtitle.done && <Caret />}
            </span>
            <span className="sr-only">{HERO_SUBTITLE}</span>
          </p>

          <div
            className={`flex items-center gap-3 flex-wrap transition-all duration-700 ease-out ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
          >
            <a href="#demo">
              <Button variant="brand">
                Começar agora <ArrowRight size={16} weight="bold" className="inline ml-1" />
              </Button>
            </a>
            <Link href="/login">
              <Button variant="light">Entrar na plataforma</Button>
            </Link>
          </div>

          {/* Linha de confiança — integrações */}
          <div
            className={`flex items-center gap-2 text-ink-muted transition-all duration-700 delay-150 ease-out ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
          >
            <PlugsConnected size={16} weight="bold" className="shrink-0" />
            <span className="font-ui text-[13px]">
              Integra com os ERPs do mercado.
            </span>
          </div>

        </div>

        {/* Mockup do app */}
        <div
          className={`lg:flex-[1.2] w-full transition-all duration-[900ms] ease-out ${revealed ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-[0.97]"
            }`}
        >
          <div className="rounded-[20px] bg-[#0a0b0d] border border-white/[0.08] p-3 shadow-[0_32px_80px_rgba(0,0,0,0.28)]">
            {/* Barra de janela — faz a imagem ler como o produto */}
            <div className="flex items-center gap-3 px-1.5 pt-0.5 pb-3">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              </div>
              <div className="flex-1 flex justify-center">
                <span className="font-ui text-[11px] text-white/35 rounded-full bg-white/[0.04] px-3 py-1">
                  axios.tec.br/dashboard
                </span>
              </div>
              <div className="w-[42px] shrink-0" aria-hidden="true" />
            </div>
            <Image
              src="/assets/images/imagem-dashboard-lp.png"
              alt="Dashboard do Axios"
              width={915}
              height={843}
              priority
              unoptimized
              className="w-full h-auto rounded-b-[10px]"
            />
          </div>
        </div>
      </section>

      {/* ── Divisor ─────────────────────────────────────────────── */}
      <div className="border-t border-border" />

      {/* ── Features — fundo cinza ──────────────────────────────── */}
      <section className="bg-surface-muted py-24 px-6 overflow-hidden">
        <div className="max-w-[1600px] mx-auto">
          <Reveal direction="up" className="mb-16">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
              <span className="font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Os módulos
              </span>
            </div>
            <h2 className="text-display-secondary text-ink max-w-[520px]">
              Quatro módulos.<br />Um fluxo.
            </h2>
            <p className="text-body text-ink-muted mt-4 max-w-[460px]">
              Cada módulo cobre uma etapa do ciclo financeiro. Juntos, trocam planilhas, e-mails e conferência manual por um fluxo auditável de ponta a ponta.
            </p>
          </Reveal>

          <div className="flex flex-col gap-16 lg:gap-24 max-w-[1180px] mx-auto">
            {FEATURES.map((f, i) => {
              const left = i % 2 === 0;
              return (
                <div key={f.title} className="lg:grid lg:grid-cols-2 lg:gap-14 items-center">
                  {/* Card enxuto — ícone, número, título e resumo */}
                  <Reveal direction={left ? "left" : "right"} className={left ? "" : "lg:order-2"}>
                    <div className="group flex items-start gap-5 bg-white rounded-[24px] border border-border p-7 sm:p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_16px_40px_rgba(10,11,13,0.10)]">
                      <div className="shrink-0 w-12 h-12 rounded-[16px] bg-brand/[0.07] flex items-center justify-center text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                        {f.icon}
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-ui text-[13px] font-semibold tabular-nums text-brand">
                            0{i + 1}
                          </span>
                          <span className="h-px w-6 bg-brand/30" />
                        </div>
                        <h3 className="text-card-title text-ink">{f.title}</h3>
                        <p className="text-body-sm text-ink-muted">{f.resumo}</p>
                      </div>
                    </div>
                  </Reveal>

                  {/* Vantagens — preenchem a lacuna do lado oposto */}
                  <Reveal
                    direction={left ? "right" : "left"}
                    className={`mt-7 lg:mt-0 ${left ? "" : "lg:order-1"}`}
                  >
                    <ul className="flex flex-col gap-3.5 lg:px-2">
                      {f.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-3">
                          <CheckCircle size={18} weight="fill" className="text-brand mt-0.5 shrink-0" />
                          <span className="text-body-sm text-ink-muted">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Bloco dark — Exportação ─────────────────────────────── */}
      <section className="bg-[#0a0b0d] py-24 px-6">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row items-center gap-14">

          {/* Texto */}
          <div className="flex-1 flex flex-col gap-6 lg:max-w-[480px]">
            <h2 className="text-display-secondary text-white">
              Do Axios para o seu ERP em segundos.
            </h2>
            <p className="text-body text-white/60">
              Selecione os lotes aprovados, escolha o template do seu ERP e baixe o arquivo pronto. Sem reformatação, sem copiar e colar.
            </p>
            <a href="#demo">
              <Button variant="brand">Solicitar demonstração</Button>
            </a>
          </div>

          {/* Visual de exportação */}
          <div className="flex-1 w-full lg:max-w-[480px]">
            <div className="rounded-[20px] border border-white/[0.08] bg-[#111318] p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-caption text-white/70">Fila de exportação</span>
                <span className="text-small text-white/30">4 lotes selecionados</span>
              </div>
              <div className="flex flex-col gap-2 mb-5">
                {[
                  { id: "#RDC-0041", nome: "Projeto Alpha", erp: "Sienge", valor: "R$ 12.400" },
                  { id: "#RDC-0042", nome: "Equipe Comercial", erp: "Protheus", valor: "R$ 8.200" },
                  { id: "#RCM-0018", nome: "Centro de Custo 07", erp: "Sienge", valor: "R$ 3.600" },
                ].map((l) => (
                  <div key={l.id} className="flex items-center gap-3 bg-white/[0.04] rounded-[10px] px-3.5 py-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                    <span className="text-small text-white/40 w-20 shrink-0">{l.id}</span>
                    <span className="text-small text-white/70 flex-1">{l.nome}</span>
                    <span className="text-small text-white/40 w-16 text-right">{l.erp}</span>
                    <span className="text-small text-white/80 w-20 text-right">{l.valor}</span>
                  </div>
                ))}
              </div>
              <Button variant="brand" fullWidth>
                <FileArrowDown size={16} weight="bold" className="inline mr-2" />
                Exportar selecionados
              </Button>
            </div>
          </div>

        </div>
      </section>

      {/* ── Lead Capture ────────────────────────────────────────── */}
      <section id="demo" className="bg-white py-24 px-6">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">

          {/* Copy */}
          <div className="flex-1 flex flex-col gap-5 lg:max-w-[460px] lg:sticky lg:top-24">
            <h2 className="text-display-secondary text-ink">
              Veja o Axios em ação.
            </h2>
            <p className="text-body text-ink-muted">
              Preencha o formulário. Nossa equipe entrará em contato para mostrar como o Axios se encaixa na gestão da sua empresa.
            </p>
            <ul className="flex flex-col gap-3 mt-2">
              {[
                "Demonstração personalizada para a sua operação",
                "Sem contratos de longo prazo",
                "Onboarding guiado pela nossa equipe",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-body-sm text-ink-muted">
                  <CheckCircle size={18} weight="fill" className="text-brand mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Formulário */}
          <div className="flex-1 w-full">
            {leadSent ? (
              <div className="flex flex-col items-center gap-5 py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-brand/[0.07] flex items-center justify-center text-brand">
                  <CheckCircle size={36} weight="bold" />
                </div>
                <h3 className="text-section-heading text-ink">Solicitação enviada!</h3>
                <p className="text-body-sm text-ink-muted">Nossa equipe entrará em contato em breve.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputPill
                    label="Nome completo"
                    icon={<User size={17} weight="bold" />}
                    placeholder="Seu nome"
                    error={errors.nome?.message}
                    {...register("nome")}
                  />
                  <InputPill
                    label="E-mail corporativo"
                    icon={<Envelope size={17} weight="bold" />}
                    placeholder="email@empresa.com.br"
                    type="email"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                  <InputPill
                    label="Empresa"
                    icon={<Buildings size={17} weight="bold" />}
                    placeholder="Nome da empresa"
                    error={errors.empresa?.message}
                    {...register("empresa")}
                  />
                  <InputPill
                    label="Volume de operações mensais"
                    placeholder="Ex: 10 operações/mês"
                    error={errors.volume_obras_mensais?.message}
                    {...register("volume_obras_mensais")}
                  />
                </div>

                {errors.root && (
                  <p className="text-small text-red-500">{errors.root.message}</p>
                )}

                <div className="mt-2">
                  <Button
                    type="submit"
                    variant="brand"
                    size="sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Solicitar demonstração"}
                  </Button>
                </div>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-[#0a0b0d] border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-ui text-[15px] font-semibold text-white/60 tracking-tight">Axios</span>
          <p className="text-body-sm text-white/25">© 2025 Axios. Todos os direitos reservados.</p>
        </div>
      </footer>

    </div>
  );
}
