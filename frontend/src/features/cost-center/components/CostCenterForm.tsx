"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/ui/Input";
import ActiveBadge from "@/ui/ActiveBadge";
import ModalForm from "@/ui/ModalForm";
import { useSettings } from "@/contexts/SettingContext";
import { buildCostCenterFormSchema, type CostCenter, type CostCenterFormData } from "../cost-center.types";

interface Props {
  costCenter?: CostCenter;
  onSave: (data: CostCenterFormData) => Promise<void>;
  onCancel: () => void;
}

export default function CostCenterForm({ costCenter, onSave, onCancel }: Props) {
  const { isEnabled } = useSettings();
  const erpCodeRequired = isEnabled("require_erp_code");
  const schema = useMemo(
    () => buildCostCenterFormSchema(erpCodeRequired),
    [erpCodeRequired],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CostCenterFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: costCenter?.description ?? "",
      erp_code:    costCenter?.erp_code ?? "",
      active:      costCenter?.active ?? true,
    },
  });

  useEffect(() => {
    reset({
      description: costCenter?.description ?? "",
      erp_code:    costCenter?.erp_code ?? "",
      active:      costCenter?.active ?? true,
    });
  }, [costCenter, reset]);

  const active = watch("active");

  return (
    <ModalForm
      titulo={costCenter ? "Edit Cost Center" : "New Cost Center"}
      onCancelar={onCancel}
      onSubmit={handleSubmit(onSave)}
      submitting={isSubmitting}
    >
      <Input
        label="Description"
        placeholder="e.g. South Projects"
        error={errors.description?.message}
        {...register("description")}
      />

      <Input
        label="ERP Code"
        placeholder="Code used in the export"
        error={errors.erp_code?.message}
        {...register("erp_code")}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-caption font-semibold text-app-text-muted">Status</span>
        <button
          type="button"
          onClick={() => setValue("active", !active)}
          className="w-fit cursor-pointer transition-opacity hover:opacity-80"
        >
          <ActiveBadge ativo={active} />
        </button>
      </div>
    </ModalForm>
  );
}
