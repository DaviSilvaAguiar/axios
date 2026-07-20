"use client";

import Card from "@/ui/Card";

export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/[0.08]">
          <Icon size={18} weight="duotone" className="text-brand" />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-caption text-app-text-muted">{label}</span>
          <span className="text-feature-title text-app-text leading-tight truncate">{value}</span>
          {hint && <span className="text-small text-app-text-subtle font-normal">{hint}</span>}
        </div>
      </div>
    </Card>
  );
}
