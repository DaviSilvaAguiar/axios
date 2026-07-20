import {
  createReimbursementItemApi,
  updateReimbursementItemApi,
  deleteReimbursementItemApi,
  adicionarAnexoReimbursementApi,
  deleteAnexoEspecificoReimbursementApi,
} from "./reimbursement.api";
import type { StoreReimbursementWithDespesasFormData } from "./reimbursement.types";
import type { AttachmentToAdd, AttachmentToDelete } from "./components/FormReimbursement";

type ReimbursementFormItem = StoreReimbursementWithDespesasFormData["items"][number];

export function buildReimbursementItemFormData(item: ReimbursementFormItem): FormData {
  const fd = new FormData();
  fd.append("expense_date", item.expense_date);
  fd.append("amount", item.amount);
  fd.append("cost_center_id", item.cost_center_id);
  fd.append("description", item.description);
  if (item.expense_category_id) fd.append("expense_category_id", item.expense_category_id);
  if (item.latitude != null) fd.append("latitude", String(item.latitude));
  if (item.longitude != null) fd.append("longitude", String(item.longitude));
  if (item.address) fd.append("address", item.address);
  if (item.description_supplier) fd.append("description_supplier", item.description_supplier);
  if (item.supplier_tax_id) fd.append("supplier_tax_id", item.supplier_tax_id.replace(/\D/g, ""));
  if (item.supplier_id) fd.append("supplier_id", item.supplier_id);
  const files = (item.anexo as File[] | undefined) ?? [];
  files.forEach((f) => fd.append("attachments[]", f));
  return fd;
}

export async function persistReimbursementItems(
  reimbursementId: number,
  items: ReimbursementFormItem[],
  deleteItemIds: number[],
  deleteAttachments: AttachmentToDelete[],
  addAttachments: AttachmentToAdd[],
): Promise<void> {
  for (const id of deleteItemIds) {
    await deleteReimbursementItemApi(reimbursementId, id);
  }

  for (const { itemId, attachmentId } of deleteAttachments) {
    await deleteAnexoEspecificoReimbursementApi(reimbursementId, itemId, attachmentId);
  }

  for (const { itemId, file } of addAttachments) {
    await adicionarAnexoReimbursementApi(reimbursementId, itemId, file);
  }

  for (const item of items) {
    if (item.itemId) {
      await updateReimbursementItemApi(reimbursementId, item.itemId, {
        expense_date: item.expense_date,
        amount: item.amount,
        cost_center_id: item.cost_center_id,
        description: item.description,
        expense_category_id: item.expense_category_id || undefined,
        latitude: item.latitude ?? null,
        longitude: item.longitude ?? null,
        address: item.address ?? null,
        description_supplier: item.description_supplier || undefined,
        supplier_tax_id: item.supplier_tax_id || undefined,
        supplier_id: item.supplier_id || undefined,
      });
    } else {
      await createReimbursementItemApi(reimbursementId, buildReimbursementItemFormData(item));
    }
  }
}
