"use client";

import { useEffect, useState } from "react";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "@phosphor-icons/react";
import Input from "@/ui/Input";
import InputCpfCnpj from "@/ui/InputCpfCnpj";
import Button from "@/ui/Button";
import BadgeAtivo from "@/ui/BadgeAtivo";
import Combobox, { type ComboboxOption } from "@/ui/Combobox";
import TabModulosUsuario from "./TabModulosUsuario";
import {
  criarUsuarioFormSchema,
  editarUsuarioFormSchema,
  type CriarUsuarioFormData,
  type EditarUsuarioFormData,
  type Usuario,
} from "../usuario.types";

const PERFIS_OPTIONS: ComboboxOption[] = [
  { value: "1", label: "Admin" },
  { value: "2", label: "Gestor" },
  { value: "3", label: "Prestador" },
];

interface Props {
  usuario?: Usuario;
  onSalvar: (dados: CriarUsuarioFormData | EditarUsuarioFormData) => Promise<void>;
  onCancelar: () => void;
}

export default function FormUsuario({ usuario, onSalvar, onCancelar }: Props) {
  const isEdicao = !!usuario;
  const isAdmin = usuario?.perfil === 1;
  const podeEditarModulos = isEdicao && !isAdmin;
  const schema = isEdicao ? editarUsuarioFormSchema : criarUsuarioFormSchema;

  const [aba, setAba] = useState<"dados" | "modulos">("dados");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CriarUsuarioFormData | EditarUsuarioFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      perfil: usuario?.perfil ?? 3,
      nome: usuario?.nome ?? "",
      email: usuario?.email ?? "",
      senha: "",
      ativo: usuario?.ativo ?? true,
      codigo_credor_erp: usuario?.codigo_credor_erp ?? "",
      cpf_cnpj: usuario?.cpf_cnpj ?? "",
    },
  });

  const { field: perfilField } = useController({ name: "perfil", control });
  const { field: cpfCnpjField } = useController({ name: "cpf_cnpj", control });

  useEffect(() => {
    reset({
      perfil: usuario?.perfil ?? 3,
      nome: usuario?.nome ?? "",
      email: usuario?.email ?? "",
      senha: "",
      ativo: usuario?.ativo ?? true,
      codigo_credor_erp: usuario?.codigo_credor_erp ?? "",
      cpf_cnpj: usuario?.cpf_cnpj ?? "",
    });
  }, [usuario, reset]);

  const ativo = watch("ativo");

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-feature-title text-app-text">
          {isEdicao ? "Editar Usuário" : "Novo Usuário"}
        </h2>
        <button
          onClick={onCancelar}
          className="text-app-text-muted hover:text-app-text transition-colors"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>
      </div>

      {podeEditarModulos && (
        <div className="flex gap-1 mb-5 border-b border-app-border">
          {(["dados", "modulos"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setAba(t)}
              className={[
                "px-3 py-2 text-caption font-semibold transition-colors border-b-2 -mb-px",
                aba === t
                  ? "border-brand text-brand"
                  : "border-transparent text-app-text-muted hover:text-app-text",
              ].join(" ")}
            >
              {t === "dados" ? "Dados" : "Módulos"}
            </button>
          ))}
        </div>
      )}

      {podeEditarModulos && aba === "modulos" ? (
        <TabModulosUsuario usuarioId={usuario!.id} />
      ) : (
      <form onSubmit={handleSubmit(onSalvar)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-caption font-semibold text-app-text-muted">Perfil</label>
          <Combobox
            options={PERFIS_OPTIONS}
            value={String(perfilField.value ?? 3)}
            onChange={(v) => {
              if (v) perfilField.onChange(Number(v));
            }}
            placeholder="Selecione o perfil"
            searchPlaceholder="Buscar perfil…"
            className="w-full"
          />
          {"perfil" in errors && errors.perfil && (
            <p className="text-small text-red-500">{errors.perfil.message}</p>
          )}
        </div>

        <Input
          label="Nome"
          placeholder="Nome completo"
          error={"nome" in errors ? errors.nome?.message : undefined}
          {...register("nome")}
        />

        <Input
          label="E-mail"
          type="email"
          placeholder="email@exemplo.com"
          error={"email" in errors ? errors.email?.message : undefined}
          {...register("email")}
        />

        <Input
          label={isEdicao ? "Nova senha (deixe em branco para não alterar)" : "Senha"}
          type="password"
          placeholder={isEdicao ? "••••••••" : "Mínimo 8 caracteres"}
          error={"senha" in errors ? errors.senha?.message : undefined}
          {...register("senha")}
        />

        <InputCpfCnpj
          label="CPF / CNPJ"
          value={cpfCnpjField.value ?? ""}
          onChange={cpfCnpjField.onChange}
          onBlur={cpfCnpjField.onBlur}
          error={"cpf_cnpj" in errors ? errors.cpf_cnpj?.message : undefined}
        />

        <Input
          label="Código Credor no ERP"
          placeholder="Código de integração"
          error={"codigo_credor_erp" in errors ? errors.codigo_credor_erp?.message : undefined}
          {...register("codigo_credor_erp")}
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

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="light" size="sm" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button type="submit" variant="dark" size="sm" disabled={isSubmitting}>
            {isSubmitting ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </form>
      )}
    </div>
  );
}
