"use client";

import { useState } from "react";
import Input from "@/ui/Input";
import Combobox from "@/ui/Combobox";
import Checkbox from "@/ui/Checkbox";
import { maskCpfCnpj } from "@/lib/masks";
import { useActiveSuppliers } from "../supplier.hooks";

interface Props {
  idSupplier: string;
  descricaoSupplier: string;
  cpfCnpjSupplier: string;
  onChange: (campos: {
    supplier_id: string;
    descricao_supplier: string;
    cpf_cnpj_supplier: string;
  }) => void;
  errors?: {
    descricao_supplier?: string;
    cpf_cnpj_supplier?: string;
  };
  className?: string;
}

export default function SupplierSection({
  idSupplier,
  descricaoSupplier,
  cpfCnpjSupplier,
  onChange,
  errors,
  className = "",
}: Props) {
  const { data: suppliers = [] } = useActiveSuppliers();
  const [useRegistered, setUseRegistered] = useState<boolean>(!!idSupplier);

  function handleToggle(flag: boolean) {
    setUseRegistered(flag);
    if (!flag) {
      onChange({
        supplier_id: "",
        descricao_supplier: descricaoSupplier,
        cpf_cnpj_supplier: cpfCnpjSupplier,
      });
    }
  }

  function handleSelectRegistered(idStr: string) {
    const s = suppliers.find((x) => String(x.id) === idStr);
    onChange({
      supplier_id: idStr,
      descricao_supplier: s?.description ?? "",
      cpf_cnpj_supplier: s?.tax_id ?? "",
    });
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-caption font-semibold text-app-text-muted uppercase tracking-wide">
          Supplier
        </span>
        <Checkbox
          checked={useRegistered}
          onChange={handleToggle}
          label="Registered Supplier"
          className={`rounded-full px-3 py-1.5 border transition-all duration-200 ${
            useRegistered
              ? "bg-brand/8 border-brand/20"
              : "bg-app-surface-raised border-app-border"
          }`}
        />
      </div>

      {useRegistered ? (
        <div className="flex flex-col gap-1.5">
          <Combobox
            options={suppliers.map((s) => ({
              value: String(s.id),
              label: s.description,
            }))}
            value={idSupplier}
            onChange={handleSelectRegistered}
            placeholder="Select the supplier"
            emptyMessage="No registered suppliers."
            className="w-full"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Legal name / Name"
            placeholder="Supplier name"
            value={descricaoSupplier}
            onChange={(e) =>
              onChange({
                supplier_id: "",
                descricao_supplier: e.target.value,
                cpf_cnpj_supplier: cpfCnpjSupplier,
              })
            }
            error={errors?.descricao_supplier}
          />
          <Input
            label="CPF / CNPJ"
            placeholder="000.000.000-00"
            value={cpfCnpjSupplier}
            onChange={(e) =>
              onChange({
                supplier_id: "",
                descricao_supplier: descricaoSupplier,
                cpf_cnpj_supplier: maskCpfCnpj(e.target.value),
              })
            }
            error={errors?.cpf_cnpj_supplier}
          />
        </div>
      )}
    </div>
  );
}
