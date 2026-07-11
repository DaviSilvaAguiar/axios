"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Receipt, CalendarDots } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/ui/Card";
import Loading from "@/ui/Loading";
import EmptyState from "@/ui/EmptyState";
import Button from "@/ui/Button";
import FormRdc from "@/features/rdc/components/FormRdc";
import StatusTag from "@/features/rdc/components/StatusTag";
import { toast } from "@/lib/toast";
import {
  listarRdcsApi,
  criarRdcApi,
  criarDespesaRdcApi,
  buscarRdcApi,
} from "@/features/rdc/rdc.api";
import {
  RDC_STATUS_LABEL,
  type DespesaRdcFormItem,
  type Rdc,
  type RdcStatus,
  type StoreRdcWithDespesasFormData,
} from "@/features/rdc/rdc.types";

type FiltroStatus = "" | RdcStatus;

const STATUS_CHIPS: { label: string; value: FiltroStatus }[] = [
  { label: "Todos",                     value: "" },
  { label: RDC_STATUS_LABEL[1],         value: 1 },
  { label: RDC_STATUS_LABEL[2],         value: 2 },
  { label: RDC_STATUS_LABEL[3],         value: 3 },
  { label: RDC_STATUS_LABEL[4],         value: 4 },
  { label: RDC_STATUS_LABEL[5],         value: 5 },
  { label: RDC_STATUS_LABEL[6],         value: 6 },
  { label: RDC_STATUS_LABEL[7],         value: 7 },
];

const STATUS_BORDER: Record<number, string> = {
  1: "border-l-blue-400",
  2: "border-l-orange-400",
  3: "border-l-amber-400",
  4: "border-l-green-400",
  5: "border-l-purple-400",
  6: "border-l-app-border",
  7: "border-l-red-400",
};

