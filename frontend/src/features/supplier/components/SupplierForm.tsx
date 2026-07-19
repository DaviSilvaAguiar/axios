"use client";

import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/ui/Input";
import BadgeAtivo from "@/ui/BadgeAtivo";
import InputCpfCnpj from "@/ui/InputCpfCnpj";
import ModalForm from "@/ui/ModalForm";
import { apenasDigitos, maskCpfCnpj } from "@/lib/masks";
import { toast } from "@/lib/toast";
import { useConfigs } from "@/contexts/ConfigContext";
import {
  buildFornecedorFormSchema,
  type Fornecedor,
  type FornecedorFormData,
  type TipoPessoa,
} from "../fornecedor.types";
import { consultarCnpjApi } from "../fornecedor.api";

interface Props {
  fornecedor?: Fornecedor;
  onSalvar: (dados: FornecedorFormData) => Promise<void>;
  onCancelar: () => void;
}

export default function FormFornecedor({ fornecedor, onSalvar, onCancelar }: Props) {
  const { isHabilitada } = useConfigs();
  const codigoErpObrigatorio = isHabilitada("obrigatorio_codigo_erp");
  const schema = useMemo(
    () => buildFornecedorFormSchema(codigoErpObrigatorio),
    [codigoErpObrigatorio],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FornecedorFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      descricao:    fornecedor?.descricao ?? "",
      cpf_cnpj:     fornecedor ? maskCpfCnpj(fornecedor.cpf_cnpj) : "",
      tipo_pessoa:  fornecedor?.tipo_pessoa ?? "J",
      email:        fornecedor?.email ?? "",
      telefone:     fornecedor?.telefone ?? "",
      cep:          fornecedor?.cep ?? "",
      logradouro:   fornecedor?.logradouro ?? "",
      numero:       fornecedor?.numero ?? "",
      complemento:  fornecedor?.complemento ?? "",
      bairro:       fornecedor?.bairro ?? "",
      cidade:       fornecedor?.cidade ?? "",
      uf:           fornecedor?.uf ?? "",
      codigo_erp:   fornecedor?.codigo_erp ?? "",
      ativo:        fornecedor?.ativo ?? true,
    },
  });

  const ultimoCnpjConsultado = useRef<string>(fornecedor?.cpf_cnpj ?? "");

  useEffect(() => {
    ultimoCnpjConsultado.current = fornecedor?.cpf_cnpj ?? "";
    reset({
      descricao:    fornecedor?.descricao ?? "",
      cpf_cnpj:     fornecedor ? maskCpfCnpj(fornecedor.cpf_cnpj) : "",
      tipo_pessoa:  fornecedor?.tipo_pessoa ?? "J",
      email:        fornecedor?.email ?? "",
      telefone:     fornecedor?.telefone ?? "",
      cep:          fornecedor?.cep ?? "",
      logradouro:   fornecedor?.logradouro ?? "",
      numero:       fornecedor?.numero ?? "",
      complemento:  fornecedor?.complemento ?? "",
      bairro:       fornecedor?.bairro ?? "",
      cidade:       fornecedor?.cidade ?? "",
      uf:           fornecedor?.uf ?? "",
      codigo_erp:   fornecedor?.codigo_erp ?? "",
      ativo:        fornecedor?.ativo ?? true,
    });
  }, [fornecedor, reset]);

  const tipoPessoa = watch("tipo_pessoa");
  const cpfCnpj    = watch("cpf_cnpj");
  const ativo      = watch("ativo");

  useEffect(() => {
    if (tipoPessoa !== "J") return;

    const digits = apenasDigitos(cpfCnpj);
    if (digits.length !== 14) return;
    if (ultimoCnpjConsultado.current === digits) return;

    ultimoCnpjConsultado.current = digits;
    const toastId = toast.loading("Buscando dados de fornecedor…");

    consultarCnpjApi(digits)
      .then((resultado) => {
        if (!resultado) {
          toast.error("Dados de fornecedor não foram encontrados na receita.", { id: toastId });
          return;
        }
        const atual = getValues();
        const preencherSeVazio = (campo: keyof FornecedorFormData, valor: string | null) => {
          if (valor && !atual[campo]) {
            setValue(campo, valor, { shouldValidate: true });
          }
        };
        preencherSeVazio("descricao",   resultado.descricao);
        preencherSeVazio("email",       resultado.email);
        preencherSeVazio("telefone",    resultado.telefone);
        preencherSeVazio("cep",         resultado.cep);
        preencherSeVazio("logradouro",  resultado.logradouro);
        preencherSeVazio("numero",      resultado.numero);
        preencherSeVazio("complemento", resultado.complemento);
        preencherSeVazio("bairro",      resultado.bairro);
        preencherSeVazio("cidade",      resultado.cidade);
        preencherSeVazio("uf",          resultado.uf);
        toast.success("Dados recebidos com sucesso.", { id: toastId });
      });
  }, [cpfCnpj, tipoPessoa, getValues, setValue]);

  function trocarTipo(novo: TipoPessoa) {
    if (novo === tipoPessoa) return;
    setValue("tipo_pessoa", novo, { shouldValidate: false });
    setValue("cpf_cnpj", "", { shouldValidate: false });
    ultimoCnpjConsultado.current = "";
  }

  function onChangeCpfCnpj(valor: string) {
    const maxDigits = tipoPessoa === "F" ? 11 : 14;
    const digits = apenasDigitos(valor).slice(0, maxDigits);
    setValue("cpf_cnpj", maskCpfCnpj(digits), { shouldValidate: true });
  }

  return (
    <ModalForm
      titulo={fornecedor ? "Editar Fornecedor" : "Novo Fornecedor"}
      onCancelar={onCancelar}
      onSubmit={handleSubmit(onSalvar)}
      submitting={isSubmitting}
    >
      <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-caption font-semibold text-app-text-muted">Tipo de pessoa</span>
            <div className="inline-flex rounded-xl border border-app-border bg-app-surface p-0.5 w-fit">
              {(["J", "F"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => trocarTipo(t)}
                  className={[
                    "rounded-lg px-4 py-[7px] text-body-sm font-medium transition-colors cursor-pointer",
                    tipoPessoa === t
                      ? "bg-brand text-white"
                      : "text-app-text-muted hover:text-app-text",
                  ].join(" ")}
                >
                  {t === "J" ? "Jurídica" : "Física"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <InputCpfCnpj
              label={tipoPessoa === "J" ? "CNPJ" : "CPF"}
              value={cpfCnpj}
              onChange={onChangeCpfCnpj}
              error={errors.cpf_cnpj?.message}
              placeholder={tipoPessoa === "J" ? "00.000.000/0000-00" : "000.000.000-00"}
            />
          </div>
        </div>

        <Input
          label={tipoPessoa === "J" ? "Razão Social" : "Nome"}
          placeholder="Descrição do fornecedor"
          error={errors.descricao?.message}
          {...register("descricao")}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="E-mail"
            type="email"
            placeholder="contato@empresa.com.br"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Telefone"
            placeholder="(00) 00000-0000"
            error={errors.telefone?.message}
            {...register("telefone")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[120px_1fr_120px] gap-4">
          <Input
            label="CEP"
            placeholder="00000000"
            error={errors.cep?.message}
            {...register("cep")}
          />
          <Input
            label="Logradouro"
            placeholder="Rua, avenida…"
            error={errors.logradouro?.message}
            {...register("logradouro")}
          />
          <Input
            label="Número"
            placeholder="123"
            error={errors.numero?.message}
            {...register("numero")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_80px] gap-4">
          <Input
            label="Complemento"
            placeholder="Sala, andar…"
            error={errors.complemento?.message}
            {...register("complemento")}
          />
          <Input
            label="Bairro"
            placeholder="Bairro"
            error={errors.bairro?.message}
            {...register("bairro")}
          />
          <Input
            label="Cidade"
            placeholder="Cidade"
            error={errors.cidade?.message}
            {...register("cidade")}
          />
          <Input
            label="UF"
            placeholder="SP"
            maxLength={2}
            error={errors.uf?.message}
            {...register("uf")}
          />
        </div>

        <Input
          label="Código no ERP"
          placeholder="ID do contato no ERP de destino"
          error={errors.codigo_erp?.message}
          {...register("codigo_erp")}
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-caption font-semibold text-app-text-muted">Status</span>
          <button
            type="button"
            onClick={() => setValue("ativo", !ativo)}
            className="w-fit cursor-pointer transition-opacity hover:opacity-80"
          >
            <BadgeAtivo ativo={ativo} />
          </button>
        </div>

    </ModalForm>
  );
}
