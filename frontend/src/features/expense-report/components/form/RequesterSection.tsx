"use client";

import { useState } from "react";
import { Controller } from "react-hook-form";
import type {
  Control,
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import { motion } from "framer-motion";
import Input from "@/ui/Input";
import Combobox from "@/ui/Combobox";
import Checkbox from "@/ui/Checkbox";
import { maskCpfCnpj } from "@/lib/masks";
import type { User } from "@/features/auth/auth.types";
import type { StoreExpenseReportWithDespesasFormData } from "../../expense-report.types";

interface Props {
  control: Control<StoreExpenseReportWithDespesasFormData>;
  register: UseFormRegister<StoreExpenseReportWithDespesasFormData>;
  watch: UseFormWatch<StoreExpenseReportWithDespesasFormData>;
  setValue: UseFormSetValue<StoreExpenseReportWithDespesasFormData>;
  errors: FieldErrors<StoreExpenseReportWithDespesasFormData>;
  users: User[];
  initialRegistered: boolean;
}

export default function RequesterSection({ control, register, watch, setValue, errors, users, initialRegistered }: Props) {
  const [registeredEmployee, setRegisteredEmployee] = useState<boolean>(initialRegistered);
  const requesterUserId = watch("requester_user_id");

  function handleSelectEmployee(idStr: string) {
    setValue("requester_user_id", idStr, { shouldValidate: true });
    const u = users.find((x) => String(x.id) === idStr);
    if (u) {
      setValue("requester_description", u.name, { shouldValidate: true });
      setValue("requester_tax_id", u.tax_id ?? "", { shouldValidate: true });
    }
  }

  function handleToggleEmployee(flag: boolean) {
    setRegisteredEmployee(flag);
    if (!flag) {
      setValue("requester_user_id", "", { shouldValidate: true });
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      className="rounded-2xl border border-app-border bg-app-surface-raised/40 p-4 sm:p-5 space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-caption font-semibold text-app-text-muted uppercase tracking-wide">
          Requester
        </h2>
        <Checkbox
          checked={registeredEmployee}
          onChange={handleToggleEmployee}
          label="Registered Employee"
          className={`rounded-full px-3 py-1.5 border transition-all duration-200 ${
            registeredEmployee
              ? "bg-brand/8 border-brand/20"
              : "bg-app-surface-raised border-app-border"
          }`}
        />
      </div>

      {registeredEmployee ? (
        <div className="flex flex-col gap-1.5">
          <label className="text-caption font-semibold text-app-text-muted">
            Employee
          </label>
          <Combobox
            options={users.map((u) => ({ value: String(u.id), label: u.name }))}
            value={requesterUserId ?? ""}
            onChange={handleSelectEmployee}
            placeholder="Select the employee"
            emptyMessage="No registered employees."
            className="w-full"
          />
          {errors.requester_description && (
            <p className="mt-0.5 text-small text-red-600">
              Select an employee.
            </p>
          )}

          <Input
            label="Department"
            placeholder="e.g. Administrative"
            error={errors.requester_department?.message}
            className="mt-2"
            {...register("requester_department")}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Name"
              placeholder="Full name"
              error={errors.requester_description?.message}
              {...register("requester_description")}
            />
            <Input
              label="Department"
              placeholder="e.g. Administrative"
              error={errors.requester_department?.message}
              {...register("requester_department")}
            />
          </div>

          <Controller
            name="requester_tax_id"
            control={control}
            render={({ field }) => (
              <Input
                label="Tax ID"
                placeholder="000.000.000-00"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(maskCpfCnpj(e.target.value))}
                onBlur={field.onBlur}
                error={errors.requester_tax_id?.message}
              />
            )}
          />
        </>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-caption font-semibold text-app-text-muted">
          Notes
        </label>
        <textarea
          placeholder="Additional information (optional)"
          rows={3}
          className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-body-sm text-app-text placeholder:text-app-text-subtle resize-none focus:border-brand focus:outline-none"
          {...register("notes")}
        />
      </div>
    </motion.section>
  );
}
