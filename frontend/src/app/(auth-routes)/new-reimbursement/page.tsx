"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { toast } from "@/lib/toast";
import Button from "@/ui/Button";
import FormRcm from "@/features/rcm/components/FormRcm";
import {
  criarRcmApi,
  criarDespesaRcmApi,
} from "@/features/rcm/rcm.api";
import type { StoreRcmWithDespesasFormData } from "@/features/rcm/rcm.types";
import type { AnexoParaAdicionar, AnexoParaDeletar } from "@/features/rcm/components/FormRcm";

export default function NovoReembolsoPage() {
  const router = useRouter();
  const [sucesso, setSucesso] = useState(false);

  async function handleSalvar(
    dados: StoreRcmWithDespesasFormData,
    _deletarDespesaIds: number[],
    _deletarAnexos: AnexoParaDeletar[],
    _adicionarAnexos: AnexoParaAdicionar[]
  ) {
    try {
      const { despesas, ...rcmDados } = dados;
      const { rcm } = await criarRcmApi(rcmDados);

      for (const despesa of despesas) {
        const fd = new FormData();
        fd.append("data_despesa", despesa.data_despesa);
        fd.append("valor", despesa.valor);
        fd.append("id_centro_custo", despesa.id_centro_custo);
        fd.append("descricao", despesa.descricao);
        if (despesa.id_categoria_despesa) fd.append("id_categoria_despesa", despesa.id_categoria_despesa);
        if (despesa.latitude  != null) fd.append("latitude",  String(despesa.latitude));
        if (despesa.longitude != null) fd.append("longitude", String(despesa.longitude));
        if (despesa.endereco) fd.append("endereco", despesa.endereco);
        if (despesa.descricao_fornecedor) fd.append("descricao_fornecedor", despesa.descricao_fornecedor);
        if (despesa.cpf_cnpj_fornecedor) fd.append("cpf_cnpj_fornecedor", despesa.cpf_cnpj_fornecedor.replace(/\D/g, ""));
        if (despesa.id_fornecedor) fd.append("id_fornecedor", despesa.id_fornecedor);
        const files = (despesa.anexo as File[] | undefined) ?? [];
        files.forEach((f) => fd.append("anexos[]", f));
        await criarDespesaRcmApi(rcm.id, fd);
      }

      setSucesso(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao lançar gastos.");
    }
  }

  if (sucesso) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 py-16 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex h-28 w-28 items-center justify-center rounded-full bg-green-100 mb-8"
        >
          <CheckCircle size={64} weight="fill" className="text-green-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="space-y-3 max-w-xs"
        >
          <p className="text-section-heading text-app-text">Tudo certo!</p>
          <p className="text-body-sm text-app-text-muted">
            Suas notas foram enviadas para o financeiro.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.28 }}
          className="flex flex-col gap-3 w-full max-w-xs mt-10"
        >
          <Button variant="dark" fullWidth onClick={() => setSucesso(false)}>
            Lançar mais gastos
          </Button>
          <Button variant="light" fullWidth onClick={() => router.push("/meus-reembolsos")}>
            Ver minhas prestações
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-app-bg">
      {/* Header fixo */}
      <div className="sticky top-0 z-10 bg-app-bg/95 backdrop-blur-sm border-b border-app-border-subtle">
        <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
          <button
            onClick={() => router.push("/meus-reembolsos")}
            className="flex items-center justify-center rounded-xl p-1.5 text-app-text-muted hover:bg-app-hover hover:text-app-text transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-feature-title text-app-text">Lançar Gastos</h1>
        </div>
      </div>

      {/* Formulário em modo página (sem modal) */}
      <div className="max-w-2xl mx-auto">
        <FormRcm
          pageMode
          onSalvar={handleSalvar}
          onFechar={() => router.push("/meus-reembolsos")}
        />
      </div>
    </div>
  );
}
