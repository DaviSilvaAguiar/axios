"use client";

import {
  type Control,
  type UseFormRegister,
  type UseFormWatch,
  type UseFormSetValue,
  type FieldErrors,
  type FieldArrayWithId,
} from "react-hook-form";
import { Plus, Receipt } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/ui/Button";
import EmptyState from "@/ui/EmptyState";
import ExpenseItemCard from "./ExpenseItemCard";
import {
  type Reimbursement,
  type StoreReimbursementWithDespesasFormData,
} from "../../reimbursement.types";
import type { AttachmentToAdd, AttachmentToDelete } from "../FormReimbursement";

type FormData = StoreReimbursementWithDespesasFormData;

type Option = { value: string; label: string };

interface Props {
  fields: FieldArrayWithId<FormData, "items", "id">[];
  control: Control<FormData>;
  register: UseFormRegister<FormData>;
  watch: UseFormWatch<FormData>;
  setValue: UseFormSetValue<FormData>;
  errors: FieldErrors<FormData>;
  categoryOptions: Option[];
  costCenterOptions: Option[];
  geolocationEnabled: boolean;
  initialReimbursement?: Reimbursement;
  attachmentsToAdd: AttachmentToAdd[];
  attachmentsToDelete: AttachmentToDelete[];
  onAddItem: () => void;
  onRemoveItem: (idx: number) => void;
  markDeleteAttachment: (itemId: number, attachmentId: number) => void;
  undoDeleteAttachment: (attachmentId: number) => void;
  markAddAttachment: (itemId: number, file: File) => void;
  cancelAddAttachment: (itemId: number, file: File) => void;
}

export default function ExpenseItemsSection({
  fields,
  control,
  register,
  watch,
  setValue,
  errors,
  categoryOptions,
  costCenterOptions,
  geolocationEnabled,
  initialReimbursement,
  attachmentsToAdd,
  attachmentsToDelete,
  onAddItem,
  onRemoveItem,
  markDeleteAttachment,
  undoDeleteAttachment,
  markAddAttachment,
  cancelAddAttachment,
}: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.13 }}
      className="rounded-2xl border border-app-border bg-app-surface-raised/40 p-4 sm:p-5 space-y-3"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-caption font-semibold text-app-text-muted uppercase tracking-wide">
          Expense Items
        </h2>
        <Button type="button" variant="light" size="sm" onClick={onAddItem}>
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
          <ExpenseItemCard
            key={field.id}
            field={field}
            idx={idx}
            control={control}
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
            categoryOptions={categoryOptions}
            costCenterOptions={costCenterOptions}
            geolocationEnabled={geolocationEnabled}
            initialReimbursement={initialReimbursement}
            attachmentsToAdd={attachmentsToAdd}
            attachmentsToDelete={attachmentsToDelete}
            onRemoveItem={onRemoveItem}
            markDeleteAttachment={markDeleteAttachment}
            undoDeleteAttachment={undoDeleteAttachment}
            markAddAttachment={markAddAttachment}
            cancelAddAttachment={cancelAddAttachment}
          />
        ))}
      </AnimatePresence>
    </motion.section>
  );
}
