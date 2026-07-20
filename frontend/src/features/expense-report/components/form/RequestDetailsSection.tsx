"use client";

import { Controller } from "react-hook-form";
import type {
  Control,
  UseFormRegister,
  UseFormSetValue,
  UseFormSetError,
  UseFormClearErrors,
  FieldErrors,
} from "react-hook-form";
import { motion } from "framer-motion";
import Input from "@/ui/Input";
import DatePicker from "@/ui/DatePicker";
import Combobox from "@/ui/Combobox";
import BankDetailsSection from "./BankDetailsSection";
import type { StoreExpenseReportWithDespesasFormData } from "../../expense-report.types";

type Option = { value: string; label: string };

interface Props {
  control: Control<StoreExpenseReportWithDespesasFormData>;
  register: UseFormRegister<StoreExpenseReportWithDespesasFormData>;
  errors: FieldErrors<StoreExpenseReportWithDespesasFormData>;
  setValue: UseFormSetValue<StoreExpenseReportWithDespesasFormData>;
  setError: UseFormSetError<StoreExpenseReportWithDespesasFormData>;
  clearErrors: UseFormClearErrors<StoreExpenseReportWithDespesasFormData>;
  costCenterOptions: Option[];
  initialPixKey?: string | null;
}

export default function RequestDetailsSection({
  control,
  register,
  errors,
  setValue,
  setError,
  clearErrors,
  costCenterOptions,
  initialPixKey,
}: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.05 }}
      className="rounded-2xl border border-app-border bg-app-surface-raised/40 p-4 sm:p-5 space-y-4"
    >
      <h2 className="text-caption font-semibold text-app-text-muted uppercase tracking-wide">
        Request Details
      </h2>

      <Input
        label="Description"
        placeholder="e.g. Office supplies — April 2026"
        error={errors.description?.message}
        {...register("description")}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-caption font-semibold text-app-text-muted">
          Cost Center
        </label>
        <Controller
          name="cost_center_id"
          control={control}
          render={({ field }) => (
            <Combobox
              options={costCenterOptions}
              value={field.value ?? ""}
              onChange={field.onChange}
              placeholder="Select…"
              emptyMessage="No cost centers."
              className="w-full"
            />
          )}
        />
        {errors.cost_center_id && (
          <p className="mt-0.5 text-small text-red-600">
            {errors.cost_center_id.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Controller
          name="period_start_date"
          control={control}
          render={({ field }) => (
            <DatePicker
              size="sm"
              label="Period — Start"
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.period_start_date?.message}
            />
          )}
        />
        <Controller
          name="period_end_date"
          control={control}
          render={({ field }) => (
            <DatePicker
              size="sm"
              label="Period — End"
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.period_end_date?.message}
            />
          )}
        />
      </div>

      <BankDetailsSection
        control={control}
        errors={errors}
        setValue={setValue}
        setError={setError}
        clearErrors={clearErrors}
        initialPixKey={initialPixKey}
      />
    </motion.section>
  );
}
