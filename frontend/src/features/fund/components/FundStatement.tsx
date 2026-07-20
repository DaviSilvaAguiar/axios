"use client";

import { useState } from "react";
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
  FUND_STATUS_CLOSED,
  FUND_TIPO_LABEL,
  SUBTYPE_LABEL,
  TIPO_TRANSACAO_CREDIT,
  type LancarAjusteFormData,
  type LancarCreditoFormData,
  type TransacaoExtrato,
} from "../fund.types";
import { useFundStatement, useFundMutations } from "../fund.hooks";
import PostCreditModal from "./PostCreditModal";
import PostAdjustmentModal from "./PostAdjustmentModal";

interface Props {
  fundId: number;
}

export default function FundStatement({ fundId }: Props) {
  const router = useRouter();
  const { data, isLoading: loading } = useFundStatement(fundId);
  const { close, postCredit, postAdjustment } = useFundMutations();
  const [showCredit, setShowCredit] = useState(false);
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [showClose, setShowClose] = useState(false);

  async function handleCredit(values: LancarCreditoFormData) {
    await postCredit.mutateAsync({ id: fundId, data: values });
    setShowCredit(false);
    toast.success("Advance posted!");
  }

  async function handleAdjustment(values: LancarAjusteFormData) {
    await postAdjustment.mutateAsync({ id: fundId, data: values });
    setShowAdjustment(false);
    toast.success("Adjustment posted!");
  }

  async function handleClose() {
    try {
      await close.mutateAsync(fundId);
      toast.success("Fund closed!");
      router.push("/funds");
    } catch {
      toast.error("Could not close the fund. Check the balance.");
    } finally {
      setShowClose(false);
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

  const { fund: fund, transactions: transactions } = data;
  const balance = Number(fund.balance);
  const closed = fund.status === FUND_STATUS_CLOSED;

  const columns: DataTableColumn<TransacaoExtrato>[] = [
    {
      key: "date",
      header: "Date",
      render: (t) => (
        <span className="text-small text-app-text-muted whitespace-nowrap">
          {formatarData(t.transaction_date)}
        </span>
      ),
    },
    {
      key: "type",
      header: "Transaction",
      render: (t) => (
        <span className="text-app-text font-medium">{SUBTYPE_LABEL[t.subtype]}</span>
      ),
    },
    {
      key: "reference",
      header: "Reference",
      render: (t) => {
        if (t.expense_report_id && t.caixa) {
          return (
            <Link
              href={`/expense-reports?id=${t.expense_report_id}`}
              className="text-small font-semibold text-brand hover:underline"
            >
              Report #{t.expense_report_id} — {t.caixa.description}
            </Link>
          );
        }
        return (
          <span className="text-small text-app-text-muted">
            {t.notes ?? t.reason ?? "—"}
          </span>
        );
      },
    },
    {
      key: "credit",
      header: "Credit",
      align: "right",
      render: (t) => (
        <span className="text-small text-emerald-600 whitespace-nowrap">
          {t.transaction_type === TIPO_TRANSACAO_CREDIT ? formatarMoeda(Number(t.amount)) : "—"}
        </span>
      ),
    },
    {
      key: "debit",
      header: "Debit",
      align: "right",
      render: (t) => (
        <span className="text-small text-red-600 whitespace-nowrap">
          {t.transaction_type !== TIPO_TRANSACAO_CREDIT ? formatarMoeda(Number(t.amount)) : "—"}
        </span>
      ),
    },
    {
      key: "balance",
      header: "Balance",
      align: "right",
      render: (t) => (
        <span className="text-small font-semibold text-app-text whitespace-nowrap">
          {formatarMoeda(Number(t.accumulated_balance))}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-4 p-6">
        <button
          type="button"
          onClick={() => router.push("/funds")}
          className="flex w-fit items-center gap-1.5 text-caption text-app-text-muted hover:text-app-text"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <Card>
          <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-caption text-app-text-muted">
                #{fund.id} · {FUND_TIPO_LABEL[fund.type]}
                {closed && " · Closed"}
              </span>
              <h1 className="text-feature-title text-app-text">{fund.description}</h1>
              <span className="text-small text-app-text-muted">
                {fund.user?.name} · {fund.cost_center?.description}
              </span>
            </div>

            <div className="flex flex-col items-start md:items-end">
              <span className="text-caption text-app-text-muted">Current Balance</span>
              <span className="text-2xl font-semibold text-app-text">
                {formatarMoeda(balance)}
              </span>
            </div>
          </div>

          {!closed && (
            <div className="flex flex-wrap gap-2 border-t border-app-border px-5 py-3">
              <Button variant="dark" size="sm" onClick={() => setShowCredit(true)}>
                <Plus size={14} />
                Post Advance
              </Button>
              <Button variant="light" size="sm" onClick={() => setShowAdjustment(true)}>
                <Scales size={14} />
                Post Adjustment
              </Button>
              <Button
                variant="outlined"
                size="sm"
                onClick={() => setShowClose(true)}
                disabled={balance !== 0}
                title={balance !== 0 ? "The fund can only be closed with a balance of $0.00" : undefined}
              >
                <Lock size={14} />
                Close Fund
              </Button>
            </div>
          )}
        </Card>

        <Card>
          <div className="p-5">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                <ArrowUUpLeft size={20} className="text-app-text-subtle" />
                <p className="text-small text-app-text-subtle">
                  No transactions yet. Start with an advance.
                </p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                rows={transactions}
                keyExtractor={(t) => t.id}
              />
            )}
          </div>
        </Card>
      </div>

      <AnimatePresence>
        {showCredit && (
          <PostCreditModal
            onSave={handleCredit}
            onClose={() => setShowCredit(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdjustment && (
          <PostAdjustmentModal
            onSave={handleAdjustment}
            onClose={() => setShowAdjustment(false)}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        open={showClose}
        title="Close fund?"
        description="Once closed, the fund will no longer accept new transactions."
        confirmLabel="Close Fund"
        loading={close.isPending}
        onConfirm={handleClose}
        onCancel={() => setShowClose(false)}
      />
    </>
  );
}
