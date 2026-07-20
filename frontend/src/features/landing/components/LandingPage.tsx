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
import { sendLeadApi } from "../landing.api";

const FEATURES = [
  {
    icon: <Receipt size={22} weight="bold" />,
    title: "Advances",
    summary: "Cash expense report created in the field by the provider and audited by Finance — with automatic validation.",
    bullets: [
      "NFe key (44 digits) validated directly with Sefaz",
      "CNPJ and legal name checked against ReceitaWS",
      "Side-by-side audit: data, attachment, and API responses",
      "On approval, automatically debits the provider's fund",
    ],
  },
  {
    icon: <Wallet size={22} weight="bold" />,
    title: "Fund Management",
    summary: "Providers' prepaid balances with a bank-style ledger and a trace of every cent moved.",
    bullets: [
      "One fund per user and cost center",
      "Credit by advance, debit on expense report approval",
      "Bank-style ledger with a link to the originating expense report",
      "Only closes with a zero balance — no loose ends",
    ],
  },
  {
    icon: <CurrencyDollar size={22} weight="bold" />,
    title: "Reimbursements",
    summary: "Post-paid flow for those who pay out of pocket — no bureaucracy and no touching the funds.",
    bullets: [
      "Kanban: Draft → Under Review → Approved → Scheduled → Paid",
      "Cost center defined per expense item",
      "Payment date required when scheduling",
      "In the ERP file, the supplier is the employee's code",
    ],
  },
  {
    icon: <FileArrowDown size={22} weight="bold" />,
    title: "ERP Export",
    summary: "Approved batches become a file ready for your ERP — no reformatting, no copy and paste.",
    bullets: [
      "Separate tabs for Expense Reports and Reimbursements",
      "Per-ERP templates via handlers (Sienge, Protheus, and more)",
      "Select multiple batches and download as CSV or Excel",
      "An exported batch never reverts — zero double payments",
    ],
  },
];

const HERO_TITLE = "Total control\nover your team's\nexpenses.";
const HERO_SUBTITLE =
  "From entry to ERP, frictionless and error-free. Advances, reimbursements, and expense reports in one place.";

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

