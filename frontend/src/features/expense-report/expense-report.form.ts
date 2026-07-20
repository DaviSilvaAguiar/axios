import type { ExpenseReportItemFormItem } from "./expense-report.types";

export function buildItemFormData(item: ExpenseReportItemFormItem, files: File[]): FormData {
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
  for (const file of files) fd.append("attachments[]", file);
  return fd;
}
