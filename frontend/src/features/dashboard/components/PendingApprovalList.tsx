"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "@phosphor-icons/react";
import Card from "@/ui/Card";
import TipoChip from "@/ui/TipoChip";
import { formatarMoeda } from "@/lib/formatters";
import { pendentesAprovacaoApi } from "../dashboard.api";
import type { PendenteAprovacaoItem } from "../dashboard.types";
import ListaSkeleton from "./ListaSkeleton";

export default function PendentesAprovacaoList() {
  const [itens, setItens] = useState<PendenteAprovacaoItem[] | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    pendentesAprovacaoApi()
      .then(setItens)
      .catch(() => setErro(true));
  }, []);

  if (itens === null && !erro) {
    return <ListaSkeleton />;
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-caption text-app-text-muted uppercase tracking-wide">
          Pendentes de aprovação
        </p>
        {itens && itens.length > 0 && (
          <span className="text-small text-app-text-subtle tabular-nums">
            {itens.length}
          </span>
        )}
      </div>

      {erro ? (
        <p className="text-small text-app-text-subtle py-6 text-center">
          Não foi possível carregar.
        </p>
      ) : itens && itens.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
          <CheckCircle size={28} weight="fill" className="text-green-600 dark:text-green-400" />
          <p className="text-small text-app-text">Tudo em dia</p>
          <p className="text-small text-app-text-subtle">
            Nenhum lançamento aguardando sua análise
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-app-border max-h-[18rem] overflow-y-auto">
          {itens?.map((item) => (
            <li key={`${item.tipo}-${item.id}`}>
              <Link
                href={item.tipo === "rdc" ? `/rdc?id=${item.id}` : `/rcm?id=${item.id}`}
                className="flex items-center gap-3 py-3 px-2 rounded-lg cursor-pointer hover:bg-app-surface-raised/30 transition-colors"
              >
                <TipoChip tipo={item.tipo} />
                <div className="flex-1 min-w-0">
                  <p className="text-caption text-app-text truncate">{item.descricao}</p>
                  {item.requisitante && (
                    <p className="text-small text-app-text-subtle truncate">
                      {item.requisitante}
                    </p>
                  )}
                </div>
                <span className="text-caption font-semibold text-app-text shrink-0 tabular-nums">
                  {formatarMoeda(parseFloat(item.valor))}
                </span>
                <ArrowRight size={14} className="shrink-0 text-app-text-subtle" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
