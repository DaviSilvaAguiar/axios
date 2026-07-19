"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Buildings, Envelope, ArrowLeft } from "@phosphor-icons/react";
import { toast } from "@/lib/toast";
import Button from "@/ui/Button";
import Input from "@/ui/Input";
import {
  passwordRecoveryFormSchema,
  type PasswordRecoveryFormData,
} from "@/features/auth/auth.types";

interface PasswordRecoveryCardProps {
  onBack: () => void;
}

const WHATSAPP_NUMBER = "554896721292";

export default function PasswordRecoveryCard({ onBack }: PasswordRecoveryCardProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordRecoveryFormData>({
    resolver: zodResolver(passwordRecoveryFormSchema),
  });

  async function onSubmit({ company, email }: PasswordRecoveryFormData) {
    const msg = `Hello! I need to reset my password in *Axios*.\n\n*Company:* _${company}_\n*Email:* ${email}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("WhatsApp opened! Send the message and wait for our reply.");
    reset();
    onBack();
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-display-third text-ink lg:hidden">Axios</h1>
        <h2 className="text-section-heading text-ink hidden lg:block">Password recovery</h2>
        <p className="text-body-sm text-ink-muted mt-1">Enter your details to continue</p>
      </div>

      <div className="bg-surface rounded-[16px] shadow-[0_1px_8px_rgba(0,0,0,0.05)] p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <button
            type="button"
            onClick={() => { reset(); onBack(); }}
            className="flex items-center gap-1.5 text-ink-muted hover:text-ink transition-colors -mt-1 w-fit cursor-pointer"
          >
            <ArrowLeft size={16} weight="bold" />
            <span className="text-caption font-normal">Back</span>
          </button>

          <Input
            label="Company"
            icon={<Buildings size={20} weight="bold" />}
            placeholder="Company name"
            autoComplete="organization"
            error={errors.company?.message}
            {...register("company")}
          />

          <Input
            label="Email"
            icon={<Envelope size={20} weight="bold" />}
            placeholder="Your email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <Button type="submit" variant="dark" fullWidth disabled={isSubmitting}>
            Send via WhatsApp
          </Button>
        </form>
      </div>
    </div>
  );
}
