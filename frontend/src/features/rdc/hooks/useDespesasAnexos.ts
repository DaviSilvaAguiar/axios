import { useCallback, useState } from "react";
import type { AnexoCaixa } from "../rdc.types";

/**
 * Gerencia arquivos novos (File[][]) e anexos existentes (AnexoCaixa[][])
 * para o array de despesas do FormRdc.
 */
export function useDespesasAnexos(initialCount: number, initialAnexos: AnexoCaixa[][]) {
  const [itemFiles, setItemFiles] = useState<File[][]>(
    () => Array.from({ length: initialCount }, () => [])
  );
  const [existingAnexos, setExistingAnexos] = useState<AnexoCaixa[][]>(initialAnexos);

  function adicionarItem() {
    setItemFiles((prev) => [...prev, []]);
    setExistingAnexos((prev) => [...prev, []]);
  }

  function removerItem(idx: number) {
    setItemFiles((prev) => prev.filter((_, i) => i !== idx));
    setExistingAnexos((prev) => prev.filter((_, i) => i !== idx));
  }

  const adicionarArquivo = useCallback((idx: number, file: File) => {
    setItemFiles((prev) =>
      prev.map((files, i) => (i === idx ? [...files, file] : files))
    );
  }, []);

  const removerArquivo = useCallback((itemIdx: number, fileIdx: number) => {
    setItemFiles((prev) =>
      prev.map((files, i) =>
        i === itemIdx ? files.filter((_, j) => j !== fileIdx) : files
      )
    );
  }, []);

  return {
    itemFiles,
    existingAnexos,
    adicionarItem,
    removerItem,
    adicionarArquivo,
    removerArquivo,
  };
}
