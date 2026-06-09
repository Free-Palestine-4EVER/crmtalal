import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-700 bg-ink-850/40 px-6 py-14 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-ink-800 text-gold-500">
          <Icon className="h-6 w-6" />
        </span>
      )}
      <h3 className="text-base font-semibold text-parch-50">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-ink-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
