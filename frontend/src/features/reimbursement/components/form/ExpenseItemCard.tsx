"use client";

import { useRef } from "react";
import {
  Controller,
  type Control,
  type UseFormRegister,
  type UseFormWatch,
  type UseFormSetValue,
  type FieldErrors,
  type FieldArrayWithId,
} from "react-hook-form";
import { Plus, Trash, X, Paperclip } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import Input from "@/ui/Input";
import InputMonetario from "@/ui/MoneyInput";
import DatePicker from "@/ui/DatePicker";
import Combobox from "@/ui/Combobox";
import LocationField from "@/features/geolocation/components/LocationField";
import SupplierSection from "@/features/supplier/components/SupplierSection";
import {
  type Reimbursement,
  type StoreReimbursementWithDespesasFormData,
} from "../../reimbursement.types";
import type { AttachmentToAdd, AttachmentToDelete } from "../FormReimbursement";

type FormData = StoreReimbursementWithDespesasFormData;

type Option = { value: string; label: string };

interface Props {
  field: FieldArrayWithId<FormData, "items", "id">;
  idx: number;
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
  onRemoveItem: (idx: number) => void;
  markDeleteAttachment: (itemId: number, attachmentId: number) => void;
  undoDeleteAttachment: (attachmentId: number) => void;
  markAddAttachment: (itemId: number, file: File) => void;
  cancelAddAttachment: (itemId: number, file: File) => void;
}

export default function ExpenseItemCard({
  field,
  idx,
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
  onRemoveItem,
  markDeleteAttachment,
  undoDeleteAttachment,
  markAddAttachment,
  cancelAddAttachment,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemId = field.itemId;
  const originalItem = itemId
    ? initialReimbursement?.items?.find((d) => d.id === itemId)
    : undefined;

  const localFiles = !itemId
    ? ((watch(`items.${idx}.anexo`) as File[] | undefined) ?? [])
    : [];
  const pendingAdds = itemId
    ? attachmentsToAdd.filter((a) => a.itemId === itemId)
    : [];

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
          onClick={() => onRemoveItem(idx)}
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
                emptyMessage="No category."
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
                emptyMessage="No cost center."
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
        maxLength={255}
      />

      <SupplierSection
        idSupplier={watch(`items.${idx}.supplier_id`) ?? ""}
        descricaoSupplier={watch(`items.${idx}.description_supplier`) ?? ""}
        cpfCnpjSupplier={watch(`items.${idx}.supplier_tax_id`) ?? ""}
        onChange={(fieldsValue) => {
          setValue(`items.${idx}.supplier_id`, fieldsValue.supplier_id, { shouldDirty: true });
          setValue(`items.${idx}.description_supplier`, fieldsValue.descricao_supplier, { shouldDirty: true });
          setValue(`items.${idx}.supplier_tax_id`, fieldsValue.cpf_cnpj_supplier, { shouldDirty: true });
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
            const locationValue =
              lat != null && lon != null
                ? { latitude: Number(lat), longitude: Number(lon), address: end ?? null }
                : null;
            return (
              <LocationField
                label="Item location"
                valor={locationValue}
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

      <div className="space-y-2">
        <label className="text-caption font-semibold text-app-text-muted">
          Attachments
        </label>

        {(originalItem?.attachments ?? []).map((attachment) => {
          const marked = attachmentsToDelete.some((a) => a.attachmentId === attachment.id);
          return (
            <div
              key={attachment.id}
              className="flex items-center gap-2 rounded-lg border border-app-border-subtle bg-app-surface/60 px-3 py-2"
            >
              <Paperclip size={14} className={marked ? "text-red-400 shrink-0" : "text-app-text-subtle shrink-0"} />
              <span className={`flex-1 truncate text-small ${marked ? "line-through text-red-400" : "text-app-text-muted"}`}>
                {attachment.path.split("/").pop()}
              </span>
              {marked ? (
                <button
                  type="button"
                  onClick={() => undoDeleteAttachment(attachment.id)}
                  className="text-small text-app-text-muted hover:text-brand transition-colors shrink-0"
                >
                  Undo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => markDeleteAttachment(itemId!, attachment.id)}
                  className="text-app-text-subtle hover:text-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          );
        })}

        {itemId
          ? pendingAdds.map((a, i) => (
            <div
              key={`p${i}`}
              className="flex items-center gap-2 rounded-lg border border-app-border-subtle bg-app-surface px-3 py-2"
            >
              <Paperclip size={14} className="text-app-text-muted shrink-0" />
              <span className="flex-1 truncate text-small text-app-text">{a.file.name}</span>
              <button
                type="button"
                onClick={() => cancelAddAttachment(itemId, a.file)}
                className="text-app-text-subtle hover:text-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))
          : localFiles.map((file, fi) => (
            <div
              key={fi}
              className="flex items-center gap-2 rounded-lg border border-app-border-subtle bg-app-surface px-3 py-2"
            >
              <Paperclip size={14} className="text-app-text-muted shrink-0" />
              <span className="flex-1 truncate text-small text-app-text">{file.name}</span>
              <button
                type="button"
                onClick={() => {
                  const current = (watch(`items.${idx}.anexo`) as File[] | undefined) ?? [];
                  setValue(`items.${idx}.anexo`, current.filter((_, i2) => i2 !== fi) as unknown as undefined);
                }}
                className="text-app-text-subtle hover:text-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 text-caption font-semibold text-brand hover:opacity-80 transition-opacity"
        >
          <Plus size={14} />
          Add attachment
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            const newFiles = Array.from(e.target.files ?? []);
            if (itemId) {
              newFiles.forEach((f) => markAddAttachment(itemId, f));
            } else {
              const existing = (watch(`items.${idx}.anexo`) as File[] | undefined) ?? [];
              setValue(`items.${idx}.anexo`, [...existing, ...newFiles] as unknown as undefined);
            }
            e.target.value = "";
          }}
        />
      </div>
    </motion.div>
  );
}
