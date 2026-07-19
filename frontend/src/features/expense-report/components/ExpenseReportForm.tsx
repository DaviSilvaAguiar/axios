"use client";

import { useRef, useState, useMemo } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Plus,
  Trash,
  CaretDown,
  CaretUp,
  Receipt,
  Paperclip,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/ui/Button";
import Input from "@/ui/Input";
import InputMonetario from "@/ui/MoneyInput";
import DatePicker from "@/ui/DatePicker";
import Combobox from "@/ui/Combobox";
import Checkbox from "@/ui/Checkbox";
import Modal from "@/ui/Modal";
import { toast } from "@/lib/toast";
import { maskAgencia, maskBanco, maskConta, maskCpfCnpj } from "@/lib/masks";
import { EMAIL_REGEX } from "@/lib/validators";
import {
  type TipoChavePix,
  TIPO_CHAVE_PIX_OPTIONS,
  TIPO_CHAVE_PIX_PLACEHOLDER,
  aplicarMascaraChavePix,
  inferirTipoChavePix,
  isTipoChavePix,
} from "@/lib/pix";
import type { FieldErrors } from "react-hook-form";
import EmptyState from "@/ui/EmptyState";
import { nomeArquivo } from "@/lib/formatters";
import { useLookups } from "../hooks/useLookups";
import { useItemAttachments } from "../hooks/useItemAttachments";
import { useSettings } from "@/contexts/SettingContext";
import LocationField from "@/features/geolocation/components/LocationField";
import SupplierSection from "@/features/supplier/components/SupplierSection";
import {
  storeExpenseReportWithDespesasFormSchema,
  type ExpenseReport,
  type StoreExpenseReportWithDespesasFormData,
} from "../expense-report.types";

interface Props {
  initialExpenseReport?: ExpenseReport;
  onSave: (data: StoreExpenseReportWithDespesasFormData, filesByItem: File[][]) => Promise<void>;
  onClose: () => void;
}

