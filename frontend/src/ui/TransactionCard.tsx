import Link from "next/link";
import Card from "@/ui/Card";
import TypeChip from "@/ui/TypeChip";
import StatusTag from "@/ui/StatusTag";
import type { Submission } from "@/features/provider/provider.types";

function formatAmount(amount: string): string {
  return Number(amount).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 60) return diffMin <= 1 ? "just now" : `${diffMin} min ago`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 30) return `${diffD}d ago`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

interface Props {
  submission: Submission;
}

export default function TransactionCard({ submission }: Props) {
  const href =
    submission.type === "expense_report"
      ? `/my-expense-reports/${submission.id}`
      : `/my-reimbursements/${submission.id}`;

  return (
    <Link href={href} className="block">
      <Card className="p-4 hover:border-brand/30 transition-colors min-h-14">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-start gap-2">
            <TypeChip type={submission.type} />
            <p className="text-caption font-semibold text-app-text truncate flex-1">
              {submission.title}
            </p>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-caption font-semibold text-app-text">
              {formatAmount(submission.total_amount)}
            </p>
            <StatusTag type={submission.type} status={submission.status} />
          </div>
          <p className="text-small text-app-text-subtle">
            {formatRelative(submission.created_at)}
          </p>
        </div>
      </Card>
    </Link>
  );
}
