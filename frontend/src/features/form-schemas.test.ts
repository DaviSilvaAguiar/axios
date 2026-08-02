import { describe, it, expect } from "vitest";

import { buildCostCenterFormSchema } from "./cost-center/cost-center.types";
import { buildExpenseCategoryFormSchema } from "./expense-category/expense-category.types";
import { loginFormSchema } from "./auth/auth.types";
import { postCreditFormSchema, postAdjustmentFormSchema } from "./fund/fund.types";
import { updateReimbursementStatusFormSchema } from "./reimbursement/reimbursement.types";

describe("cost center form schema", () => {
  it("requires a description", () => {
    const result = buildCostCenterFormSchema(false).safeParse({ description: "", active: true });
    expect(result.success).toBe(false);
  });

  it("only requires the ERP code when the setting is enabled", () => {
    const withoutErp = { description: "General", active: true };

    expect(buildCostCenterFormSchema(false).safeParse(withoutErp).success).toBe(true);
    expect(buildCostCenterFormSchema(true).safeParse(withoutErp).success).toBe(false);
    expect(
      buildCostCenterFormSchema(true).safeParse({ ...withoutErp, erp_code: "CC1" }).success
    ).toBe(true);
  });
});

describe("expense category form schema", () => {
  it("mirrors the cost center ERP rule", () => {
    const withoutErp = { description: "Fuel", active: true };

    expect(buildExpenseCategoryFormSchema(false).safeParse(withoutErp).success).toBe(true);
    expect(buildExpenseCategoryFormSchema(true).safeParse(withoutErp).success).toBe(false);
  });
});

describe("login form schema", () => {
  it("rejects an empty submission", () => {
    expect(loginFormSchema.safeParse({}).success).toBe(false);
  });

  it("accepts a complete submission", () => {
    const result = loginFormSchema.safeParse({
      company: "admin",
      email: "user@test.com",
      password: "secret123",
      remember_me: false,
    });
    expect(result.success).toBe(true);
  });
});

describe("fund posting schemas", () => {
  it("requires amount and date on a credit", () => {
    expect(postCreditFormSchema.safeParse({ amount: "", transaction_date: "" }).success).toBe(false);
    expect(
      postCreditFormSchema.safeParse({ amount: "50.00", transaction_date: "2026-07-15" }).success
    ).toBe(true);
  });

  it("requires a reason on an adjustment", () => {
    const base = { subtype: "4", amount: "10.00", transaction_date: "2026-07-15" };

    expect(postAdjustmentFormSchema.safeParse({ ...base, reason: "" }).success).toBe(false);
    expect(postAdjustmentFormSchema.safeParse({ ...base, reason: "Correction" }).success).toBe(true);
  });
});

describe("reimbursement status schema", () => {
  it("accepts a scheduled payment date", () => {
    const result = updateReimbursementStatusFormSchema.safeParse({
      status: 5,
      scheduled_payment_date: "2026-08-20",
    });
    expect(result.success).toBe(true);
  });
});
