import { describe, it, expect } from "vitest";

import { mapCostCenterList, mapCostCenterResponse } from "./cost-center/cost-center.mapper";
import { mapBankAccountList } from "./bank-account/bank-account.mapper";
import { mapExpenseCategoryList } from "./expense-category/expense-category.mapper";
import { mapSupplierList } from "./supplier/supplier.mapper";
import { mapUserList } from "./user/user.mapper";
import { mapFundList, mapStatementResponse } from "./fund/fund.mapper";
import { mapNominatimResults, mapReverseGeocode } from "./geolocation/geolocation.mapper";

const meta = { current_page: 1, last_page: 1, per_page: 50, total: 1 };

describe("cost-center mapper", () => {
  const valid = {
    data: [{ id: 1, description: "General", erp_code: "CC1", active: true }],
    meta,
  };

  it("parses a valid list payload", () => {
    expect(mapCostCenterList(valid).data[0].description).toBe("General");
  });

  it("rejects a payload missing a required field", () => {
    expect(() => mapCostCenterList({ data: [{ id: 1 }], meta })).toThrow();
  });

  it("rejects a payload with the wrong type", () => {
    expect(() =>
      mapCostCenterList({ data: [{ ...valid.data[0], id: "1" }], meta })
    ).toThrow();
  });

  it("unwraps a single record response", () => {
    expect(mapCostCenterResponse({ data: valid.data[0] }).id).toBe(1);
  });
});

describe("bank-account mapper", () => {
  it("parses a valid list payload", () => {
    const parsed = mapBankAccountList({
      data: [{ id: 3, description: "Main", erp_code: "B1", active: true }],
      meta,
    });
    expect(parsed.data).toHaveLength(1);
  });

  it("rejects a non-array data field", () => {
    expect(() => mapBankAccountList({ data: {}, meta })).toThrow();
  });
});

describe("expense-category mapper", () => {
  it("parses a valid list payload", () => {
    const parsed = mapExpenseCategoryList({
      data: [{ id: 5, description: "Fuel", erp_code: null, active: false }],
      meta,
    });
    expect(parsed.data[0].active).toBe(false);
  });

  it("rejects a null payload", () => {
    expect(() => mapExpenseCategoryList(null)).toThrow();
  });
});

describe("supplier mapper", () => {
  const supplier = {
    id: 9,
    description: "Acme",
    tax_id: "12345678000199",
    person_type: "J",
    email: null,
    phone: null,
    postal_code: null,
    street: null,
    number: null,
    complement: null,
    district: null,
    city: null,
    uf: null,
    erp_code: "S1",
    active: true,
  };

  it("parses a valid list payload", () => {
    expect(mapSupplierList({ data: [supplier], meta }).data[0].tax_id).toBe("12345678000199");
  });

  it("rejects a missing tax_id", () => {
    const { tax_id: _tax_id, ...withoutTaxId } = supplier;
    expect(() => mapSupplierList({ data: [withoutTaxId], meta })).toThrow();
  });

  it("rejects an unknown person_type", () => {
    expect(() => mapSupplierList({ data: [{ ...supplier, person_type: "X" }], meta })).toThrow();
  });
});

describe("user mapper", () => {
  it("parses a valid list payload", () => {
    const parsed = mapUserList({
      data: [
        {
          id: 1,
          role: 1,
          name: "Admin",
          email: "admin@test.com",
          active: true,
          erp_code: null,
          tax_id: null,
          created_at: "2026-07-01T00:00:00+00:00",
          updated_at: "2026-07-01T00:00:00+00:00",
        },
      ],
      meta,
    });
    expect(parsed.data[0].email).toBe("admin@test.com");
  });

  it("rejects a role sent as a string", () => {
    expect(() =>
      mapUserList({
        data: [
          {
            id: 1,
            role: "1",
            name: "Admin",
            email: "admin@test.com",
            active: true,
            erp_code: null,
            tax_id: null,
            created_at: "2026-07-01T00:00:00+00:00",
            updated_at: "2026-07-01T00:00:00+00:00",
          },
        ],
        meta,
      })
    ).toThrow();
  });
});

describe("fund mapper", () => {
  const fund = {
    id: 2,
    user_id: 1,
    cost_center_id: 3,
    description: "Site fund",
    balance: "1000.00",
    type: 1,
    status: 1,
    bank: null,
    branch: null,
    account_number: null,
    pix_key: null,
    paid_at: null,
    created_at: "2026-07-01T00:00:00+00:00",
    updated_at: "2026-07-01T00:00:00+00:00",
  };

  it("parses a valid list payload", () => {
    expect(mapFundList({ data: [fund] })[0].balance).toBe("1000.00");
  });

  it("rejects an out-of-range status", () => {
    expect(() => mapFundList({ data: [{ ...fund, status: 9 }] })).toThrow();
  });

  it("parses a statement payload using the expense_report key", () => {
    const parsed = mapStatementResponse({
      data: {
        fund,
        transactions: [
          {
            id: 1,
            transaction_date: "2026-07-15T00:00:00+00:00",
            transaction_type: 2,
            subtype: 2,
            amount: "50.00",
            notes: null,
            reason: null,
            expense_report_id: 7,
            expense_report: { id: 7, description: "Report" },
            accumulated_balance: "950.00",
          },
        ],
      },
    });

    expect(parsed.transactions[0].expense_report?.description).toBe("Report");
  });

  it("rejects the legacy caixa key shape", () => {
    expect(() =>
      mapStatementResponse({
        data: {
          fund,
          transactions: [
            {
              id: 1,
              transaction_date: "2026-07-15T00:00:00+00:00",
              transaction_type: 2,
              subtype: 2,
              amount: "50.00",
              expense_report_id: 7,
              expense_report: { id: 7 },
              accumulated_balance: "950.00",
            },
          ],
        },
      })
    ).toThrow();
  });
});

describe("geolocation mapper", () => {
  it("keeps only well formed nominatim results", () => {
    const parsed = mapNominatimResults([
      { lat: "-23.5", lon: "-46.6", display_name: "Sao Paulo" },
      { lat: -23.5, lon: -46.6, display_name: "Wrong types" },
      null,
    ]);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].display_name).toBe("Sao Paulo");
  });

  it("returns an empty list when the payload is not an array", () => {
    expect(mapNominatimResults({})).toEqual([]);
  });

  it("tolerates a reverse geocode response without display_name", () => {
    expect(mapReverseGeocode({}).display_name).toBeUndefined();
    expect(mapReverseGeocode({ display_name: "Rua A" }).display_name).toBe("Rua A");
  });
});
