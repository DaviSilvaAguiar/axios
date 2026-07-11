import Card from "@/ui/Card";

export default function KpiCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="h-3 w-24 rounded bg-app-surface-raised animate-pulse mb-3" />
      <div className="h-8 w-20 rounded bg-app-surface-raised animate-pulse" />
    </Card>
  );
}