const REVEAL_HIDDEN = {
  left: "opacity-0 -translate-x-10",
  right: "opacity-0 translate-x-10",
  up: "opacity-0 translate-y-12",
} as const;

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

  async function onSubmit(data: LeadFormData) {
    try {
      await sendLeadApi(data);
      setLeadSent(true);
    } catch {
      setError("root", { message: "Failed to send. Please try again." });
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

      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <span className="font-ui text-[15px] font-semibold text-ink tracking-tight">Axios</span>
          <Link href="/login">
            <Button variant="outlined" size="sm">Sign in</Button>
          </Link>
        </div>
      </header>

      <section className="max-w-[1600px] mx-auto px-6 lg:px-10 py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-14 lg:gap-10">

        <div className="lg:flex-[0.8] flex flex-col gap-8 lg:max-w-[520px]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
              <span className="font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Financial management for teams
              </span>
            </div>

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
                Get started now <ArrowRight size={16} weight="bold" className="inline ml-1" />
              </Button>
            </a>
            <Link href="/login">
              <Button variant="light">Sign in to the platform</Button>
            </Link>
          </div>

          <div
            className={`flex items-center gap-2 text-ink-muted transition-all duration-700 delay-150 ease-out ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
          >
            <PlugsConnected size={16} weight="bold" className="shrink-0" />
            <span className="font-ui text-[13px]">
              Integrates with the market&apos;s ERPs.
            </span>
          </div>

        </div>

        <div
          className={`lg:flex-[1.2] w-full transition-all duration-[900ms] ease-out ${revealed ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-[0.97]"
            }`}
        >
          <div className="rounded-[20px] bg-[#0a0b0d] border border-white/[0.08] p-3 shadow-[0_32px_80px_rgba(0,0,0,0.28)]">
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
              alt="Axios dashboard"
              width={915}
              height={843}
              priority
              unoptimized
              className="w-full h-auto rounded-b-[10px]"
            />
          </div>
        </div>
      </section>

      <div className="border-t border-border" />

      <section className="bg-surface-muted py-24 px-6 overflow-hidden">
        <div className="max-w-[1600px] mx-auto">
          <Reveal direction="up" className="mb-16">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
              <span className="font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                The modules
              </span>
            </div>
            <h2 className="text-display-secondary text-ink max-w-[520px]">
              Four modules.<br />One flow.
            </h2>
            <p className="text-body text-ink-muted mt-4 max-w-[460px]">
              Each module covers a stage of the financial cycle. Together, they replace spreadsheets, emails, and manual reconciliation with an auditable end-to-end flow.
            </p>
          </Reveal>

          <div className="flex flex-col gap-16 lg:gap-24 max-w-[1180px] mx-auto">
            {FEATURES.map((f, i) => {
              const left = i % 2 === 0;
              return (
                <div key={f.title} className="lg:grid lg:grid-cols-2 lg:gap-14 items-center">
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
                        <p className="text-body-sm text-ink-muted">{f.summary}</p>
                      </div>
                    </div>
                  </Reveal>

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

      <section className="bg-[#0a0b0d] py-24 px-6">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row items-center gap-14">

          <div className="flex-1 flex flex-col gap-6 lg:max-w-[480px]">
            <h2 className="text-display-secondary text-white">
              From Axios to your ERP in seconds.
            </h2>
            <p className="text-body text-white/60">
              Select the approved batches, choose your ERP template, and download the ready file. No reformatting, no copy and paste.
            </p>
            <a href="#demo">
              <Button variant="brand">Request a demo</Button>
            </a>
          </div>

          <div className="flex-1 w-full lg:max-w-[480px]">
            <div className="rounded-[20px] border border-white/[0.08] bg-[#111318] p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-caption text-white/70">Export queue</span>
                <span className="text-small text-white/30">4 batches selected</span>
              </div>
              <div className="flex flex-col gap-2 mb-5">
                {[
                  { id: "#EXP-0041", name: "Project Alpha", erp: "Sienge", amount: "R$ 12.400" },
                  { id: "#EXP-0042", name: "Sales Team", erp: "Protheus", amount: "R$ 8.200" },
                  { id: "#REI-0018", name: "Cost Center 07", erp: "Sienge", amount: "R$ 3.600" },
                ].map((l) => (
                  <div key={l.id} className="flex items-center gap-3 bg-white/[0.04] rounded-[10px] px-3.5 py-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                    <span className="text-small text-white/40 w-20 shrink-0">{l.id}</span>
                    <span className="text-small text-white/70 flex-1">{l.name}</span>
                    <span className="text-small text-white/40 w-16 text-right">{l.erp}</span>
                    <span className="text-small text-white/80 w-20 text-right">{l.amount}</span>
                  </div>
                ))}
              </div>
              <Button variant="brand" fullWidth>
                <FileArrowDown size={16} weight="bold" className="inline mr-2" />
                Export selected
              </Button>
            </div>
          </div>

        </div>
      </section>

      <section id="demo" className="bg-white py-24 px-6">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">

          <div className="flex-1 flex flex-col gap-5 lg:max-w-[460px] lg:sticky lg:top-24">
            <h2 className="text-display-secondary text-ink">
              See Axios in action.
            </h2>
            <p className="text-body text-ink-muted">
              Fill out the form. Our team will get in touch to show how Axios fits your company&apos;s management.
            </p>
            <ul className="flex flex-col gap-3 mt-2">
              {[
                "A demo tailored to your operation",
                "No long-term contracts",
                "Onboarding guided by our team",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-body-sm text-ink-muted">
                  <CheckCircle size={18} weight="fill" className="text-brand mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1 w-full">
            {leadSent ? (
              <div className="flex flex-col items-center gap-5 py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-brand/[0.07] flex items-center justify-center text-brand">
                  <CheckCircle size={36} weight="bold" />
                </div>
                <h3 className="text-section-heading text-ink">Request sent!</h3>
                <p className="text-body-sm text-ink-muted">Our team will get in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputPill
                    label="Full name"
                    icon={<User size={17} weight="bold" />}
                    placeholder="Your name"
                    error={errors.name?.message}
                    {...register("name")}
                  />
                  <InputPill
                    label="Work email"
                    icon={<Envelope size={17} weight="bold" />}
                    placeholder="email@company.com"
                    type="email"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                  <InputPill
                    label="Company"
                    icon={<Buildings size={17} weight="bold" />}
                    placeholder="Company name"
                    error={errors.company?.message}
                    {...register("company")}
                  />
                  <InputPill
                    label="Monthly operations volume"
                    placeholder="e.g. 10 operations/month"
                    error={errors.monthly_project_volume?.message}
                    {...register("monthly_project_volume")}
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
                    {isSubmitting ? "Sending..." : "Request a demo"}
                  </Button>
                </div>
              </form>
            )}
          </div>

        </div>
      </section>

      <footer className="bg-[#0a0b0d] border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-ui text-[15px] font-semibold text-white/60 tracking-tight">Axios</span>
          <p className="text-body-sm text-white/25">© 2025 Axios. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
