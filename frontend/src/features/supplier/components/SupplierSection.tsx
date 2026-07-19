"use client";

import { useEffect, useState } from "react";
import Input from "@/ui/Input";
import Combobox from "@/ui/Combobox";
import Checkbox from "@/ui/Checkbox";
import { maskCpfCnpj } from "@/lib/masks";
import { listarFornecedoresAtivosApi } from "../fornecedor.api";
import type { Fornecedor } from "../fornecedor.types";

interface Props {
  idFornecedor: string;
  descricaoFornecedor: string;
  cpfCnpjFornecedor: string;
  onChange: (campos: {
    id_fornecedor: string;
    descricao_fornecedor: string;
    cpf_cnpj_fornecedor: string;
  }) => void;
  errors?: {
    descricao_fornecedor?: string;
    cpf_cnpj_fornecedor?: string;
  };
  className?: string;
}

export default function SecaoFornecedor({
  idFornecedor,
  descricaoFornecedor,
  cpfCnpjFornecedor,
  onChange,
  errors,
  className = "",
}: Props) {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [usarCadastrado, setUsarCadastrado] = useState<boolean>(!!idFornecedor);

  useEffect(() => {
    listarFornecedoresAtivosApi()
      .then(setFornecedores)
      .catch(() => {});
  }, []);

  function handleToggle(flag: boolean) {
    setUsarCadastrado(flag);
    if (!flag) {
      onChange({
        id_fornecedor: "",
        descricao_fornecedor: descricaoFornecedor,
        cpf_cnpj_fornecedor: cpfCnpjFornecedor,
      });
    }
  }

  function handleSelecionarCadastrado(idStr: string) {
    const f = fornecedores.find((x) => String(x.id) === idStr);
    onChange({
      id_fornecedor: idStr,
      descricao_fornecedor: f?.descricao ?? "",
      cpf_cnpj_fornecedor: f?.cpf_cnpj ?? "",
    });
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-caption font-semibold text-app-text-muted uppercase tracking-wide">
          Fornecedor
        </span>
        <Checkbox
          checked={usarCadastrado}
          onChange={handleToggle}
          label="Fornecedor Cadastrado"
          className={`rounded-full px-3 py-1.5 border transition-all duration-200 ${
            usarCadastrado
              ? "bg-brand/8 border-brand/20"
              : "bg-app-surface-raised border-app-border"
          }`}
        />
      </div>

      {usarCadastrado ? (
        <div className="flex flex-col gap-1.5">
          <Combobox
            options={fornecedores.map((f) => ({
              value: String(f.id),
              label: f.descricao,
            }))}
            value={idFornecedor}
            onChange={handleSelecionarCadastrado}
            placeholder="Selecione o fornecedor"
            emptyMessage="Nenhum fornecedor cadastrado."
            className="w-full"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Razão social / Nome"
            placeholder="Nome do fornecedor"
            value={descricaoFornecedor}
            onChange={(e) =>
              onChange({
                id_fornecedor: "",
                descricao_fornecedor: e.target.value,
                cpf_cnpj_fornecedor: cpfCnpjFornecedor,
              })
            }
            error={errors?.descricao_fornecedor}
          />
          <Input
            label="CPF / CNPJ"
            placeholder="000.000.000-00"
            value={cpfCnpjFornecedor}
            onChange={(e) =>
              onChange({
                id_fornecedor: "",
                descricao_fornecedor: descricaoFornecedor,
                cpf_cnpj_fornecedor: maskCpfCnpj(e.target.value),
              })
            }
            error={errors?.cpf_cnpj_fornecedor}
          />
        </div>
      )}
    </div>
  );
}
