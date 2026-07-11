"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Buildings, Envelope, Lock, Eye, EyeSlash } from "@phosphor-icons/react";
import Button from "@/ui/Button";
import Input from "@/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { loginFormSchema, type LoginFormData } from "@/features/auth/auth.types";
import RecuperarSenhaCard from "@/features/auth/components/RecuperarSenhaCard";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const [step, setStep] = useState<"login" | "recovery">("login");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { empresa: "", email: "", senha: "", remember_me: false },
  });

  async function onSubmit({ empresa, email, senha, remember_me }: LoginFormData) {
    try {
      await login(empresa, email, senha, remember_me);
      router.push("/dashboard");
    } catch (err) {
      setError("root", {
        message: err instanceof Error ? err.message : "Erro ao entrar. Tente novamente.",
      });
    }
  }

  return (
    <main className="min-h-svh flex">
      {/* Left panel */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center bg-surface-muted px-6 py-12">
        <div className="w-full max-w-[420px] overflow-hidden py-8 -my-8">
          <div
            className={`flex w-[200%] transition-transform duration-300 ease-in-out ${step === "recovery" ? "-translate-x-1/2" : ""
              }`}
          >
            {/* Login side */}
            <div className="w-1/2 min-w-0 flex flex-col gap-8 bg-surface-muted">
              <div className="text-center">
                <h1 className="text-display-third text-ink lg:hidden">Axios</h1>
                <h2 className="text-section-heading text-ink hidden lg:block">Entrar</h2>
                <p className="text-body-sm text-ink-muted mt-1">Acesse sua conta para continuar</p>
              </div>

              <div className="bg-surface rounded-[16px] shadow-[0_2px_24px_rgba(0,0,0,0.07)] p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                  <Input
                    label="Empresa"
                    icon={<Buildings size={20} weight="bold" />}
                    placeholder="Nome da empresa"
                    autoComplete="organization"
                    error={errors.empresa?.message}
                    {...register("empresa")}
                  />

                  <Input
                    label="E-mail"
                    icon={<Envelope size={20} weight="bold" />}
                    placeholder="Seu e-mail"
                    autoComplete="username"
                    error={errors.email?.message}
                    {...register("email")}
                  />

                  <Input
                    label="Senha"
                    icon={<Lock size={20} weight="bold" />}
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    autoComplete="current-password"
                    error={errors.senha?.message}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        tabIndex={-1}
                        className="text-ink-muted hover:text-ink transition-colors"
                      >
                        {showPassword ? (
                          <EyeSlash size={20} weight="bold" />
                        ) : (
                          <Eye size={20} weight="bold" />
                        )}
                      </button>
                    }
                    {...register("senha")}
                  />

                  <div className="flex items-center justify-between -mt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded accent-brand cursor-pointer"
                        {...register("remember_me")}
                      />
                      <span className="text-caption font-normal text-ink-muted">Lembrar-me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep("recovery")}
                      className="text-caption text-brand-link hover:text-brand transition-colors cursor-pointer"
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>

                  {errors.root && (
                    <p className="text-small text-red-500 text-center -mt-1">{errors.root.message}</p>
                  )}

                  <Button type="submit" variant="dark" fullWidth disabled={isSubmitting}>
                    {isSubmitting ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </div>
            </div>{/* fim login side */}

            {/* Recovery side */}
            <div className="w-1/2 min-w-0 bg-surface-muted">
              <RecuperarSenhaCard onVoltar={() => setStep("login")} />
            </div>
          </div>{/* fim slide wrapper */}
        </div>
      </div>

      {/* Right panel */}
      <div className="hidden lg:flex lg:w-1/2 panel-dark flex-col justify-between px-14 py-12">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white/40" />
          <p className="text-small text-white/40 uppercase tracking-widest">Axios</p>
        </div>

        <div className="flex flex-col gap-5">
          <h2 className="text-display-hero text-white">
            Controle total
            <br />
            sobre as despesas
            <br />
            da sua equipe.
          </h2>
          <p className="text-body text-white/80 max-w-[400px] font-light">
            Do lançamento ao ERP, sem fricção e sem erros. Adiantamentos, reembolsos e prestações em um único lugar.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="h-px w-5 bg-white/20 shrink-0" />
            <span className="text-small text-white/35 tracking-wider uppercase">
              Integração nativa com
            </span>
            <div className="flex items-center gap-2">
              <span className="text-small font-semibold text-white/50 border border-white/[0.12] rounded-md px-2 py-0.5">
                Sienge
              </span>
              <span className="text-small font-semibold text-white/50 border border-white/[0.12] rounded-md px-2 py-0.5">
                Protheus
              </span>
            </div>
          </div>
        </div>

        <p className="text-small text-white/25">© 2026 Axios</p>
      </div>
    </main>
  );
}
