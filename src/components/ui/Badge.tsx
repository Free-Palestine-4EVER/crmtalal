import { cn } from "@/lib/cn";

type Tone =
  | "gold"
  | "neutral"
  | "positive"
  | "caution"
  | "critical"
  | "info"
  | "steel";

const tones: Record<Tone, string> = {
  gold: "bg-gold-500/12 text-gold-300 border-gold-500/25",
  neutral: "bg-ink-700/60 text-parch-100/80 border-ink-600/60",
  positive: "bg-positive/12 text-positive border-positive/25",
  caution: "bg-caution/12 text-caution border-caution/25",
  critical: "bg-critical/12 text-critical border-critical/25",
  info: "bg-info/12 text-info border-info/25",
  steel: "bg-steel-500/15 text-steel-300 border-steel-500/25",
};

export function Badge({
  tone = "neutral",
  className,
  children,
  dot,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export type { Tone as BadgeTone };
