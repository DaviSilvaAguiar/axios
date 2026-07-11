"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowUUpLeft, Lock, Plus, Scales } from "@phosphor-icons/react";
import Button from "@/ui/Button";
import Card from "@/ui/Card";
import Loading from "@/ui/Loading";
import ConfirmModal from "@/ui/ConfirmModal";
import DataTable, { type DataTableColumn } from "@/ui/DataTable";
import { toast } from "@/lib/toast";
import { formatarData, formatarMoeda } from "@/lib/formatters";
import {
  CAIXA_CONTA_STATUS_FECHADO,
  CAIXA_CONTA_TIPO_LABEL,
  SUBTIPO_LABEL,
  TIPO_TRANSACAO_CREDITO,
  type ExtratoResponse,
  type LancarAjusteFormData,
  type LancarCreditoFormData,
  type TransacaoExtrato,
} from "../caixa-conta.types";
import {
  extratoCaixaContaApi,
  fecharCaixaContaApi,
  lancarAjusteApi,
  lancarCreditoApi,
} from "../caixa-conta.api";
import ModalLancarCredito from "./ModalLancarCredito";
import ModalLancarAjuste from "./ModalLancarAjuste";

interface Props {
  idCaixa: number;
}

export default function ExtratoCaixa({ idCaixa }: Props) {
  const router = useRouter();
  const [data, setData] = useState<ExtratoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCredito, setShowCredito] = useState(false);
  const [showAjuste, setShowAjuste] = useState(false);
  const [showFechar, setShowFechar] = useState(false);
  const [fechando, setFechando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setData(await extratoCaixaContaApi(idCaixa));
    } catch {
      toast.error("Não foi possível carregar o extrato.");
    } finally {
      setLoading(false);
    }
  }, [idCaixa]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleCredito(dados: LancarCreditoFormData) {
    await lancarCreditoApi(idCaixa, dados);
    setShowCredito(false);
    toast.success("Adiantamento lançado!");
    await carregar();
  }

  async function handleAjuste(dados: LancarAjusteFormData) {
    await lancarAjusteApi(idCaixa, dados);
    setShowAjuste(false);
    toast.success("Ajuste lançado!");
    await carregar();
  }

  async function handleFechar() {
    setFechando(true);
    try {
      await fecharCaixaContaApi(idCaixa);
      toast.success("Caixa fechado!");
      router.push("/caixas");
    } catch {
      toast.error("Não foi possível fechar o caixa. Verifique o saldo.");
    } finally {
      setFechando(false);
      setShowFechar(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <Loading />
      </div>
    );
  }

  if (!data) return null;

  const { caixa_conta: caixa, transacoes } = data;
  const saldo = Number(caixa.saldo);
  const fechado = caixa.status === CAIXA_CONTA_STATUS_FECHADO;

  const columns: DataTableColumn<TransacaoExtrato>[] = [
    {
      key: "data",
      header: "Data",
      render: (t) => (
        <span className="text-small text-app-text-muted whitespace-nowrap">
          {formatarData(t.data_transacao)}
        </span>
      ),
    },
    {
      key: "tipo",
      header: "Lançamento",
      render: (t) => (
        <span className="text-app-text font-medium">{SUBTIPO_LABEL[t.subtipo]}</span>
      ),
    },
    {
      key: "referencia",
      header: "Referência",
      render: (t) => {
        if (t.id_caixa && t.caixa) {
          return (
            <Link
              href={`/rdc?id=${t.id_caixa}`}
              className="text-small font-semibold text-brand hover:underline"
            >
              RDC #{t.id_caixa} — {t.caixa.descricao}
            </Link>
          );
        }
        return (
          <span className="text-small text-app-text-muted">
            {t.observacao ?? t.motivo ?? "—"}
          </span>
        );
      },
    },
    {
      key: "credito",
      header: "Crédito",
      align: "right",
      render: (t) => (
        <span className="text-small text-emerald-600 whitespace-nowrap">
          {t.tipo_transacao === TIPO_TRANSACAO_CREDITO ? formatarMoeda(Number(t.valor)) : "—"}
        </span>
      ),
    },
    {
      key: "debito",
      header: "Débito",
      align: "right",
      render: (t) => (
        <span className="text-small text-red-600 whitespace-nowrap">
          {t.tipo_transacao !== TIPO_TRANSACAO_CREDITO ? formatarMoeda(Number(t.valor)) : "—"}
        </span>
      ),
    },
    {
      key: "saldo",
      header: "Saldo",
      align: "right",
      render: (t) => (
        <span className="text-small font-semibold text-app-text whitespace-nowrap">
          {formatarMoeda(Number(t.saldo_acumulado))}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-4 p-6">
        <button
          type="button"
          onClick={() => router.push("/caixas")}
          className="flex w-fit items-center gap-1.5 text-caption text-app-text-muted hover:text-app-text"
        >
          <ArrowLeft size={14} />
          Voltar
        </button>

        <Card>
          <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-caption text-app-text-muted">
                #{caixa.id} · {CAIXA_CONTA_TIPO_LABEL[caixa.tipo]}
                {fechado && " · Fechado"}
              </span>
              <h1 className="text-feature-title text-app-text">{caixa.descricao}</h1>
              <span className="text-small text-app-text-muted">
                {caixa.usuario?.nome} · {caixa.centro_de_custo?.descricao}
              </span>
            </div>

            <div className="flex flex-col items-start md:items-end">
              <span className="text-caption text-app-text-muted">Saldo Atual</span>
              <span className="text-2xl font-semibold text-app-text">
                {formatarMoeda(saldo)}
              </span>
            </div>
          </div>

          {!fechado && (
            <div className="flex flex-wrap gap-2 border-t border-app-border px-5 py-3">
              <Button variant="dark" size="sm" onClick={() => setShowCredito(true)}>
                <Plus size={14} />
                Lançar Adiantamento
              </Button>
              <Button variant="light" size="sm" onClick={() => setShowAjuste(true)}>
                <Scales size={14} />
                Lançar Ajuste
              </Button>
              <Button
                variant="outlined"
                size="sm"
                onClick={() => setShowFechar(true)}
                disabled={saldo !== 0}
                title={saldo !== 0 ? "Só é possível fechar com saldo R$ 0,00" : undefined}
              >
                <Lock size={14} />
                Fechar Caixa
              </Button>
            </div>
          )}
        </Card>

        <Card>
          <div className="p-5">
            {transacoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                <ArrowUUpLeft size={20} className="text-app-text-subtle" />
                <p className="text-small text-app-text-subtle">
                  Nenhum lançamento ainda. Comece com um adiantamento.
                </p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                rows={transacoes}
                keyExtractor={(t) => t.id}
              />
            )}
          </div>
        </Card>
      </div>

      <AnimatePresence>
        {showCredito && (
          <ModalLancarCredito
            onSalvar={handleCredito}
            onFechar={() => setShowCredito(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAjuste && (
          <ModalLancarAjuste
            onSalvar={handleAjuste}
            onFechar={() => setShowAjuste(false)}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        open={showFechar}
        title="Fechar caixa?"
        description="Após fechado, o caixa não receberá novos lançamentos."
        confirmLabel="Fechar Caixa"
        loading={fechando}
        onConfirm={handleFechar}
        onCancel={() => setShowFechar(false)}
      />
    </>
  );
}
