"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "@phosphor-icons/react";
import Modal from "@/ui/Modal";
import Button from "@/ui/Button";
import Input from "@/ui/Input";
import InputMonetario from "@/ui/MoneyInput";
import DatePicker from "@/ui/DatePicker";
import { toast } from "@/lib/toast";
import {
  lancarCreditoFormSchema,
  type LancarCreditoFormData,
} from "../fund.types";

interface Props {
  onSave: (data: LancarCreditoFormData) => Promise<void>;
  onClose: () => void;
}

export default function PostCreditModal({ onSave, onClose }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<LancarCreditoFormData>({
    resolver: zodResolver(lancarCreditoFormSchema),
    defaultValues: {
      amount: "",
      transaction_date: new Date().toISOString().slice(0, 10),
      notes: "",
    },
  });

  const amount = watch("amount");
  const date = watch("transaction_date");

  async function onSubmit(data: LancarCreditoFormData) {
    try {
      await onSave(data);
    } catch {
      toast.error("Could not post the advance.");
    }
  }

  return (
    <Modal open onClose={onClose} className="max-w-md" isDirty={isDirty}>
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5">
        <div className="mb-5 flex items-start justify-between">
          <h1 className="text-feature-title text-app-text">Post Advance</h1>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-app-text-muted hover:bg-app-hover"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
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
            label="Notes (optional)"
            placeholder='e.g. "PIX Ref. Week 1"'
            error={errors.notes?.message}
            {...register("notes")}
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
