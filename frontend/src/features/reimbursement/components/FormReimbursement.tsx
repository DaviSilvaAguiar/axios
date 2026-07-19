"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash, X, Receipt, Paperclip, CaretDown, CaretUp } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/ui/Button";
import Input from "@/ui/Input";
import InputMonetario from "@/ui/MoneyInput";
import DatePicker from "@/ui/DatePicker";
import Combobox from "@/ui/Combobox";
import Checkbox from "@/ui/Checkbox";
import Modal from "@/ui/Modal";
import EmptyState from "@/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingContext";
import LocationField from "@/features/geolocation/components/LocationField";
import SupplierSection from "@/features/supplier/components/SupplierSection";
import { listCentrosCustoApi, listCategoriasDespesaApi } from "../reimbursement.api";
import { listUsersApi } from "@/features/user/user.api";
import {
  storeReimbursementWithDespesasFormSchema,
  type CostCenter,
  type ExpenseCategory,
  type Reimbursement,
  type StoreReimbursementWithDespesasFormData,
} from "../reimbursement.types";
import type { User } from "@/features/auth/auth.types";
import { maskBanco, maskAgencia, maskConta, maskCpfCnpj } from "@/lib/masks";
import { EMAIL_REGEX } from "@/lib/validators";
import {
  type TipoChavePix,
  TIPO_CHAVE_PIX_OPTIONS,
  TIPO_CHAVE_PIX_PLACEHOLDER,
  aplicarMascaraChavePix,
  inferirTipoChavePix,
  isTipoChavePix,
} from "@/lib/pix";
import { toast } from "@/lib/toast";

type FormData = StoreReimbursementWithDespesasFormData;

export type AttachmentToAdd = { itemId: number; file: File };
export type AttachmentToDelete = { itemId: number; attachmentId: number };

interface Props {
  initialReimbursement?: Reimbursement;
  onSave: (
    data: FormData,
    deleteItemIds: number[],
    deleteAttachments: AttachmentToDelete[],
    addAttachments: AttachmentToAdd[]
  ) => Promise<void>;
  onClose: () => void;
  pageMode?: boolean;
}

