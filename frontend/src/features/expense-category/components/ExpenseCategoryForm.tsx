"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/ui/Input";
import BadgeAtivo from "@/ui/BadgeAtivo";
import ModalForm from "@/ui/ModalForm";
import { useConfigs } from "@/contexts/ConfigContext";
import {
  buildCategoriaDespesaFormSchema,
  type CategoriaDespesa,
  type CategoriaDespesaFormData,
} from "../categoria-despesa.types";

interface Props {
  categoriaDespesa?: CategoriaDespesa;
  onSalvar: (dados: CategoriaDespesaFormData) => Promise<void>;
  onCancelar: () => void;
}

export default function FormCategoriaDespesa({ categoriaDespesa, onSalvar, onCancelar }: Props) {
  const { isHabilitada } = useConfigs();
  const codigoErpObrigatorio = isHabilitada("obrigatorio_codigo_erp");
  const schema = useMemo(
    () => buildCategoriaDespesaFormSchema(codigoErpObrigatorio),
    [codigoErpObrigatorio],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoriaDespesaFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      descricao:   categoriaDespesa?.descricao ?? "",
      codigo_erp:  categoriaDespesa?.codigo_erp ?? "",
      ativo:       categoriaDespesa?.ativo ?? true,
    },
  });

  useEffect(() => {
    reset({
      descricao:   categoriaDespesa?.descricao ?? "",
      codigo_erp:  categoriaDespesa?.codigo_erp ?? "",
      ativo:       categoriaDespesa?.ativo ?? true,
    });
  }, [categoriaDespesa, reset]);

  const ativo = watch("ativo");

  return (
    <ModalForm
      titulo={categoriaDespesa ? "Editar Categoria" : "Nova Categoria"}
      onCancelar={onCancelar}
      onSubmit={handleSubmit(onSalvar)}
      submitting={isSubmitting}
    >
      <Input
        label="Descrição"
        placeholder="Ex: Alimentação"
        error={errors.descricao?.message}
        {...register("descricao")}
      />

      <Input
        label="Código no ERP"
        placeholder="Código usado na exportação"
        error={errors.codigo_erp?.message}
        {...register("codigo_erp")}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-caption font-semibold text-app-text-muted">Status</span>
        <button
          type="button"
          onClick={() => setValue("ativo", !ativo)}
          className="w-fit cursor-pointer transition-opacity hover:opacity-80"
        >
          <BadgeAtivo ativo={ativo} />
        </button>
      </div>
    </ModalForm>
  );
}
