"use client";

import { forwardRef, useRef, useState, useCallback, type InputHTMLAttributes } from "react";
import { Paperclip, X, FileText } from "@phosphor-icons/react";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

const AttachmentInput = forwardRef<HTMLInputElement, Props>(function AttachmentInput(
  { label, error, accept, onChange, className = "", ...props },
  ref
) {
  const [fileName, setFileName] = useState<string | null>(null);
  const localRef = useRef<HTMLInputElement>(null);

  const handleTrigger = () => localRef.current?.click();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFileName(e.target.files?.[0]?.name ?? null);
      onChange?.(e);
    },
    [onChange]
  );

  const handleClear = () => {
    if (!localRef.current) return;
    localRef.current.value = "";
    setFileName(null);
    localRef.current.dispatchEvent(new Event("change", { bubbles: true }));
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-caption font-semibold text-app-text-muted">{label}</label>
      )}

      <button
        type="button"
        onClick={handleTrigger}
        className={`flex h-10 w-full items-center gap-2 rounded-xl border px-3 transition-colors ${
          error
            ? "border-red-400 bg-app-surface"
            : fileName
            ? "border-brand/40 bg-app-surface"
            : "border-dashed border-app-border bg-app-surface hover:border-brand/50"
        }`}
      >
        {fileName ? (
          <FileText size={16} weight="light" className="shrink-0 text-brand" />
        ) : (
          <Paperclip size={16} className="shrink-0 text-app-text-subtle" />
        )}

        <span className={`flex-1 truncate text-left text-small ${fileName ? "text-app-text" : "text-app-text-subtle"}`}>
          {fileName ?? "Select a file…"}
        </span>

        {fileName && (
          <span
            role="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleClear();
            }}
            className="rounded-full p-0.5 text-app-text-muted hover:bg-app-hover hover:text-app-text"
          >
            <X size={12} weight="bold" />
          </span>
        )}
      </button>

      <input
        ref={(node) => {
          localRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="sr-only"
        {...props}
      />

      {error && <p className="text-small text-red-600">{error}</p>}
    </div>
  );
});

AttachmentInput.displayName = "AttachmentInput";

export default AttachmentInput;
