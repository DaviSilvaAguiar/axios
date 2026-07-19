"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "@phosphor-icons/react";
import Modal from "@/ui/Modal";
import Button from "@/ui/Button";
import Input from "@/ui/Input";
import Combobox from "@/ui/Combobox";
import { toast } from "@/lib/toast";
import { maskAgencia, maskBanco, maskConta } from "@/lib/masks";
import { EMAIL_REGEX } from "@/lib/validators";
import {
  type TipoChavePix,
  TIPO_CHAVE_PIX_OPTIONS,
  TIPO_CHAVE_PIX_PLACEHOLDER,
  aplicarMascaraChavePix,
  isTipoChavePix,
} from "@/lib/pix";
import {
  storeCaixaContaFormSchema,
  CAIXA_CONTA_TIPO_LABEL,
  type StoreCaixaContaFormData,
} from "../caixa-conta.types";
import { listarUsuariosApi } from "@/features/usuario/usuario.api";
import { listarCentrosDeCustoApi } from "@/features/centro-de-custo/centro-de-custo.api";
import type { Usuario } from "@/features/auth/auth.types";
import type { CentroDeCusto } from "@/features/centro-de-custo/centro-de-custo.types";

interface Props {
  onSalvar: (dados: StoreCaixaContaFormData) => Promise<void>;
  onFechar: () => void;
}

