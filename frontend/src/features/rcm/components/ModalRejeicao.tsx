"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/ui/Button";

const schema = z.object({
  motivo_rejeicao: z.string().min(1, "Informe o motivo da rejeição"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onConfirmar: (motivo: string) => Promise<void> | void;
  onCancelar: () => void;
}

export default function ModalRejeicao({ onConfirmar, onCancelar }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    await onConfirmar(data.motivo_rejeicao);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 8 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="w-full max-w-sm rounded-2xl bg-app-surface p-6 shadow-xl"
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-feature-title text-app-text">Rejeitar Reembolso</h2>
              <p className="mt-1 text-body-sm text-app-text-muted">
                Descreva o motivo da rejeição para o colaborador.
              </p>
            </div>
            <button
              onClick={onCancelar}
              className="ml-4 rounded-full p-1 text-app-text-muted hover:bg-app-hover"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-caption text-app-text-muted block mb-1.5">
                Motivo
              </label>
              <textarea
                {...register("motivo_rejeicao")}
                rows={4}
                placeholder="Ex: Nota fiscal ilegível, valor divergente…"
                className="w-full resize-none rounded-2xl border border-app-border bg-app-surface-raised px-4 py-3 text-body-sm text-app-text placeholder:text-app-text-subtle focus:border-brand focus:outline-none"
              />
              {errors.motivo_rejeicao && (
                <p className="mt-1 text-small text-red-600">
                  {errors.motivo_rejeicao.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="light" fullWidth onClick={onCancelar}>
                Cancelar
              </Button>
              <Button type="submit" variant="outlined" fullWidth disabled={isSubmitting}>
                {isSubmitting ? "Rejeitando…" : "Rejeitar"}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
