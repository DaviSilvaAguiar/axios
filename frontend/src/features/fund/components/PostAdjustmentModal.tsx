"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "@phosphor-icons/react";
import Modal from "@/ui/Modal";
import Button from "@/ui/Button";
import Input from "@/ui/Input";
import InputMonetario from "@/ui/InputMonetario";
import DatePicker from "@/ui/DatePicker";
import Combobox from "@/ui/Combobox";
import { toast } from "@/lib/toast";
import {
  lancarAjusteFormSchema,
  SUBTIPO_AJUSTE_NEGATIVO,
  SUBTIPO_AJUSTE_POSITIVO,
  SUBTIPO_DEVOLUCAO,
  type LancarAjusteFormData,
} from "../caixa-conta.types";

const OPCOES_SUBTIPO = [
  { value: String(SUBTIPO_DEVOLUCAO), label: "Devolução de Saldo" },
  { value: String(SUBTIPO_AJUSTE_POSITIVO), label: "Ajuste Positivo" },
  { value: String(SUBTIPO_AJUSTE_NEGATIVO), label: "Ajuste Negativo" },
];

interface Props {
  onSalvar: (dados: LancarAjusteFormData) => Promise<void>;
  onFechar: () => void;
}

export default function ModalLancarAjuste({ onSalvar, onFechar }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<LancarAjusteFormData>({
    resolver: zodResolver(lancarAjusteFormSchema),
    defaultValues: {
      subtipo: String(SUBTIPO_DEVOLUCAO),
      valor: "",
      data_transacao: new Date().toISOString().slice(0, 10),
      motivo: "",
    },
  });

  const subtipo = watch("subtipo");
  const valor = watch("valor");
  const data = watch("data_transacao");

  async function onSubmit(dados: LancarAjusteFormData) {
    try {
      await onSalvar(dados);
    } catch {
      toast.error("Não foi possível lançar o ajuste.");
    }
  }

  return (
    <Modal open onClose={onFechar} className="max-w-md" isDirty={isDirty}>
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5">
        <div className="mb-5 flex items-start justify-between">
          <h1 className="text-feature-title text-app-text">Lançar Ajuste</h1>
          <button
            type="button"
            onClick={onFechar}
            className="rounded-full p-2 text-app-text-muted hover:bg-app-hover"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-caption font-semibold text-app-text-muted">Tipo de Ajuste</label>
            <Combobox
              options={OPCOES_SUBTIPO}
              value={subtipo}
              onChange={(v) => setValue("subtipo", v, { shouldValidate: true, shouldDirty: true })}
              placeholder="Selecione"
            />
            {errors.subtipo && (
              <p className="text-small text-red-600">{errors.subtipo.message}</p>
            )}
          </div>

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
            label="Motivo"
            placeholder='Ex.: "Devolução do saldo restante em 01/12"'
            error={errors.motivo?.message}
            {...register("motivo")}
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
