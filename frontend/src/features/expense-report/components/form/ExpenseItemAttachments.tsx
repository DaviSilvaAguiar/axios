"use client";

import { useRef } from "react";
import { Plus, X, Paperclip } from "@phosphor-icons/react";
import { nomeArquivo } from "@/lib/formatters";
import type { AnexoCaixa } from "../../expense-report.types";

interface Props {
  existingAttachments: AnexoCaixa[];
  files: File[];
  onAddFile: (file: File) => void;
  onRemoveFile: (fileIdx: number) => void;
}

export default function ExpenseItemAttachments({ existingAttachments, files, onAddFile, onRemoveFile }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="space-y-2">
      <label className="text-caption font-semibold text-app-text-muted">
        Attachments
      </label>

      {existingAttachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center gap-2 rounded-lg border border-app-border-subtle bg-app-surface/60 px-3 py-2"
        >
          <Paperclip size={14} className="text-app-text-subtle shrink-0" />
          <span className="flex-1 truncate text-small text-app-text-muted">
            {nomeArquivo(attachment.path)}
          </span>
        </div>
      ))}

      {files.map((file, fileIdx) => (
        <div
          key={fileIdx}
          className="flex items-center gap-2 rounded-lg border border-app-border-subtle bg-app-surface px-3 py-2"
        >
          <Paperclip size={14} className="text-app-text-muted shrink-0" />
          <span className="flex-1 truncate text-small text-app-text">
            {file.name}
          </span>
          <button
            type="button"
            onClick={() => onRemoveFile(fileIdx)}
            className="text-app-text-subtle hover:text-red-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 text-caption font-semibold text-brand hover:opacity-80 transition-opacity"
      >
        <Plus size={14} />
        Add attachment
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onAddFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
