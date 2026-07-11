"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Buildings, Envelope, ArrowLeft } from "@phosphor-icons/react";
import { toast } from "@/lib/toast";
import Button from "@/ui/Button";
import Input from "@/ui/Input";
import {
  recuperarSenhaFormSchema,
  type RecuperarSenhaFormData,
} from "@/features/auth/auth.types";

interface RecuperarSenhaCardProps {
  onVoltar: () => void;
}

const WHATSAPP_NUMBER = "554896721292";

export default function RecuperarSenhaCard({ onVoltar }: RecuperarSenhaCardProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecuperarSenhaFormData>({
    resolver: zodResolver(recuperarSenhaFormSchema),
  });

  async function onSubmit({ empresa, email }: RecuperarSenhaFormData) {
    const msg = `Olá! Preciso trocar minha senha no *Axios*.\n\n*Empresa:* _${empresa}_\n*E-mail:* ${email}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("WhatsApp aberto! Envie a mensagem e aguarde o retorno.");
    reset();
    onVoltar();
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-display-third text-ink lg:hidden">Axios</h1>
        <h2 className="text-section-heading text-ink hidden lg:block">Recuperar senha</h2>
        <p className="text-body-sm text-ink-muted mt-1">Informe seus dados para continuar</p>
      </div>

      <div className="bg-surface rounded-[16px] shadow-[0_1px_8px_rgba(0,0,0,0.05)] p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <button
            type="button"
            onClick={() => { reset(); onVoltar(); }}
            className="flex items-center gap-1.5 text-ink-muted hover:text-ink transition-colors -mt-1 w-fit cursor-pointer"
          >
            <ArrowLeft size={16} weight="bold" />
            <span className="text-caption font-normal">Voltar</span>
          </button>

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
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <Button type="submit" variant="dark" fullWidth disabled={isSubmitting}>
            Enviar pelo WhatsApp
          </Button>
        </form>
      </div>
    </div>
  );
}
