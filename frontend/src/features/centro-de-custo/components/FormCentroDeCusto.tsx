"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/ui/Input";
import BadgeAtivo from "@/ui/BadgeAtivo";
import ModalForm from "@/ui/ModalForm";
import { useConfigs } from "@/contexts/ConfigContext";
import { buildCentroDeCustoFormSchema, type CentroDeCusto, type CentroDeCustoFormData } from "../centro-de-custo.types";

interface Props {
  centroDeCusto?: CentroDeCusto;
  onSalvar: (dados: CentroDeCustoFormData) => Promise<void>;
  onCancelar: () => void;
}

export default function FormCentroDeCusto({ centroDeCusto, onSalvar, onCancelar }: Props) {
  const { isHabilitada } = useConfigs();
  const codigoErpObrigatorio = isHabilitada("obrigatorio_codigo_erp");
  const schema = useMemo(
    () => buildCentroDeCustoFormSchema(codigoErpObrigatorio),
    [codigoErpObrigatorio],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CentroDeCustoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      descricao:     centroDeCusto?.descricao ?? "",
      codigo_cc_erp: centroDeCusto?.codigo_cc_erp ?? "",
      ativo:         centroDeCusto?.ativo ?? true,
    },
  });

  useEffect(() => {
    reset({
      descricao:     centroDeCusto?.descricao ?? "",
      codigo_cc_erp: centroDeCusto?.codigo_cc_erp ?? "",
      ativo:         centroDeCusto?.ativo ?? true,
    });
  }, [centroDeCusto, reset]);

  const ativo = watch("ativo");

  return (
    <ModalForm
      titulo={centroDeCusto ? "Editar Centro de Custo" : "Novo Centro de Custo"}
      onCancelar={onCancelar}
      onSubmit={handleSubmit(onSalvar)}
      submitting={isSubmitting}
    >
      <Input
        label="Descrição"
        placeholder="Ex: Obras Sul"
        error={errors.descricao?.message}
        {...register("descricao")}
      />

      <Input
        label="Código no ERP"
        placeholder="Código usado na exportação"
        error={errors.codigo_cc_erp?.message}
        {...register("codigo_cc_erp")}
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
