import type { LucideIcon } from "lucide-react";

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3.5">
        {Icon && (
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-maroon-600/15 text-gold-400 ring-1 ring-maroon-600/30">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div>
          <h1 className="text-xl font-semibold text-cream-50 sm:text-2xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
