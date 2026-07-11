"use client";

import Link from "next/link";
import Card from "@/ui/Card";

interface Props {
  label: string;
  value: string;
  href?: string;
}

export default function KpiCard({ label, value, href }: Props) {
  const inner = (
    <Card className="p-5 transition-colors hover:bg-app-surface-raised/40">
      <p className="text-caption text-app-text-muted uppercase tracking-wide mb-2">
        {label}
      </p>
      <p className="text-3xl font-semibold text-app-text">{value}</p>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block cursor-pointer">
        {inner}
      </Link>
    );
  }

  return inner;
}
