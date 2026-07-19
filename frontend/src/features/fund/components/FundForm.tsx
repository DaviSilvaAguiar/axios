"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "@phosphor-icons/react";
import Modal from "@/ui/Modal";
import Button from "@/ui/Button";
import Input from "@/ui/Input";
import Combobox from "@/ui/Combobox";
import { toast } from "@/lib/toast";
import { maskAgencia, maskBanco, maskConta } from "@/lib/masks";
import { EMAIL_REGEX } from "@/lib/validators";
import {
  type TipoChavePix,
  TIPO_CHAVE_PIX_OPTIONS,
  TIPO_CHAVE_PIX_PLACEHOLDER,
  aplicarMascaraChavePix,
  isTipoChavePix,
} from "@/lib/pix";
import {
  storeFundFormSchema,
  FUND_TIPO_LABEL,
  type StoreFundFormData,
} from "../fund.types";
import { listUsersApi } from "@/features/user/user.api";
import { listCentrosDeCustoApi } from "@/features/cost-center/cost-center.api";
import type { User } from "@/features/auth/auth.types";
import type { CostCenter } from "@/features/cost-center/cost-center.types";

interface Props {
  onSave: (data: StoreFundFormData) => Promise<void>;
  onClose: () => void;
}

export default function FundForm({ onSave, onClose }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [pixKeyType, setPixKeyType] = useState<TipoChavePix | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<StoreFundFormData>({
    resolver: zodResolver(storeFundFormSchema),
    defaultValues: {
      user_id: "",
      cost_center_id: "",
      description: "",
      type: "1",
      bank: "",
      branch: "",
      account_number: "",
      pix_key: "",
    },
  });

  useEffect(() => {
    listUsersApi(1, 200)
      .then((r) => setUsers(r.data.filter((u) => u.active)))
      .catch(() => toast.error("Could not load users."));
    listCentrosDeCustoApi(1, 200)
      .then((r) => setCostCenters(r.data.filter((c) => c.active)))
      .catch(() => toast.error("Could not load cost centers."));
  }, []);

  const userId = watch("user_id");
  const costCenterId = watch("cost_center_id");
  const type = watch("type");
  const description = watch("description");

  async function onSubmit(data: StoreFundFormData) {
    if (pixKeyType === "email" && data.pix_key && !EMAIL_REGEX.test(data.pix_key ?? "")) {
      setError("pix_key", { message: "Enter a valid email" });
      return;
    }
    try {
      await onSave(data);
    } catch {
      toast.error("Could not create the fund.");
    }
  }

  return (
    <Modal open onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5">
        <div className="mb-5 flex items-start justify-between">
          <h1 className="text-feature-title text-app-text">New Fund</h1>
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
            <label className="text-caption font-semibold text-app-text-muted">In Charge</label>
            <Combobox
              options={users.map((u) => ({ value: String(u.id), label: u.name }))}
              value={userId}
              onChange={(v) => setValue("user_id", v, { shouldValidate: true })}
              placeholder="Select the person in charge"
            />
            {errors.user_id && (
              <p className="text-small text-red-600">{errors.user_id.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-caption font-semibold text-app-text-muted">Cost Center</label>
            <Combobox
              options={costCenters.map((c) => ({ value: String(c.id), label: c.description }))}
              value={costCenterId}
              onChange={(v) => setValue("cost_center_id", v, { shouldValidate: true })}
              placeholder="Select the cost center"
            />
            {errors.cost_center_id && (
              <p className="text-small text-red-600">{errors.cost_center_id.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Input
              label="Description"
              placeholder='e.g. "DPW Site Fund - Nov/2026"'
              maxLength={100}
              error={errors.description?.message}
              {...register("description")}
            />
            <p className={`text-small text-right ${(description?.length ?? 0) >= 100 ? "text-red-500" : "text-app-text-muted"}`}>
              {description?.length ?? 0}/100
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-caption font-semibold text-app-text-muted">Type</label>
            <Combobox
              options={Object.entries(FUND_TIPO_LABEL).map(([value, label]) => ({
                value,
                label,
              }))}
              value={type}
              onChange={(v) => setValue("type", v, { shouldValidate: true })}
              placeholder="Select the type"
            />
            {errors.type && <p className="text-small text-red-600">{errors.type.message}</p>}
          </div>

          <details className="rounded-2xl border border-app-border bg-app-surface-raised/40 p-4">
            <summary className="cursor-pointer text-caption font-semibold text-app-text-muted">
              Bank details (optional)
            </summary>
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Controller
                  name="bank"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Bank"
                      placeholder="e.g. 341"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(maskBanco(e.target.value))}
                      onBlur={field.onBlur}
                      error={errors.bank?.message}
                    />
                  )}
                />
                <Controller
                  name="branch"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Branch"
                      placeholder="e.g. 0001-0"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(maskAgencia(e.target.value))}
                      onBlur={field.onBlur}
                      error={errors.branch?.message}
                    />
                  )}
                />
                <Controller
                  name="account_number"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Account"
                      placeholder="e.g. 12345-6"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(maskConta(e.target.value))}
                      onBlur={field.onBlur}
                      error={errors.account_number?.message}
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-caption font-semibold text-app-text-muted">Pix Key</label>
                <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2">
                  <Combobox
                    options={TIPO_CHAVE_PIX_OPTIONS}
                    value={pixKeyType ?? ""}
                    onChange={(v) => {
                      setPixKeyType(isTipoChavePix(v) ? v : null);
                      setValue("pix_key", "", { shouldValidate: false });
                      clearErrors("pix_key");
                    }}
                    placeholder="Select the type"
                  />
                  <Controller
                    name="pix_key"
                    control={control}
                    render={({ field }) => (
                      <div className="relative flex-1">
                        <input
                          className={`h-10 w-full rounded-xl px-3 text-body-sm border text-app-text placeholder:text-app-text-subtle outline-none transition-colors duration-200 ${
                            pixKeyType
                              ? "bg-app-surface border-app-border focus:border-brand"
                              : "bg-app-surface/50 border-app-border cursor-not-allowed text-app-text-muted"
                          } ${field.value ? "pr-8" : ""}`}
                          placeholder={pixKeyType ? TIPO_CHAVE_PIX_PLACEHOLDER[pixKeyType] : "Select the type first"}
                          disabled={!pixKeyType}
                          value={field.value ?? ""}
                          onChange={(e) => pixKeyType && field.onChange(aplicarMascaraChavePix(e.target.value, pixKeyType))}
                          onBlur={() => {
                            field.onBlur();
                            if (pixKeyType === "email" && field.value) {
                              if (!EMAIL_REGEX.test(field.value)) {
                                setError("pix_key", { message: "Enter a valid email" });
                              } else {
                                clearErrors("pix_key");
                              }
                            }
                          }}
                        />
                        {field.value && (
                          <button
                            type="button"
                            onClick={() => {
                              field.onChange("");
                              setPixKeyType(null);
                              clearErrors("pix_key");
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-app-text-muted hover:bg-app-hover hover:text-app-text"
                          >
                            <X size={12} weight="bold" />
                          </button>
                        )}
                      </div>
                    )}
                  />
                </div>
                {errors.pix_key && (
                  <p className="text-small text-red-500">{errors.pix_key.message}</p>
                )}
              </div>
            </div>
          </details>
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="light" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="dark" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Create Fund"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
