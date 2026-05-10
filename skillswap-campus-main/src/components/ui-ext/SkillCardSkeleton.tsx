import { Card } from "@/components/ui/card";

export function SkillCardSkeleton() {
  return (
    <Card className="p-5 rounded-3xl border-border/60 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-16 rounded-full bg-muted" />
        <div className="h-3 w-8 rounded bg-muted" />
      </div>
      <div className="h-5 w-3/4 rounded bg-muted mb-2" />
      <div className="h-3 w-full rounded bg-muted mb-1.5" />
      <div className="h-3 w-2/3 rounded bg-muted mb-5" />
      <div className="flex items-center justify-between pt-4 border-t border-border/60">
        <div className="h-3 w-20 rounded bg-muted" />
        <div className="h-4 w-12 rounded bg-muted" />
      </div>
    </Card>
  );
}

export function SkillCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => <SkillCardSkeleton key={i} />)}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i} className="p-5 rounded-3xl border-border/60 animate-pulse">
          <div className="h-4 w-24 rounded bg-muted mb-3" />
          <div className="h-5 w-1/2 rounded bg-muted mb-2" />
          <div className="h-3 w-2/3 rounded bg-muted" />
        </Card>
      ))}
    </div>
  );
}