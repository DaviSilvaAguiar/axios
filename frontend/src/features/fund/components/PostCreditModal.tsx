"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "@phosphor-icons/react";
import Modal from "@/ui/Modal";
import Button from "@/ui/Button";
import Input from "@/ui/Input";
import InputMonetario from "@/ui/InputMonetario";
import DatePicker from "@/ui/DatePicker";
import { toast } from "@/lib/toast";
import {
  lancarCreditoFormSchema,
  type LancarCreditoFormData,
} from "../caixa-conta.types";

interface Props {
  onSalvar: (dados: LancarCreditoFormData) => Promise<void>;
  onFechar: () => void;
}

export default function ModalLancarCredito({ onSalvar, onFechar }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<LancarCreditoFormData>({
    resolver: zodResolver(lancarCreditoFormSchema),
    defaultValues: {
      valor: "",
      data_transacao: new Date().toISOString().slice(0, 10),
      observacao: "",
    },
  });

  const valor = watch("valor");
  const data = watch("data_transacao");

  async function onSubmit(dados: LancarCreditoFormData) {
    try {
      await onSalvar(dados);
    } catch {
      toast.error("Não foi possível lançar o adiantamento.");
    }
  }

  return (
    <Modal open onClose={onFechar} className="max-w-md" isDirty={isDirty}>
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5">
        <div className="mb-5 flex items-start justify-between">
          <h1 className="text-feature-title text-app-text">Lançar Adiantamento</h1>
          <button
            type="button"
            onClick={onFechar}
            className="rounded-full p-2 text-app-text-muted hover:bg-app-hover"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <InputMonetario
            label="Valor"
            value={valor}
            onChange={(v) => setValue("valor", v, { shouldValidate: true, shouldDirty: true })}
            error={errors.valor?.message}
          />

          <DatePicker
            label="Data"
            value={data}
            onChange={(v) => setValue("data_transacao", v, { shouldValidate: true, shouldDirty: true })}
            error={errors.data_transacao?.message}
          />

          <Input
            label="Observação (opcional)"
            placeholder='Ex.: "PIX Ref. Semana 1"'
            error={errors.observacao?.message}
            {...register("observacao")}
          />
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="light" fullWidth onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="submit" variant="dark" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "Salvando…" : "Confirmar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