export default function FormReimbursement({ initialReimbursement, onSave, onClose, pageMode = false }: Props) {
  const { user: currentUser } = useAuth();
  const { isEnabled } = useSettings();
  const geolocationEnabled = isEnabled("enable_geolocation_reimbursement_item");
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [deleteIds, setDeleteIds] = useState<number[]>([]);
  const [attachmentsToDelete, setAttachmentsToDelete] = useState<AttachmentToDelete[]>([]);
  const [attachmentsToAdd, setAttachmentsToAdd] = useState<AttachmentToAdd[]>([]);

  const [registeredEmployee, setRegisteredEmployee] = useState<boolean>(
    !!initialReimbursement?.requester_user_id,
  );
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [pixKeyType, setPixKeyType] = useState<TipoChavePix | null>(
    initialReimbursement?.pix_key ? inferirTipoChavePix(initialReimbursement.pix_key) : null,
  );
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(storeReimbursementWithDespesasFormSchema),
    defaultValues: initialReimbursement
      ? {
        title: initialReimbursement.title,
        cost_center_id: initialReimbursement.cost_center_id ? String(initialReimbursement.cost_center_id) : "",
        requester_name: initialReimbursement.requester_name ?? "",
        requester_tax_id: initialReimbursement.requester_tax_id ?? "",
        requester_department: initialReimbursement.requester_department ?? "",
        requester_user_id: initialReimbursement.requester_user_id
          ? String(initialReimbursement.requester_user_id)
          : "",
        notes: initialReimbursement.notes ?? "",
        period_start_date: initialReimbursement.period_start_date.split("T")[0],
        period_end_date: initialReimbursement.period_end_date.split("T")[0],
        bank: initialReimbursement.bank ?? "",
        branch: initialReimbursement.branch ?? "",
        account_number: initialReimbursement.account_number ?? "",
        pix_key: initialReimbursement.pix_key ?? "",
        items: initialReimbursement.items?.map((d) => ({
          itemId: d.id,
          expense_date: d.expense_date.split("T")[0],
          amount: d.amount,
          cost_center_id: String(d.cost_center_id),
          description: d.description,
          expense_category_id: d.expense_category_id ? String(d.expense_category_id) : "",
          latitude:  d.latitude  != null ? Number(d.latitude)  : null,
          longitude: d.longitude != null ? Number(d.longitude) : null,
          address:  d.address ?? null,
          description_supplier: d.description_supplier ?? "",
          supplier_tax_id:  d.supplier_tax_id  ?? "",
          supplier_id:        d.supplier_id ? String(d.supplier_id) : "",
        })) ?? [],
      }
      : {
        title: pageMode
          ? `Report - ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}`
          : "",
        cost_center_id: "",
        requester_name: currentUser?.name ?? "",
        requester_tax_id: currentUser?.tax_id ?? "",
        requester_department: "",
        requester_user_id: "",
        notes: "",
        period_start_date: "",
        period_end_date: "",
        bank: "",
        branch: "",
        account_number: "",
        pix_key: "",
        items: [],
      },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    listCentrosCustoApi(1, 1000).then((r) => setCostCenters(r.data)).catch(() => { });
    listCategoriasDespesaApi(1, 1000).then((r) => setCategories(r.data.filter((c) => c.active))).catch(() => { });
    listUsersApi(1, 200).then((r) => setUsers(r.data.filter((u) => u.active))).catch(() => { });
  }, []);

  const requesterUserId = watch("requester_user_id");

  function handleSelectEmployee(idStr: string) {
    setValue("requester_user_id", idStr, { shouldValidate: true });
    const u = users.find((x) => String(x.id) === idStr);
    if (u) {
      setValue("requester_name", u.name, { shouldValidate: true });
      setValue("requester_tax_id", u.tax_id ?? "", { shouldValidate: true });
    }
  }

  function handleToggleEmployee(flag: boolean) {
    setRegisteredEmployee(flag);
    if (!flag) {
      setValue("requester_user_id", "", { shouldValidate: true });
    }
  }

  function handleRemoveItem(idx: number) {
    const itemId = fields[idx].itemId;
    if (itemId) {
      setDeleteIds((prev) => [...prev, itemId]);
      setAttachmentsToDelete((prev) => prev.filter((a) => a.itemId !== itemId));
      setAttachmentsToAdd((prev) => prev.filter((a) => a.itemId !== itemId));
    }
    remove(idx);
  }

  function addItem() {
    append({
      expense_date: "",
      amount: "",
      cost_center_id: "",
      description: "",
      expense_category_id: "",
      latitude:  null,
      longitude: null,
      address:  null,
      description_supplier: "",
      supplier_tax_id:  "",
      supplier_id:        "",
    });
  }

  function markDeleteAttachment(itemId: number, attachmentId: number) {
    setAttachmentsToDelete((prev) => [...prev, { itemId, attachmentId }]);
  }

  function undoDeleteAttachment(attachmentId: number) {
    setAttachmentsToDelete((prev) => prev.filter((a) => a.attachmentId !== attachmentId));
  }

  function markAddAttachment(itemId: number, file: File) {
    setAttachmentsToAdd((prev) => [...prev, { itemId, file }]);
  }

  function cancelAddAttachment(itemId: number, file: File) {
    setAttachmentsToAdd((prev) => prev.filter((a) => !(a.itemId === itemId && a.file === file)));
  }

  const costCenterOptions = costCenters.map((cc) => ({
    value: String(cc.id),
    label: cc.description,
  }));

  const categoryOptions = categories.map((cat) => ({
    value: String(cat.id),
    label: cat.description,
  }));

  const itemsWatch = watch("items");
  const totalAmount = itemsWatch.reduce((acc, d) => acc + (parseFloat(d.amount) || 0), 0);
  const formattedTotal = totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const inner = (
    <>
      <div className="px-4 py-4 sm:px-6 sm:py-5">
        {!pageMode && (
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-feature-title text-app-text">
              {initialReimbursement ? "Edit Request" : "New Reimbursement Request"}
            </h1>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-app-text-muted hover:bg-app-hover"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit(
            async (data) => {
              await onSave(data, deleteIds, attachmentsToDelete, attachmentsToAdd);
            },
            (errs) => {
              const msg =
                errs.items?.root?.message ??
                (errs.items as { message?: string } | undefined)?.message;
              toast.error(msg ?? "Please check the form fields.");
            },
          )}
          className="space-y-4"
        >
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
              label="Title"
              placeholder="e.g. Trip to São Paulo — August 2025"
              error={errors.title?.message}
              {...register("title")}
              maxLength={255}
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
                    emptyMessage="No cost center."
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
            transition={{ duration: 0.2, delay: 0.09 }}
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

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.13 }}
            className="rounded-2xl border border-app-border bg-app-surface-raised/40 p-4 sm:p-5 space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-caption font-semibold text-app-text-muted uppercase tracking-wide">
                Expense Items
              </h2>
              <Button type="button" variant="light" size="sm" onClick={addItem}>
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
              {fields.map((field, idx) => {
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
                        onClick={() => handleRemoveItem(idx)}
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
              })}
            </AnimatePresence>
          </motion.section>

          <div className="space-y-3 pt-1">
            <div className="rounded-2xl border border-app-border bg-app-surface-raised/40 px-5 py-4 flex items-center justify-between">
              <span className="text-body-sm text-app-text-muted">Total recorded</span>
              <span className="text-feature-title font-bold text-app-text tabular-nums">{formattedTotal}</span>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="light" fullWidth onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="dark" fullWidth disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save Request"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );

  if (pageMode) return inner;
  return <Modal open onClose={onClose} isDirty={isDirty}>{inner}</Modal>;
}
