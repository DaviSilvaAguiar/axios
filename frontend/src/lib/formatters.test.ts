import { describe, it, expect } from "vitest";
import {
  formatarData,
  formatarDataCurta,
  valorParaApi,
  formatarCpfCnpj,
  nomeArquivo,
} from "./formatters";

describe("formatarData", () => {
  it("keeps the calendar day for a UTC midnight timestamp", () => {
    expect(formatarData("2026-08-20T00:00:00+00:00")).toBe("20/08/2026");
  });

  it("does not shift the day for any date-only value in the year", () => {
    const samples = ["2026-01-01", "2026-03-15", "2026-08-20", "2026-12-31"];

    for (const day of samples) {
      const [year, month, date] = day.split("-");
      expect(formatarData(`${day}T00:00:00+00:00`)).toBe(`${date}/${month}/${year}`);
    }
  });

  it("renders a dash for empty values", () => {
    expect(formatarData(null)).toBe("—");
    expect(formatarData(undefined)).toBe("—");
    expect(formatarData("")).toBe("—");
  });
});

describe("formatarDataCurta", () => {
  it("keeps the calendar day", () => {
    expect(formatarDataCurta("2026-08-20T00:00:00+00:00")).toBe("20/08");
  });
});

describe("valorParaApi", () => {
  it("normalizes brazilian formatting to an ISO decimal string", () => {
    expect(valorParaApi("1.234,56")).toBe("1234.56");
    expect(valorParaApi("1234,56")).toBe("1234.56");
  });

  it("passes ISO input through unchanged", () => {
    expect(valorParaApi("1234.56")).toBe("1234.56");
    expect(valorParaApi(1234.56)).toBe("1234.56");
  });

  it("falls back to zero for unusable input", () => {
    expect(valorParaApi("")).toBe("0.00");
    expect(valorParaApi("abc")).toBe("0.00");
  });
});

describe("formatarCpfCnpj", () => {
  it("masks a CPF", () => {
    expect(formatarCpfCnpj("12345678901")).toBe("123.456.789-01");
  });

  it("masks a CNPJ", () => {
    expect(formatarCpfCnpj("12345678000199")).toBe("12.345.678/0001-99");
  });

  it("returns the input untouched when the length does not match", () => {
    expect(formatarCpfCnpj("123")).toBe("123");
  });
});

describe("nomeArquivo", () => {
  it("takes the last path segment", () => {
    expect(nomeArquivo("expense-report-attachments/12/abc.pdf")).toBe("abc.pdf");
  });
});
