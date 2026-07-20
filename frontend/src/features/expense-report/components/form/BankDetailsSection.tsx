"use client";

import { useState } from "react";
import { Controller } from "react-hook-form";
import type {
  Control,
  UseFormSetValue,
  UseFormSetError,
  UseFormClearErrors,
  FieldErrors,
} from "react-hook-form";
import { X, CaretDown, CaretUp } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import Input from "@/ui/Input";
import Combobox from "@/ui/Combobox";
import { maskAgencia, maskBanco, maskConta } from "@/lib/masks";
import { EMAIL_REGEX } from "@/lib/validators";
import {
  type TipoChavePix,
  TIPO_CHAVE_PIX_OPTIONS,
  TIPO_CHAVE_PIX_PLACEHOLDER,
  aplicarMascaraChavePix,
  inferirTipoChavePix,
  isTipoChavePix,
} from "@/lib/pix";
import type { StoreExpenseReportWithDespesasFormData } from "../../expense-report.types";

interface Props {
  control: Control<StoreExpenseReportWithDespesasFormData>;
  errors: FieldErrors<StoreExpenseReportWithDespesasFormData>;
  setValue: UseFormSetValue<StoreExpenseReportWithDespesasFormData>;
  setError: UseFormSetError<StoreExpenseReportWithDespesasFormData>;
  clearErrors: UseFormClearErrors<StoreExpenseReportWithDespesasFormData>;
  initialPixKey?: string | null;
}

export default function BankDetailsSection({ control, errors, setValue, setError, clearErrors, initialPixKey }: Props) {
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [pixKeyType, setPixKeyType] = useState<TipoChavePix | null>(
    initialPixKey ? inferirTipoChavePix(initialPixKey) : null,
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => setShowBankDetails((v) => !v)}
        className="flex items-center gap-2 text-caption font-semibold text-brand cursor-pointer"
      >
        {showBankDetails ? <CaretUp size={14} /> : <CaretDown size={14} />}
        Bank details for payment
      </button>

      <AnimatePresence>
        {showBankDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
