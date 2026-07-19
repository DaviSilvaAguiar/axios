"use client";

import { forwardRef, useCallback } from "react";
import { maskCpfCnpj } from "@/lib/masks";

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

const TaxIdInput = forwardRef<HTMLInputElement, Props>(function TaxIdInput(
  { label, value, onChange, onBlur, error, placeholder = "CPF or CNPJ", disabled, className = "" },
  ref
) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(maskCpfCnpj(e.target.value));
    },
    [onChange]
  );

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-caption font-semibold text-app-text-muted">{label}</label>
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleChange}
        onBlur={onBlur}
        className={`w-full rounded-xl py-3.5 pl-3 pr-3 text-body-sm outline-none transition-colors duration-200 bg-app-surface border text-app-text placeholder:text-app-text-subtle focus:border-brand ${
          error ? "border-red-400" : "border-app-border"
        }`}
      />
      {error && <p className="text-small text-red-500">{error}</p>}
    </div>
  );
});

export default TaxIdInput;
