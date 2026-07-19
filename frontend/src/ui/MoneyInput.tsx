"use client";

import { forwardRef, useState, useCallback } from "react";
import { CurrencyDollar } from "@phosphor-icons/react";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function parseCents(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  return parseInt(digits || "0", 10);
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function centsToDecimalString(cents: number): string {
  return (cents / 100).toFixed(2);
}

const MoneyInput = forwardRef<HTMLInputElement, Props>(
  ({ label, value, onChange, onBlur, error, placeholder = "R$ 0,00", disabled, className = "" }, ref) => {
    const cents = Math.round(parseFloat(value || "0") * 100);
    const [focused, setFocused] = useState(false);

    const displayValue = cents === 0 ? "" : formatCurrency(cents);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        const current = Math.round(parseFloat(value || "0") * 100);

        if (e.key === "Backspace") {
          e.preventDefault();
          onChange(centsToDecimalString(Math.floor(current / 10)));
          return;
        }

        if (e.key >= "0" && e.key <= "9") {
          e.preventDefault();
          const next = current * 10 + parseInt(e.key, 10);
          if (next > 9_999_999_99) return;
          onChange(centsToDecimalString(next));
          return;
        }
      },
      [value, onChange]
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = Math.min(parseCents(e.target.value), 9_999_999_99);
        onChange(centsToDecimalString(next));
      },
      [onChange]
    );

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <label className="text-caption font-semibold text-app-text-muted">
          {label}
        </label>
        <div
          className={`flex h-12 items-center gap-2 rounded-xl border px-3 transition-colors ${
            error
              ? "border-red-400 bg-app-surface"
              : focused
              ? "border-brand bg-app-surface"
              : "border-app-border bg-app-surface"
          }`}
        >
          <CurrencyDollar
            size={16}
            weight="bold"
            className={focused ? "text-brand" : "text-app-text-subtle"}
          />
          <input
            ref={ref}
            type="text"
            inputMode="numeric"
            value={displayValue}
            placeholder={focused ? "R$ 0,00" : placeholder}
            disabled={disabled}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              onBlur?.();
            }}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            className="w-full bg-transparent text-body-sm text-app-text outline-none placeholder:text-app-text-subtle disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        {error && (
          <p className="text-small text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

MoneyInput.displayName = "MoneyInput";

export default MoneyInput;
