"use client";

import type {
  Control,
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
  FieldArrayWithId,
} from "react-hook-form";
import { Plus, Receipt } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/ui/Button";
import EmptyState from "@/ui/EmptyState";
import ExpenseItemRow from "./ExpenseItemRow";
import type {
  AnexoCaixa,
  StoreExpenseReportWithDespesasFormData,
} from "../../expense-report.types";

type Option = { value: string; label: string };

interface Props {
  fields: FieldArrayWithId<StoreExpenseReportWithDespesasFormData, "items", "id">[];
  control: Control<StoreExpenseReportWithDespesasFormData>;
  register: UseFormRegister<StoreExpenseReportWithDespesasFormData>;
  watch: UseFormWatch<StoreExpenseReportWithDespesasFormData>;
  setValue: UseFormSetValue<StoreExpenseReportWithDespesasFormData>;
  errors: FieldErrors<StoreExpenseReportWithDespesasFormData>;
  costCenterOptions: Option[];
  categoryOptions: Option[];
  geolocationEnabled: boolean;
  itemFiles: File[][];
  existingAttachments: AnexoCaixa[][];
  onAddExpenseItem: () => void;
  onRemoveExpenseItem: (idx: number) => void;
  onAddFile: (idx: number, file: File) => void;
  onRemoveFile: (idx: number, fileIdx: number) => void;
}

export default function ExpenseItemsSection({
  fields,
  control,
  register,
  watch,
  setValue,
  errors,
  costCenterOptions,
  categoryOptions,
  geolocationEnabled,
  itemFiles,
  existingAttachments,
  onAddExpenseItem,
  onRemoveExpenseItem,
  onAddFile,
  onRemoveFile,
}: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.15 }}
      className="rounded-2xl border border-app-border bg-app-surface-raised/40 p-4 sm:p-5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-caption font-semibold text-app-text-muted uppercase tracking-wide">
          Expense Items
        </h2>
        <Button type="button" variant="light" size="sm" onClick={onAddExpenseItem}>
          <Plus size={14} /> Add
        </Button>
      </div>

      {fields.length === 0 && (
        <EmptyState
          size="sm"
          icon={Receipt}
          title="No items added"
          iconBackground
        />
      )}

      <AnimatePresence>
        {fields.map((field, idx) => (
          <ExpenseItemRow
            key={field.id}
            idx={idx}
            control={control}
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
            costCenterOptions={costCenterOptions}
            categoryOptions={categoryOptions}
            geolocationEnabled={geolocationEnabled}
            files={itemFiles[idx] ?? []}
            existingAttachments={existingAttachments[idx] ?? []}
            onRemove={() => onRemoveExpenseItem(idx)}
            onAddFile={(file) => onAddFile(idx, file)}
            onRemoveFile={(fileIdx) => onRemoveFile(idx, fileIdx)}
          />
        ))}
      </AnimatePresence>
    </motion.section>
  );
}
