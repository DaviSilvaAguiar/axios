"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Key } from "@phosphor-icons/react";
import Modal from "@/ui/Modal";
import Button from "@/ui/Button";
import Input from "@/ui/Input";
import { toast } from "@/lib/toast";
import { salvarChaveFormSchema, type SalvarChaveForm, type Integracao } from "../integracao.types";
import { salvarChaveIntegracaoApi } from "../integracao.api";

interface Props {
  integracao: Integracao;
  onFechar: () => void;
  onSalvo: () => void;
}

export default function ModalChaveIntegracao({ integracao, onFechar, onSalvo }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SalvarChaveForm>({
    resolver: zodResolver(salvarChaveFormSchema),
    defaultValues: { chave: "" },
  });

  async function onSubmit(dados: SalvarChaveForm) {
    try {
      await salvarChaveIntegracaoApi(integracao.id, dados.chave);
      toast.success("Chave da integração salva com sucesso.");
      onSalvo();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar a chave.");
    }
  }

  return (
    <Modal open onClose={onFechar} className="max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5">
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/[0.08]">
              <Key size={18} weight="duotone" className="text-brand" />
            </div>
            <div className="flex flex-col gap-0.5">
              <h1 className="text-feature-title text-app-text">Configurar token</h1>
              <p className="text-small text-app-text-muted">{integracao.nome}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="rounded-full p-2 text-app-text-muted hover:bg-app-hover"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <Input
            label="Token de autenticação"
            type="text"
            placeholder="Cole o token fornecido pela integração"
            autoComplete="off"
            spellCheck={false}
            error={errors.chave?.message}
            {...register("chave")}
          />
          <p className="text-small text-app-text-subtle">
            O token é criptografado antes de ser armazenado no banco.
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="light" fullWidth onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="submit" variant="dark" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
