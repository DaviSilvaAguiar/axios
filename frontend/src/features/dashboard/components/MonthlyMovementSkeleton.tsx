import Card from "@/ui/Card";

export default function MonthlyMovementSkeleton() {
  const bars = Array.from({ length: 12 });

  return (
    <Card className="p-5">
      <div className="h-3 w-40 rounded bg-app-surface-raised animate-pulse mb-4" />
      <div className="flex h-[200px] items-end gap-2">
        {bars.map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t bg-app-surface-raised animate-pulse ${i >= 6 ? "hidden md:block" : ""}`}
            style={{ height: `${30 + ((i * 37) % 70)}%` }}
          />
        ))}
      </div>
    </Card>
  );
}
