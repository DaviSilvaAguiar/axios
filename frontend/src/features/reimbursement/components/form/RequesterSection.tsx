"use client";

import {
  Controller,
  type Control,
  type UseFormRegister,
  type FieldErrors,
} from "react-hook-form";
import { motion } from "framer-motion";
import Input from "@/ui/Input";
import Combobox from "@/ui/Combobox";
import Checkbox from "@/ui/Checkbox";
import { maskCpfCnpj } from "@/lib/masks";
import { type StoreReimbursementWithDespesasFormData } from "../../reimbursement.types";

type FormData = StoreReimbursementWithDespesasFormData;

interface Props {
  control: Control<FormData>;
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  users: Array<{ id: number; name: string }>;
  requesterUserId: string;
  registeredEmployee: boolean;
  onToggleEmployee: (flag: boolean) => void;
  onSelectEmployee: (idStr: string) => void;
}

export default function RequesterSection({
  control,
  register,
  errors,
  users,
  requesterUserId,
  registeredEmployee,
  onToggleEmployee,
  onSelectEmployee,
}: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.09 }}
      className="rounded-2xl border border-app-border bg-app-surface-raised/40 p-4 sm:p-5 space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-caption font-semibold text-app-text-muted uppercase tracking-wide">
          Requester
        </h2>
        <Checkbox
          checked={registeredEmployee}
          onChange={onToggleEmployee}
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
            onChange={onSelectEmployee}
            placeholder="Select the employee"
            emptyMessage="No registered employee."
            className="w-full"
          />
          {errors.requester_name && (
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
              error={errors.requester_name?.message}
              {...register("requester_name")}
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
