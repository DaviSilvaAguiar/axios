"use client";

import { useEffect, useState } from "react";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "@phosphor-icons/react";
import Input from "@/ui/Input";
import TaxIdInput from "@/ui/TaxIdInput";
import Button from "@/ui/Button";
import ActiveBadge from "@/ui/ActiveBadge";
import Combobox, { type ComboboxOption } from "@/ui/Combobox";
import UserModulesTab from "./UserModulesTab";
import {
  createUserFormSchema,
  editarUserFormSchema,
  type CriarUserFormData,
  type EditarUserFormData,
  type User,
} from "../user.types";

const ROLE_OPTIONS: ComboboxOption[] = [
  { value: "1", label: "Admin" },
  { value: "2", label: "Auditor" },
  { value: "3", label: "Provider" },
];

interface Props {
  user?: User;
  onSave: (data: CriarUserFormData | EditarUserFormData) => Promise<void>;
  onCancel: () => void;
}

export default function UserForm({ user, onSave, onCancel }: Props) {
  const isEditing = !!user;
  const isAdmin = user?.role === 1;
  const canEditModules = isEditing && !isAdmin;
  const schema = isEditing ? editarUserFormSchema : createUserFormSchema;

  const [tab, setTab] = useState<"details" | "modules">("details");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CriarUserFormData | EditarUserFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: user?.role ?? 3,
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
      active: user?.active ?? true,
      erp_code: user?.erp_code ?? "",
      tax_id: user?.tax_id ?? "",
    },
  });

  const { field: roleField } = useController({ name: "role", control });
  const { field: taxIdField } = useController({ name: "tax_id", control });

  useEffect(() => {
    reset({
      role: user?.role ?? 3,
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
      active: user?.active ?? true,
      erp_code: user?.erp_code ?? "",
      tax_id: user?.tax_id ?? "",
    });
  }, [user, reset]);

  const active = watch("active");

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-feature-title text-app-text">
          {isEditing ? "Edit User" : "New User"}
        </h2>
        <button
          onClick={onCancel}
          className="text-app-text-muted hover:text-app-text transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      {canEditModules && (
        <div className="flex gap-1 mb-5 border-b border-app-border">
          {(["details", "modules"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={[
                "px-3 py-2 text-caption font-semibold transition-colors border-b-2 -mb-px",
                tab === t
                  ? "border-brand text-brand"
                  : "border-transparent text-app-text-muted hover:text-app-text",
              ].join(" ")}
            >
              {t === "details" ? "Details" : "Modules"}
            </button>
          ))}
        </div>
      )}

      {canEditModules && tab === "modules" ? (
        <UserModulesTab userId={user!.id} />
      ) : (
      <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-caption font-semibold text-app-text-muted">Role</label>
          <Combobox
            options={ROLE_OPTIONS}
            value={String(roleField.value ?? 3)}
            onChange={(v) => {
              if (v) roleField.onChange(Number(v));
            }}
            placeholder="Select the role"
            searchPlaceholder="Search role…"
            className="w-full"
          />
          {"role" in errors && errors.role && (
            <p className="text-small text-red-500">{errors.role.message}</p>
          )}
        </div>

        <Input
          label="Name"
          placeholder="Full name"
          error={"name" in errors ? errors.name?.message : undefined}
          {...register("name")}
        />

        <Input
          label="Email"
          type="email"
          placeholder="email@example.com"
          error={"email" in errors ? errors.email?.message : undefined}
          {...register("email")}
        />

        <Input
          label={isEditing ? "New password (leave blank to keep)" : "Password"}
          type="password"
          placeholder={isEditing ? "••••••••" : "Minimum 8 characters"}
          error={"password" in errors ? errors.password?.message : undefined}
          {...register("password")}
        />

        <TaxIdInput
          label="CPF / CNPJ"
          value={taxIdField.value ?? ""}
          onChange={taxIdField.onChange}
          onBlur={taxIdField.onBlur}
          error={"tax_id" in errors ? errors.tax_id?.message : undefined}
        />

        <Input
          label="ERP Creditor Code"
          placeholder="Integration code"
          error={"erp_code" in errors ? errors.erp_code?.message : undefined}
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

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="light" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="dark" size="sm" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
      )}
    </div>
  );
}
