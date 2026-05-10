import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Inbox } from "lucide-react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="p-12 rounded-3xl border-dashed border-border/60 text-center">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-muted grid place-items-center text-muted-foreground mb-4">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <h3 className="font-display font-bold text-lg">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}