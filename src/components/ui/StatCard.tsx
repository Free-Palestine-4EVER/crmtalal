import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Card } from "./Card";

type Tone = "gold" | "maroon" | "neutral" | "positive";

const chipTones: Record<Tone, string> = {
  gold: "bg-gold-500/12 text-gold-300",
  maroon: "bg-maroon-600/25 text-maroon-300",
  neutral: "bg-ink-700/70 text-parch-100/80",
  positive: "bg-positive/12 text-positive",
};

export type StatCardProps = {
  label: React.ReactNode;
  value: React.ReactNode;
  icon?: LucideIcon;
  hint?: React.ReactNode;
  tone?: Tone;
  trend?: { value: string; up?: boolean };
  className?: string;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "neutral",
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink-500">{label}</p>
          <p className="nums mt-2 text-3xl font-semibold tracking-tight text-parch-50">
            {value}
          </p>
        </div>
        {Icon && (
          <span
            className={cn(
              "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
              chipTones[tone],
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>

      {(trend || hint) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                "nums inline-flex items-center gap-0.5 font-medium",
                trend.up ? "text-positive" : "text-critical",
              )}
            >
              {trend.up ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {trend.value}
            </span>
          )}
          {hint && <span className="text-ink-500">{hint}</span>}
        </div>
      )}
    </Card>
  );
}
