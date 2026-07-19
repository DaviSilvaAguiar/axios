"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "@phosphor-icons/react";
import Modal from "@/ui/Modal";
import Button from "@/ui/Button";
import Input from "@/ui/Input";
import InputMonetario from "@/ui/MoneyInput";
import DatePicker from "@/ui/DatePicker";
import Combobox from "@/ui/Combobox";
import { toast } from "@/lib/toast";
import {
  lancarAjusteFormSchema,
  SUBTYPE_NEGATIVE_ADJUSTMENT,
  SUBTYPE_POSITIVE_ADJUSTMENT,
  SUBTYPE_REFUND,
  type LancarAjusteFormData,
} from "../fund.types";

const SUBTYPE_OPTIONS = [
  { value: String(SUBTYPE_REFUND), label: "Balance Return" },
  { value: String(SUBTYPE_POSITIVE_ADJUSTMENT), label: "Positive Adjustment" },
  { value: String(SUBTYPE_NEGATIVE_ADJUSTMENT), label: "Negative Adjustment" },
];

interface Props {
  onSave: (data: LancarAjusteFormData) => Promise<void>;
  onClose: () => void;
}

export default function PostAdjustmentModal({ onSave, onClose }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<LancarAjusteFormData>({
    resolver: zodResolver(lancarAjusteFormSchema),
    defaultValues: {
      subtype: String(SUBTYPE_REFUND),
      amount: "",
      transaction_date: new Date().toISOString().slice(0, 10),
      reason: "",
    },
  });

  const subtype = watch("subtype");
  const amount = watch("amount");
  const date = watch("transaction_date");

  async function onSubmit(data: LancarAjusteFormData) {
    try {
      await onSave(data);
    } catch {
      toast.error("Could not post the adjustment.");
    }
  }

  return (
    <Modal open onClose={onClose} className="max-w-md" isDirty={isDirty}>
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5">
        <div className="mb-5 flex items-start justify-between">
          <h1 className="text-feature-title text-app-text">Post Adjustment</h1>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-app-text-muted hover:bg-app-hover"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-caption font-semibold text-app-text-muted">Adjustment Type</label>
            <Combobox
              options={SUBTYPE_OPTIONS}
              value={subtype}
              onChange={(v) => setValue("subtype", v, { shouldValidate: true, shouldDirty: true })}
              placeholder="Select"
            />
            {errors.subtype && (
              <p className="text-small text-red-600">{errors.subtype.message}</p>
            )}
          </div>

          <InputMonetario
            label="Amount"
            value={amount}
            onChange={(v) => setValue("amount", v, { shouldValidate: true, shouldDirty: true })}
            error={errors.amount?.message}
          />

          <DatePicker
            label="Date"
            value={date}
            onChange={(v) => setValue("transaction_date", v, { shouldValidate: true, shouldDirty: true })}
            error={errors.transaction_date?.message}
          />

          <Input
            label="Reason"
            placeholder='e.g. "Return of remaining balance on 12/01"'
            error={errors.reason?.message}
            {...register("reason")}
          />
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="light" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="dark" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Confirm"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
