"use client";

import { Controller } from "react-hook-form";
import type {
  Control,
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import { Trash } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import Input from "@/ui/Input";
import InputMonetario from "@/ui/MoneyInput";
import DatePicker from "@/ui/DatePicker";
import Combobox from "@/ui/Combobox";
import LocationField from "@/features/geolocation/components/LocationField";
import SupplierSection from "@/features/supplier/components/SupplierSection";
import ExpenseItemAttachments from "./ExpenseItemAttachments";
import type {
  AnexoCaixa,
  StoreExpenseReportWithDespesasFormData,
} from "../../expense-report.types";

type Option = { value: string; label: string };

interface Props {
  idx: number;
  control: Control<StoreExpenseReportWithDespesasFormData>;
  register: UseFormRegister<StoreExpenseReportWithDespesasFormData>;
  watch: UseFormWatch<StoreExpenseReportWithDespesasFormData>;
  setValue: UseFormSetValue<StoreExpenseReportWithDespesasFormData>;
  errors: FieldErrors<StoreExpenseReportWithDespesasFormData>;
  costCenterOptions: Option[];
  categoryOptions: Option[];
  geolocationEnabled: boolean;
  files: File[];
  existingAttachments: AnexoCaixa[];
  onRemove: () => void;
  onAddFile: (file: File) => void;
  onRemoveFile: (fileIdx: number) => void;
}

export default function ExpenseItemRow({
  idx,
  control,
  register,
  watch,
  setValue,
  errors,
  costCenterOptions,
  categoryOptions,
  geolocationEnabled,
  files,
  existingAttachments,
  onRemove,
  onAddFile,
  onRemoveFile,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      transition={{ duration: 0.18 }}
      className="rounded-xl border border-app-border-subtle bg-app-surface-raised/30 p-4 sm:p-5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-caption font-semibold text-app-text-muted">
          Item {idx + 1}
        </p>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full p-1 text-app-text-subtle hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Controller
          name={`items.${idx}.expense_date`}
          control={control}
          render={({ field: f }) => (
            <DatePicker
              size="sm"
              label="Date"
              value={f.value ?? ""}
              onChange={f.onChange}
              onBlur={f.onBlur}
              error={errors.items?.[idx]?.expense_date?.message}
            />
          )}
        />
        <Controller
          name={`items.${idx}.amount`}
          control={control}
          render={({ field: f }) => (
            <InputMonetario
              label="Amount"
              value={f.value ?? ""}
              onChange={f.onChange}
              onBlur={f.onBlur}
              error={errors.items?.[idx]?.amount?.message}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-caption font-semibold text-app-text-muted">
            Category
          </label>
          <Controller
            name={`items.${idx}.expense_category_id`}
            control={control}
            render={({ field: f }) => (
              <Combobox
                options={categoryOptions}
                value={f.value ?? ""}
                onChange={f.onChange}
                placeholder="Select…"
                emptyMessage="No categories."
                className="w-full"
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-caption font-semibold text-app-text-muted">
            Cost Center
          </label>
          <Controller
            name={`items.${idx}.cost_center_id`}
            control={control}
            render={({ field: f }) => (
              <Combobox
                options={costCenterOptions}
                value={f.value}
                onChange={f.onChange}
                placeholder="Select…"
                emptyMessage="No cost centers."
                className="w-full"
              />
            )}
          />
          {errors.items?.[idx]?.cost_center_id && (
            <p className="mt-0.5 text-small text-red-600">
              {errors.items[idx]?.cost_center_id?.message}
            </p>
          )}
        </div>
      </div>

      <Input
        label="Description"
        placeholder="Describe the item"
        error={errors.items?.[idx]?.description?.message}
        {...register(`items.${idx}.description`)}
      />

      <SupplierSection
        idSupplier={watch(`items.${idx}.supplier_id`) ?? ""}
        descricaoSupplier={watch(`items.${idx}.description_supplier`) ?? ""}
        cpfCnpjSupplier={watch(`items.${idx}.supplier_tax_id`) ?? ""}
        onChange={(campos) => {
          setValue(`items.${idx}.supplier_id`, campos.supplier_id, { shouldDirty: true });
          setValue(`items.${idx}.description_supplier`, campos.descricao_supplier, { shouldDirty: true });
          setValue(`items.${idx}.supplier_tax_id`, campos.cpf_cnpj_supplier, { shouldDirty: true });
        }}
      />

      {geolocationEnabled && (
        <Controller
          name={`items.${idx}.latitude`}
          control={control}
          render={() => {
            const lat = watch(`items.${idx}.latitude`);
            const lon = watch(`items.${idx}.longitude`);
            const end = watch(`items.${idx}.address`);
            const value =
              lat != null && lon != null
                ? { latitude: Number(lat), longitude: Number(lon), address: end ?? null }
                : null;
            return (
              <LocationField
                label="Item location"
                valor={value}
                onChange={(loc) => {
                  setValue(`items.${idx}.latitude`,  loc?.latitude  ?? null, { shouldDirty: true });
                  setValue(`items.${idx}.longitude`, loc?.longitude ?? null, { shouldDirty: true });
                  setValue(`items.${idx}.address`,  loc?.address  ?? null, { shouldDirty: true });
                }}
              />
            );
          }}
        />
      )}

      <ExpenseItemAttachments
        existingAttachments={existingAttachments}
        files={files}
        onAddFile={onAddFile}
        onRemoveFile={onRemoveFile}
      />
    </motion.div>
  );
}
