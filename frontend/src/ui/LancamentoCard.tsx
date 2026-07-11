import Link from "next/link";
import Card from "@/ui/Card";
import TipoChip from "@/ui/TipoChip";
import StatusTagGenerico from "@/ui/StatusTagGenerico";
import type { Lancamento } from "@/features/prestador/prestador.types";

function fmtValor(valor: string): string {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function fmtRelativo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 60) return diffMin <= 1 ? "agora há pouco" : `há ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 30) return `há ${diffD}d`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

interface Props {
  lancamento: Lancamento;
}

export default function LancamentoCard({ lancamento }: Props) {
  const href =
    lancamento.tipo === "rdc"
      ? `/minha-caixa-de-obra/${lancamento.id}`
      : `/meus-reembolsos/${lancamento.id}`;

  return (
    <Link href={href} className="block">
      <Card className="p-4 hover:border-brand/30 transition-colors min-h-14">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-start gap-2">
            <TipoChip tipo={lancamento.tipo} />
            <p className="text-caption font-semibold text-app-text truncate flex-1">
              {lancamento.titulo}
            </p>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-caption font-semibold text-app-text">
              {fmtValor(lancamento.valor_total)}
            </p>
            <StatusTagGenerico tipo={lancamento.tipo} status={lancamento.status} />
          </div>
          <p className="text-small text-app-text-subtle">
            {fmtRelativo(lancamento.created_at)}
          </p>
        </div>
      </Card>
    </Link>
  );
}
