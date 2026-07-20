"use client";

import { useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import Button from "@/ui/Button";
import Modal from "@/ui/Modal";
import { toast } from "@/lib/toast";
import type { FieldErrors } from "react-hook-form";
import { formatarMoeda } from "@/lib/formatters";
import { useLookups } from "../hooks/useLookups";
import { useItemAttachments } from "../hooks/useItemAttachments";
import { useSettings } from "@/contexts/SettingContext";
import RequestDetailsSection from "./form/RequestDetailsSection";
import RequesterSection from "./form/RequesterSection";
import ExpenseItemsSection from "./form/ExpenseItemsSection";
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
  const fmtTotalRecorded = formatarMoeda(totalRecorded);

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
          <RequestDetailsSection
            control={control}
            register={register}
            errors={errors}
            setValue={setValue}
            setError={setError}
            clearErrors={clearErrors}
            costCenterOptions={costCenterOptions}
            initialPixKey={initialExpenseReport?.pix_key}
          />

          <RequesterSection
            control={control}
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
            users={users}
            initialRegistered={!!initialExpenseReport?.requester_user_id}
          />

          <ExpenseItemsSection
            fields={fields}
            control={control}
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
            costCenterOptions={costCenterOptions}
            categoryOptions={categoryOptions}
            geolocationEnabled={geolocationEnabled}
            itemFiles={itemFiles}
            existingAttachments={existingAttachments}
            onAddExpenseItem={addExpenseItem}
            onRemoveExpenseItem={removeExpenseItem}
            onAddFile={addFile}
            onRemoveFile={removeFile}
          />

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