function firstErrorMessage(errs: unknown): string | null {
  if (!errs || typeof errs !== "object") return null;
  for (const key of Object.keys(errs as Record<string, unknown>)) {
    const node = (errs as Record<string, unknown>)[key];
    if (!node || typeof node !== "object") continue;
    const msg = (node as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
    const nested = firstErrorMessage(node);
    if (nested) return nested;
  }
  return null;
}

export default function ExpenseReportForm({ initialExpenseReport, onSave, onClose }: Props) {
  const { isEnabled } = useSettings();
  const geolocationEnabled = isEnabled("enable_geolocation_expense_report_item");

  const { costCenters, categories, users } = useLookups();

  const { itemFiles, existingAttachments, addItem, removeItem, addFile, removeFile } =
    useItemAttachments(
      initialExpenseReport?.items?.length ?? 0,
      initialExpenseReport?.items?.map((d) => d.attachments ?? []) ?? [],
    );

  const [registeredEmployee, setRegisteredEmployee] = useState<boolean>(
    !!initialExpenseReport?.requester_user_id,
  );
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [pixKeyType, setPixKeyType] = useState<TipoChavePix | null>(
    initialExpenseReport?.pix_key ? inferirTipoChavePix(initialExpenseReport.pix_key) : null,
  );
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<StoreExpenseReportWithDespesasFormData>({
    resolver: zodResolver(storeExpenseReportWithDespesasFormSchema),
    defaultValues: initialExpenseReport
      ? {
          cost_center_id:         String(initialExpenseReport.cost_center_id),
          description:             initialExpenseReport.description,
          period_start_date:       initialExpenseReport.period_start_date?.split("T")[0] ?? "",
          period_end_date:         initialExpenseReport.period_end_date?.split("T")[0] ?? "",
          bank:                    initialExpenseReport.bank ?? "",
          branch:                  initialExpenseReport.branch ?? "",
          account_number:          initialExpenseReport.account_number ?? "",
          pix_key:                 initialExpenseReport.pix_key ?? "",
          requester_description:   initialExpenseReport.requester_description ?? "",
          requester_department:    initialExpenseReport.requester_department ?? "",
          requester_tax_id:        initialExpenseReport.requester_tax_id ?? "",
          requester_user_id:    initialExpenseReport.requester_user_id
            ? String(initialExpenseReport.requester_user_id)
            : "",
          notes:                     initialExpenseReport.notes ?? "",
          items: initialExpenseReport.items?.map((d) => ({
            expense_date:          d.expense_date.split("T")[0],
            amount:                d.amount ?? "",
            cost_center_id:       String(d.cost_center_id ?? ""),
            description:           d.description,
            expense_category_id:   d.expense_category_id ? String(d.expense_category_id) : "",
            latitude:  d.latitude  != null ? Number(d.latitude)  : null,
            longitude: d.longitude != null ? Number(d.longitude) : null,
            address:  d.address ?? null,
            description_supplier: d.description_supplier ?? "",
            supplier_tax_id:       d.supplier_tax_id  ?? "",
            supplier_id:         d.supplier_id ? String(d.supplier_id) : "",
          })) ?? [],
        }
      : {
          cost_center_id:         "",
          description:             "",
          period_start_date:       "",
          period_end_date:         "",
          requester_description:   "",
          requester_department:    "",
          requester_tax_id:        "",
          requester_user_id:    "",
          notes:                     "",
          bank:                    "",
          branch:                  "",
          account_number:          "",
          pix_key:                 "",
          items:                [],
        },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

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

  function addExpenseItem() {
    append({
      expense_date:          "",
      amount:                "",
      cost_center_id:       "",
      description:           "",
      expense_category_id:   "",
      latitude:              null,
      longitude:             null,
      address:              null,
      description_supplier: "",
      supplier_tax_id:       "",
      supplier_id:         "",
    });
    addItem();
  }

  function removeExpenseItem(idx: number) {
    remove(idx);
    removeItem(idx);
  }

  const costCenterOptions = useMemo(
    () => costCenters.map((cc) => ({ value: String(cc.id), label: cc.description })),
    [costCenters],
  );

  const categoryOptions = useMemo(
    () => categories.map((cat) => ({ value: String(cat.id), label: cat.description })),
    [categories],
  );

  const itemsWatch = watch("items");
  const totalRecorded = (itemsWatch ?? []).reduce((acc, d) => acc + (parseFloat(d.amount) || 0), 0);
  const fmtTotalRecorded = totalRecorded.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  async function onSubmit(data: StoreExpenseReportWithDespesasFormData) {
    await onSave(data, itemFiles);
  }

  function onInvalid(errs: FieldErrors<StoreExpenseReportWithDespesasFormData>) {
    const first = firstErrorMessage(errs);
    toast.error(first ?? "Check the form fields.");
  }

  return (
    <Modal open onClose={onClose} isDirty={isDirty}>
      <div className="px-4 py-4 sm:px-6 sm:py-5">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-feature-title text-app-text">
            {initialExpenseReport ? "Edit Report" : "New Report"}
          </h1>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-app-text-muted hover:bg-app-hover"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="rounded-2xl border border-app-border bg-app-surface-raised/40 p-4 sm:p-5 space-y-4"
          >
            <h2 className="text-caption font-semibold text-app-text-muted uppercase tracking-wide">
              Request Details
            </h2>

            <Input
              label="Description"
              placeholder="e.g. Office supplies — April 2026"
              error={errors.description?.message}
              {...register("description")}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-caption font-semibold text-app-text-muted">
                Cost Center
              </label>
              <Controller
                name="cost_center_id"
                control={control}
                render={({ field }) => (
                  <Combobox
                    options={costCenterOptions}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Select…"
                    emptyMessage="No cost centers."
                    className="w-full"
                  />
                )}
              />
              {errors.cost_center_id && (
                <p className="mt-0.5 text-small text-red-600">
                  {errors.cost_center_id.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Controller
                name="period_start_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    size="sm"
                    label="Period — Start"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.period_start_date?.message}
                  />
                )}
              />
              <Controller
                name="period_end_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    size="sm"
                    label="Period — End"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.period_end_date?.message}
                  />
                )}
              />
            </div>

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
          </motion.section>

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

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
            className="rounded-2xl border border-app-border bg-app-surface-raised/40 p-4 sm:p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-caption font-semibold text-app-text-muted uppercase tracking-wide">
                Expense Items
              </h2>
              <Button type="button" variant="light" size="sm" onClick={addExpenseItem}>
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
                <motion.div
                  key={field.id}
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
                      onClick={() => removeExpenseItem(idx)}
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
                            emptyMessage="No categories."
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
                            emptyMessage="No cost centers."
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
                  />

                  <SupplierSection
                    idSupplier={watch(`items.${idx}.supplier_id`) ?? ""}
                    descricaoSupplier={watch(`items.${idx}.description_supplier`) ?? ""}
                    cpfCnpjSupplier={watch(`items.${idx}.supplier_tax_id`) ?? ""}
                    onChange={(campos) => {
                      setValue(`items.${idx}.supplier_id`, campos.supplier_id, { shouldDirty: true });
                      setValue(`items.${idx}.description_supplier`, campos.descricao_supplier, { shouldDirty: true });
                      setValue(`items.${idx}.supplier_tax_id`, campos.cpf_cnpj_supplier, { shouldDirty: true });
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
                        const value =
                          lat != null && lon != null
                            ? { latitude: Number(lat), longitude: Number(lon), address: end ?? null }
                            : null;
                        return (
                          <LocationField
                            label="Item location"
                            valor={value}
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

                    {(existingAttachments[idx] ?? []).map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center gap-2 rounded-lg border border-app-border-subtle bg-app-surface/60 px-3 py-2"
                      >
                        <Paperclip size={14} className="text-app-text-subtle shrink-0" />
                        <span className="flex-1 truncate text-small text-app-text-muted">
                          {nomeArquivo(attachment.path)}
                        </span>
                      </div>
                    ))}

                    {(itemFiles[idx] ?? []).map((file, fileIdx) => (
                      <div
                        key={fileIdx}
                        className="flex items-center gap-2 rounded-lg border border-app-border-subtle bg-app-surface px-3 py-2"
                      >
                        <Paperclip size={14} className="text-app-text-muted shrink-0" />
                        <span className="flex-1 truncate text-small text-app-text">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(idx, fileIdx)}
                          className="text-app-text-subtle hover:text-red-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[idx]?.click()}
                      className="flex items-center gap-1.5 text-caption font-semibold text-brand hover:opacity-80 transition-opacity"
                    >
                      <Plus size={14} />
                      Add attachment
                    </button>

                    <input
                      ref={(el) => { fileInputRefs.current[idx] = el; }}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) addFile(idx, file);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.section>

          <div className="space-y-3 pt-1">
            <div className="rounded-2xl border border-app-border bg-app-surface-raised/40 px-5 py-4 flex items-center justify-between">
              <span className="text-body-sm text-app-text-muted">Total recorded</span>
              <span className="text-feature-title font-bold text-app-text tabular-nums">{fmtTotalRecorded}</span>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="light" fullWidth onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="dark" fullWidth disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
