"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import MobileScreen from "@/ui/MobileScreen";
import LancamentoCard from "@/ui/LancamentoCard";
import Button from "@/ui/Button";
import Loading from "@/ui/Loading";
import FabActionSheet from "@/ui/FabActionSheet";
import { listarLancamentosApi } from "@/features/prestador/prestador.api";
import type { Lancamento, FiltroTipo } from "@/features/prestador/prestador.types";

const CHIPS: { label: string; value: FiltroTipo }[] = [
  { label: "Todos", value: "todos" },
  { label: "Caixa", value: "rdc" },
  { label: "Reembolso", value: "rcm" },
];

const EMPTY: Record<FiltroTipo, string> = {
  todos: "Nenhum lançamento ainda.",
  rdc: "Nenhum lançamento de Caixa ainda.",
  rcm: "Nenhum reembolso ainda.",
};

const PER_PAGE = 15;

function parseFiltro(value: string | null): FiltroTipo {
  if (value === "rdc" || value === "rcm") return value;
  return "todos";
}

export default function MeusLancamentosPage() {
  return (
    <Suspense fallback={<MobileScreen><Loading size="sm" /></MobileScreen>}>
      <MeusLancamentosContent />
    </Suspense>
  );
}

function MeusLancamentosContent() {
  const params = useSearchParams();
  const router = useRouter();
  const filtro = parseFiltro(params.get("tipo"));

  const [items, setItems] = useState<Lancamento[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const carregar = useCallback(async (pagina: number, append: boolean) => {
    if (append) setLoadingMore(true); else setLoading(true);
    try {
      const res = await listarLancamentosApi(filtro, pagina, PER_PAGE);
      setItems((prev) => (append ? [...prev, ...res.data] : res.data));
      setPage(pagina);
      setLastPage(res.meta.last_page);
    } finally {
      if (append) setLoadingMore(false); else setLoading(false);
    }
  }, [filtro]);

  useEffect(() => {
    void carregar(1, false);
  }, [carregar]);

  function trocarFiltro(novo: FiltroTipo): void {
    const qs = novo === "todos" ? "" : `?tipo=${novo}`;
    router.replace(`/meus-lancamentos${qs}`);
  }

  const hasMore = page < lastPage;

  return (
    <MobileScreen>
      <div className="flex items-center justify-between mb-4 gap-3">
        <h1
          className="text-app-text font-semibold tracking-tight"
          style={{ fontSize: "28px", lineHeight: "1.1" }}
        >
          Meus lançamentos
        </h1>
        <motion.button
          onClick={() => setSheetOpen(true)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          className="hidden md:inline-flex items-center gap-2 rounded-xl bg-app-text text-app-surface px-4 py-2.5 text-caption font-semibold hover:opacity-90"
        >
          <motion.span
            initial={false}
            animate={sheetOpen ? { rotate: 45 } : { rotate: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            className="inline-flex"
          >
            <Plus size={16} weight="bold" />
          </motion.span>
          Novo lançamento
        </motion.button>
      </div>

      <div className="flex gap-2 mb-4">
        {CHIPS.map((c) => {
          const active = filtro === c.value;
          return (
            <button
              key={c.value}
              onClick={() => trocarFiltro(c.value)}
              className={`px-3.5 py-2 rounded-full text-caption font-medium min-h-11 ${
                active
                  ? "bg-app-text text-app-surface"
                  : "bg-app-surface border border-app-border text-app-text-muted"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <Loading size="sm" />
      ) : items.length === 0 ? (
        <p className="text-body-sm text-app-text-muted py-10 text-center">
          {EMPTY[filtro]}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((l) => (
            <LancamentoCard key={`${l.tipo}-${l.id}`} lancamento={l} />
          ))}
          {hasMore && (
            <Button
              variant="outlined"
              fullWidth
              disabled={loadingMore}
              onClick={() => { void carregar(page + 1, true); }}
            >
              {loadingMore ? "Carregando…" : "Carregar mais"}
            </Button>
          )}
        </div>
      )}
      <FabActionSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </MobileScreen>
  );
}