function fmtValor(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtData(iso: string) {
  const [y, m, d] = iso.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
}

function calcTotal(rdc: Rdc) {
  return (rdc.despesas ?? []).reduce((acc, d) => acc + Number(d.valor ?? 0), 0);
}

function buildDespesaFormData(despesa: DespesaRdcFormItem, arquivos: File[]): FormData {
  const fd = new FormData();
  fd.append("data_despesa", despesa.data_despesa);
  fd.append("valor", despesa.valor);
  fd.append("id_centro_custo", despesa.id_centro_custo);
  fd.append("descricao", despesa.descricao);
  if (despesa.id_categoria_despesa) fd.append("id_categoria_despesa", despesa.id_categoria_despesa);
  if (despesa.latitude != null) fd.append("latitude", String(despesa.latitude));
  if (despesa.longitude != null) fd.append("longitude", String(despesa.longitude));
  if (despesa.endereco) fd.append("endereco", despesa.endereco);
  for (const file of arquivos) fd.append("anexos[]", file);
  return fd;
}

interface RdcCardProps {
  rdc: Rdc;
}

function RdcCard({ rdc }: RdcCardProps) {
  const total = calcTotal(rdc);
  const count = (rdc.despesas ?? []).length;
  const border = STATUS_BORDER[rdc.status] ?? "border-l-app-border";

  return (
    <Link href={`/minha-caixa-de-obra/${rdc.id}`}>
      <motion.div whileTap={{ scale: 0.98 }} transition={{ duration: 0.12 }}>
        <Card className={`p-0 border-l-4 ${border} overflow-hidden hover:shadow-md transition-all cursor-pointer`}>
          <div className="p-4 space-y-2.5">
            <p className="text-body font-semibold text-app-text leading-snug line-clamp-2">
              {rdc.descricao}
            </p>
            <div className="flex items-center justify-between gap-2">
              <StatusTag status={rdc.status} />
              <span className="text-caption text-app-text-subtle shrink-0">
                {fmtData(rdc.created_at)}
              </span>
            </div>
            {rdc.data_inicio_periodo && rdc.data_fim_periodo && (
              <div className="flex items-center gap-1.5 text-small text-app-text-muted">
                <CalendarDots size={13} weight="bold" className="shrink-0" />
                <span>
                  {fmtData(rdc.data_inicio_periodo)} → {fmtData(rdc.data_fim_periodo)}
                </span>
              </div>
            )}
          </div>
          <div className="border-t border-app-border-subtle px-4 py-2.5 flex items-center justify-between bg-app-surface-raised/40">
            <p className="text-body font-bold text-app-text">{fmtValor(total)}</p>
            <span className="text-caption text-app-text-subtle">
              {count} {count === 1 ? "despesa" : "despesas"}
            </span>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}

export default function MinhaCaixaDeObraPage() {
  return (
    <Suspense fallback={<Loading size="sm" />}>
      <MinhaCaixaDeObraContent />
    </Suspense>
  );
}

function MinhaCaixaDeObraContent() {
  const params = useSearchParams();
  const [rdcs, setRdcs] = useState<Rdc[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [statusFiltro, setStatusFiltro] = useState<FiltroStatus>("");
  const [showForm, setShowForm] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await listarRdcsApi();
      setRdcs(data);
    } catch {
      setErro("Não foi possível carregar as caixas de obra.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // Abre o form automaticamente quando vier de /minha-caixa-de-obra?novo=1 (FAB do Prestador)
  useEffect(() => {
    if (params.get("novo") === "1") setShowForm(true);
  }, [params]);

  const rdcsFiltrados = statusFiltro
    ? rdcs.filter((r) => r.status === statusFiltro)
    : rdcs;

  async function handleCriar(dados: StoreRdcWithDespesasFormData, arquivosPorItem: File[][]) {
    let novoId: number | null = null;
    try {
      const { despesas, ...rdcDados } = dados;
      const novo = await criarRdcApi(rdcDados);
      novoId = novo.id;

      for (const [idx, despesa] of (despesas ?? []).entries()) {
        await criarDespesaRdcApi(novo.id, buildDespesaFormData(despesa, arquivosPorItem[idx] ?? []));
      }

      const rdcCompleto = await buscarRdcApi(novo.id);
      setRdcs((prev) => [rdcCompleto, ...prev]);
      setShowForm(false);
      toast.success("Caixa de Obra criada com sucesso!");
    } catch (err) {
      if (novoId !== null) {
        setShowForm(false);
        toast.success("Caixa criada. Atualize se o item não aparecer.");
        carregar();
        return;
      }
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar.");
    }
  }

  return (
    <>
      <div className="flex flex-col min-h-full pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-app-bg/95 backdrop-blur-sm border-b border-app-border-subtle">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <h1 className="text-feature-title text-app-text">Caixa de Obra</h1>
            <button
              onClick={() => setShowForm(true)}
              className="hidden sm:block"
            >
              <Button variant="dark" size="sm">
                <Plus size={14} weight="bold" />
                Nova Caixa
              </Button>
            </button>
          </div>

          {/* Chips de status */}
          <div className="flex gap-2 px-4 sm:px-6 pb-3 overflow-x-auto scrollbar-none">
            {STATUS_CHIPS.map((chip) => (
              <button
                key={chip.value}
                onClick={() => setStatusFiltro(chip.value)}
                className={[
                  "shrink-0 rounded-full px-3.5 py-1.5 text-small font-semibold transition-colors whitespace-nowrap",
                  statusFiltro === chip.value
                    ? "bg-brand text-white"
                    : "bg-app-surface border border-app-border text-app-text-muted hover:border-brand/40 hover:text-app-text",
                ].join(" ")}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 px-4 sm:px-6 pt-4">
          {loading ? (
            <Loading />
          ) : erro ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center">
              <p className="text-small text-red-700">{erro}</p>
              <button
                onClick={carregar}
                className="mt-2 text-caption font-semibold text-brand hover:underline"
              >
                Tentar novamente
              </button>
            </div>
          ) : rdcsFiltrados.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Nenhuma caixa de obra encontrada"
              description={
                statusFiltro
                  ? "Não há registros com esse status."
                  : "Abra sua primeira caixa de obra para registrar despesas."
              }
              action={
                statusFiltro
                  ? { label: "Ver todas", onClick: () => setStatusFiltro("") }
                  : { label: "Nova Caixa", onClick: () => setShowForm(true) }
              }
            />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={statusFiltro}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
              >
                {rdcsFiltrados.map((rdc) => (
                  <RdcCard key={rdc.id} rdc={rdc} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <FormRdc
            onSalvar={handleCriar}
            onFechar={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
