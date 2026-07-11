"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/ui/Input";
import BadgeAtivo from "@/ui/BadgeAtivo";
import ModalForm from "@/ui/ModalForm";
import { useConfigs } from "@/contexts/ConfigContext";
import {
  buildContaBancariaFormSchema,
  type ContaBancaria,
  type ContaBancariaFormData,
} from "../conta-bancaria.types";

interface Props {
  contaBancaria?: ContaBancaria;
  onSalvar: (dados: ContaBancariaFormData) => Promise<void>;
  onCancelar: () => void;
}

export default function FormContaBancaria({ contaBancaria, onSalvar, onCancelar }: Props) {
  const { isHabilitada } = useConfigs();
  const codigoErpObrigatorio = isHabilitada("obrigatorio_codigo_erp");
  const schema = useMemo(
    () => buildContaBancariaFormSchema(codigoErpObrigatorio),
    [codigoErpObrigatorio],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContaBancariaFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      descricao:   contaBancaria?.descricao ?? "",
      codigo_erp:  contaBancaria?.codigo_erp ?? "",
      ativo:       contaBancaria?.ativo ?? true,
    },
  });

  useEffect(() => {
    reset({
      descricao:   contaBancaria?.descricao ?? "",
      codigo_erp:  contaBancaria?.codigo_erp ?? "",
      ativo:       contaBancaria?.ativo ?? true,
    });
  }, [contaBancaria, reset]);

  const ativo = watch("ativo");

  return (
    <ModalForm
      titulo={contaBancaria ? "Editar Conta Bancária" : "Nova Conta Bancária"}
      onCancelar={onCancelar}
      onSubmit={handleSubmit(onSalvar)}
      submitting={isSubmitting}
    >
      <Input
        label="Descrição"
        placeholder="Ex: Banco do Brasil — Conta Corrente"
        error={errors.descricao?.message}
        {...register("descricao")}
      />

      <Input
        label="Código no ERP"
        placeholder="ID da conta no ERP de destino"
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
