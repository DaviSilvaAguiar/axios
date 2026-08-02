import { useCallback, useState } from "react";
import type { ExpenseReportAttachment } from "../expense-report.types";

export function useItemAttachments(initialCount: number, initialAttachments: ExpenseReportAttachment[][]) {
  const [itemFiles, setItemFiles] = useState<File[][]>(
    () => Array.from({ length: initialCount }, () => [])
  );
  const [existingAttachments, setExistingAttachments] = useState<ExpenseReportAttachment[][]>(initialAttachments);

  function addItem() {
    setItemFiles((prev) => [...prev, []]);
    setExistingAttachments((prev) => [...prev, []]);
  }

  function removeItem(idx: number) {
    setItemFiles((prev) => prev.filter((_, i) => i !== idx));
    setExistingAttachments((prev) => prev.filter((_, i) => i !== idx));
  }

  const addFile = useCallback((idx: number, file: File) => {
    setItemFiles((prev) =>
      prev.map((files, i) => (i === idx ? [...files, file] : files))
    );
  }, []);

  const removeFile = useCallback((itemIdx: number, fileIdx: number) => {
    setItemFiles((prev) =>
      prev.map((files, i) =>
        i === itemIdx ? files.filter((_, j) => j !== fileIdx) : files
      )
    );
  }, []);

  return {
    itemFiles,
    existingAttachments,
    addItem,
    removeItem,
    addFile,
    removeFile,
  };
}
