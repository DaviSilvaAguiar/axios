import Card from "@/ui/Card";

export default function ListaSkeleton() {
  return (
    <Card className="p-5">
      <div className="h-3 w-32 rounded bg-app-surface-raised animate-pulse mb-4" />
      <div className="divide-y divide-app-border">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between py-3">
            <div className="h-4 w-32 rounded bg-app-surface-raised animate-pulse" />
            <div className="h-4 w-16 rounded bg-app-surface-raised animate-pulse" />
          </div>
        ))}
      </div>
    </Card>
  );
}
