"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/ui/Button";
import DatePicker from "@/ui/DatePicker";

const schema = z.object({
  data_pagamento_programado: z.string().min(1, "Informe a data programada"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onConfirmar: (data: string) => Promise<void> | void;
  onCancelar: () => void;
}

export default function ModalAgendamento({ onConfirmar, onCancelar }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    await onConfirmar(data.data_pagamento_programado);
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
              <h2 className="text-feature-title text-app-text">Agendar Pagamento</h2>
              <p className="mt-1 text-body-sm text-app-text-muted">
                Informe a data programada para o pagamento deste reembolso.
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
            <Controller
              name="data_pagamento_programado"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Data Programada"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.data_pagamento_programado?.message}
                />
              )}
            />

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="light" fullWidth onClick={onCancelar}>
                Cancelar
              </Button>
              <Button type="submit" variant="dark" fullWidth disabled={isSubmitting}>
                {isSubmitting ? "Salvando…" : "Confirmar"}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
