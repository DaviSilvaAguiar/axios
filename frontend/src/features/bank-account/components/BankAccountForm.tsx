"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/ui/Input";
import ActiveBadge from "@/ui/ActiveBadge";
import ModalForm from "@/ui/ModalForm";
import { useSettings } from "@/contexts/SettingContext";
import {
  buildBankAccountFormSchema,
  type BankAccount,
  type BankAccountFormData,
} from "../bank-account.types";

interface Props {
  bankAccount?: BankAccount;
  onSave: (data: BankAccountFormData) => Promise<void>;
  onCancel: () => void;
}

export default function BankAccountForm({ bankAccount, onSave, onCancel }: Props) {
  const { isEnabled } = useSettings();
  const erpCodeRequired = isEnabled("require_erp_code");
  const schema = useMemo(
    () => buildBankAccountFormSchema(erpCodeRequired),
    [erpCodeRequired],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BankAccountFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: bankAccount?.description ?? "",
      erp_code:    bankAccount?.erp_code ?? "",
      active:      bankAccount?.active ?? true,
    },
  });

  useEffect(() => {
    reset({
      description: bankAccount?.description ?? "",
      erp_code:    bankAccount?.erp_code ?? "",
      active:      bankAccount?.active ?? true,
    });
  }, [bankAccount, reset]);

  const active = watch("active");

  return (
    <ModalForm
      titulo={bankAccount ? "Edit Bank Account" : "New Bank Account"}
      onCancelar={onCancel}
      onSubmit={handleSubmit(onSave)}
      submitting={isSubmitting}
    >
      <Input
        label="Description"
        placeholder="e.g. Bank of America — Checking"
        error={errors.description?.message}
        {...register("description")}
      />

      <Input
        label="ERP Code"
        placeholder="Account ID in the target ERP"
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
