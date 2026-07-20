"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "@phosphor-icons/react";
import Button from "@/ui/Button";
import Modal from "@/ui/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingContext";
import { useCostCentersLookup } from "@/features/cost-center/cost-center.hooks";
import { useExpenseCategoriesLookup } from "@/features/expense-category/expense-category.hooks";
import { useUsersLookup } from "@/features/user/user.hooks";
import {
  storeReimbursementWithDespesasFormSchema,
  type Reimbursement,
  type StoreReimbursementWithDespesasFormData,
} from "../reimbursement.types";
import { type TipoChavePix, inferirTipoChavePix } from "@/lib/pix";
import { toast } from "@/lib/toast";
import { formatarData, formatarMoeda } from "@/lib/formatters";
import RequestDetailsSection from "./form/RequestDetailsSection";
import RequesterSection from "./form/RequesterSection";
import ExpenseItemsSection from "./form/ExpenseItemsSection";

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
  const { data: costCenters = [] } = useCostCentersLookup();
  const { data: categories = [] } = useExpenseCategoriesLookup();
  const { data: users = [] } = useUsersLookup();
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
          ? `Report - ${formatarData(new Date().toISOString())}`
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
  const formattedTotal = formatarMoeda(totalAmount);

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
          <RequestDetailsSection
            control={control}
            register={register}
            errors={errors}
            setValue={setValue}
            setError={setError}
            clearErrors={clearErrors}
            costCenterOptions={costCenterOptions}
            showBankDetails={showBankDetails}
            setShowBankDetails={setShowBankDetails}
            pixKeyType={pixKeyType}
            setPixKeyType={setPixKeyType}
          />

          <RequesterSection
            control={control}
            register={register}
            errors={errors}
            users={users}
            requesterUserId={requesterUserId ?? ""}
            registeredEmployee={registeredEmployee}
            onToggleEmployee={handleToggleEmployee}
            onSelectEmployee={handleSelectEmployee}
          />

          <ExpenseItemsSection
            fields={fields}
            control={control}
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
            categoryOptions={categoryOptions}
            costCenterOptions={costCenterOptions}
            geolocationEnabled={geolocationEnabled}
            initialReimbursement={initialReimbursement}
            attachmentsToAdd={attachmentsToAdd}
            attachmentsToDelete={attachmentsToDelete}
            onAddItem={addItem}
            onRemoveItem={handleRemoveItem}
            markDeleteAttachment={markDeleteAttachment}
            undoDeleteAttachment={undoDeleteAttachment}
            markAddAttachment={markAddAttachment}
            cancelAddAttachment={cancelAddAttachment}
          />

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
