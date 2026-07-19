"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/ui/Input";
import ActiveBadge from "@/ui/ActiveBadge";
import ModalForm from "@/ui/ModalForm";
import { useSettings } from "@/contexts/SettingContext";
import {
  buildExpenseCategoryFormSchema,
  type ExpenseCategory,
  type ExpenseCategoryFormData,
} from "../expense-category.types";

interface Props {
  expenseCategory?: ExpenseCategory;
  onSave: (data: ExpenseCategoryFormData) => Promise<void>;
  onCancel: () => void;
}

export default function ExpenseCategoryForm({ expenseCategory, onSave, onCancel }: Props) {
  const { isEnabled } = useSettings();
  const erpCodeRequired = isEnabled("require_erp_code");
  const schema = useMemo(
    () => buildExpenseCategoryFormSchema(erpCodeRequired),
    [erpCodeRequired],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseCategoryFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: expenseCategory?.description ?? "",
      erp_code:    expenseCategory?.erp_code ?? "",
      active:      expenseCategory?.active ?? true,
    },
  });

  useEffect(() => {
    reset({
      description: expenseCategory?.description ?? "",
      erp_code:    expenseCategory?.erp_code ?? "",
      active:      expenseCategory?.active ?? true,
    });
  }, [expenseCategory, reset]);

  const active = watch("active");

  return (
    <ModalForm
      titulo={expenseCategory ? "Edit Category" : "New Category"}
      onCancelar={onCancel}
      onSubmit={handleSubmit(onSave)}
      submitting={isSubmitting}
    >
      <Input
        label="Description"
        placeholder="e.g. Meals"
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
