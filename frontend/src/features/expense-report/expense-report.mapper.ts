import { expenseReportResponseSchema, listExpenseReportsResponseSchema } from "./expense-report.types";
import type { ExpenseReport } from "./expense-report.types";

export function mapListarExpenseReportsResponse(raw: unknown): ExpenseReport[] {
  return listExpenseReportsResponseSchema.parse(raw).data;
}

export function mapExpenseReportResponse(raw: unknown): ExpenseReport {
  return expenseReportResponseSchema.parse(raw).data;
}
