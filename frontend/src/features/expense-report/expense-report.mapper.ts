import { rdcSchema, listExpenseReportsResponseSchema } from "./expense-report.types";
import type { ExpenseReport } from "./expense-report.types";

export function mapListarExpenseReportsResponse(raw: unknown): ExpenseReport[] {
  return listExpenseReportsResponseSchema.parse(raw);
}

export function mapExpenseReportResponse(raw: unknown): ExpenseReport {
  return rdcSchema.parse(raw);
}