export default function FormCaixaConta({ onSalvar, onFechar }: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [centros, setCentros] = useState<CentroDeCusto[]>([]);
  const [tipoChavePix, setTipoChavePix] = useState<TipoChavePix | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<StoreCaixaContaFormData>({
    resolver: zodResolver(storeCaixaContaFormSchema),
    defaultValues: {
      id_usuario: "",
      id_centro_custo: "",
      descricao: "",
      tipo: "1",
      banco: "",
      agencia: "",
      numero_banco: "",
      chave_pix: "",
    },
  });

  useEffect(() => {
    listarUsuariosApi(1, 200)
      .then((r) => setUsuarios(r.data.filter((u) => u.ativo)))
      .catch(() => toast.error("Não foi possível carregar usuários."));
    listarCentrosDeCustoApi(1, 200)
      .then((r) => setCentros(r.data.filter((c) => c.ativo)))
      .catch(() => toast.error("Não foi possível carregar centros de custo."));
  }, []);

  const idUsuario = watch("id_usuario");
  const idCentro = watch("id_centro_custo");
  const tipo = watch("tipo");
  const descricao = watch("descricao");

  async function onSubmit(dados: StoreCaixaContaFormData) {
    if (tipoChavePix === "email" && dados.chave_pix && !EMAIL_REGEX.test(dados.chave_pix ?? "")) {
      setError("chave_pix", { message: "Informe um e-mail válido" });
      return;
    }
    try {
      await onSalvar(dados);
    } catch {
      toast.error("Não foi possível criar o caixa.");
    }
  }

  return (
    <Modal open onClose={onFechar}>
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5">
        <div className="mb-5 flex items-start justify-between">
          <h1 className="text-feature-title text-app-text">Novo Caixa</h1>
          <button
            type="button"
            onClick={onFechar}
            className="rounded-full p-2 text-app-text-muted hover:bg-app-hover"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-caption font-semibold text-app-text-muted">Responsável</label>
            <Combobox
              options={usuarios.map((u) => ({ value: String(u.id), label: u.nome }))}
              value={idUsuario}
              onChange={(v) => setValue("id_usuario", v, { shouldValidate: true })}
              placeholder="Selecione o responsável"
            />
            {errors.id_usuario && (
              <p className="text-small text-red-600">{errors.id_usuario.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-caption font-semibold text-app-text-muted">Centro de Custo</label>
            <Combobox
              options={centros.map((c) => ({ value: String(c.id), label: c.descricao }))}
              value={idCentro}
              onChange={(v) => setValue("id_centro_custo", v, { shouldValidate: true })}
              placeholder="Selecione o centro de custo"
            />
            {errors.id_centro_custo && (
              <p className="text-small text-red-600">{errors.id_centro_custo.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Input
              label="Descrição"
              placeholder='Ex.: "Caixa Obra DPW - Nov/2026"'
              maxLength={100}
              error={errors.descricao?.message}
              {...register("descricao")}
            />
            <p className={`text-small text-right ${(descricao?.length ?? 0) >= 100 ? "text-red-500" : "text-app-text-muted"}`}>
              {descricao?.length ?? 0}/100
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-caption font-semibold text-app-text-muted">Tipo</label>
            <Combobox
              options={Object.entries(CAIXA_CONTA_TIPO_LABEL).map(([value, label]) => ({
                value,
                label,
              }))}
              value={tipo}
              onChange={(v) => setValue("tipo", v, { shouldValidate: true })}
              placeholder="Selecione o tipo"
            />
            {errors.tipo && <p className="text-small text-red-600">{errors.tipo.message}</p>}
          </div>

          <details className="rounded-2xl border border-app-border bg-app-surface-raised/40 p-4">
            <summary className="cursor-pointer text-caption font-semibold text-app-text-muted">
              Dados bancários (opcional)
            </summary>
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Controller
                  name="banco"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Banco"
                      placeholder="Ex: 341"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(maskBanco(e.target.value))}
                      onBlur={field.onBlur}
                      error={errors.banco?.message}
                    />
                  )}
                />
                <Controller
                  name="agencia"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Agência"
                      placeholder="Ex: 0001-0"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(maskAgencia(e.target.value))}
                      onBlur={field.onBlur}
                      error={errors.agencia?.message}
                    />
                  )}
                />
                <Controller
                  name="numero_banco"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Conta"
                      placeholder="Ex: 12345-6"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(maskConta(e.target.value))}
                      onBlur={field.onBlur}
                      error={errors.numero_banco?.message}
                    />
                  )}
                />
              </div>

              {/* Chave PIX — tipo + valor */}
              <div className="flex flex-col gap-1.5">
                <label className="text-caption font-semibold text-app-text-muted">Chave Pix</label>
                <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2">
                  <Combobox
                    options={TIPO_CHAVE_PIX_OPTIONS}
                    value={tipoChavePix ?? ""}
                    onChange={(v) => {
                      setTipoChavePix(isTipoChavePix(v) ? v : null);
                      setValue("chave_pix", "", { shouldValidate: false });
                      clearErrors("chave_pix");
                    }}
                    placeholder="Selecione o tipo"
                  />
                  <Controller
                    name="chave_pix"
                    control={control}
                    render={({ field }) => (
                      <div className="relative flex-1">
                        <input
                          className={`h-10 w-full rounded-xl px-3 text-body-sm border text-app-text placeholder:text-app-text-subtle outline-none transition-colors duration-200 ${
                            tipoChavePix
                              ? "bg-app-surface border-app-border focus:border-brand"
                              : "bg-app-surface/50 border-app-border cursor-not-allowed text-app-text-muted"
                          } ${field.value ? "pr-8" : ""}`}
                          placeholder={tipoChavePix ? TIPO_CHAVE_PIX_PLACEHOLDER[tipoChavePix] : "Selecione o tipo primeiro"}
                          disabled={!tipoChavePix}
                          value={field.value ?? ""}
                          onChange={(e) => tipoChavePix && field.onChange(aplicarMascaraChavePix(e.target.value, tipoChavePix))}
                          onBlur={() => {
                            field.onBlur();
                            if (tipoChavePix === "email" && field.value) {
                              if (!EMAIL_REGEX.test(field.value)) {
                                setError("chave_pix", { message: "Informe um e-mail válido" });
                              } else {
                                clearErrors("chave_pix");
                              }
                            }
                          }}
                        />
                        {field.value && (
                          <button
                            type="button"
                            onClick={() => {
                              field.onChange("");
                              setTipoChavePix(null);
                              clearErrors("chave_pix");
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-app-text-muted hover:bg-app-hover hover:text-app-text"
                          >
                            <X size={12} weight="bold" />
                          </button>
                        )}
                      </div>
                    )}
                  />
                </div>
                {errors.chave_pix && (
                  <p className="text-small text-red-500">{errors.chave_pix.message}</p>
                )}
              </div>
            </div>
          </details>
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="light" fullWidth onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="submit" variant="dark" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "Salvando…" : "Criar Caixa"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
