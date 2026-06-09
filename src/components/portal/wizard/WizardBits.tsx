"use client";

import { motion } from "framer-motion";
import { Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/* ============================================================
   Animated stepper header — numbered steps + gold progress bar
   ============================================================ */
export type WizardStep = { id: number; label: string; icon: LucideIcon };

export function Stepper({
  steps,
  current,
  onJump,
}: {
  steps: WizardStep[];
  /** zero-based index of the active step */
  current: number;
  /** allow jumping back to an already-visited step */
  onJump?: (index: number) => void;
}) {
  const pct = steps.length > 1 ? (current / (steps.length - 1)) * 100 : 0;

  return (
    <div className="mb-7">
      {/* track + nodes */}
      <div className="relative">
        {/* base line — uses inset-inline so it flips for RTL automatically */}
        <div className="absolute inset-x-5 top-5 h-px bg-ink-700/70" aria-hidden />
        <motion.div
          className="absolute start-5 top-5 h-px origin-[inset-inline-start] bg-gradient-to-r from-gold-500 to-gold-400 shadow-[0_0_12px_rgba(180,138,50,0.5)]"
          aria-hidden
          initial={false}
          animate={{ width: `calc(${pct}% - ${pct === 0 ? 0 : 40}px)` }}
          transition={{ type: "spring", stiffness: 220, damping: 30 }}
          style={{ insetInlineStart: "1.25rem" }}
        />

        <ol className="relative flex items-start justify-between">
          {steps.map((s, i) => {
            const done = i < current;
            const active = i === current;
            const reachable = i <= current;
            const Icon = s.icon;
            return (
              <li
                key={s.id}
                className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center"
              >
                <button
                  type="button"
                  disabled={!reachable || !onJump}
                  onClick={() => reachable && onJump?.(i)}
                  className={cn(
                    "relative grid h-10 w-10 place-items-center rounded-full border text-sm font-semibold transition-colors duration-300",
                    reachable && onJump && "cursor-pointer",
                    active &&
                      "border-gold-500 bg-gold-500/15 text-gold-300 shadow-[0_0_0_4px_rgba(180,138,50,0.12)]",
                    done &&
                      "border-gold-500/60 bg-gold-500 text-ink-950",
                    !active &&
                      !done &&
                      "border-ink-700 bg-ink-850 text-ink-500",
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    >
                      <Check className="h-[18px] w-[18px]" />
                    </motion.span>
                  ) : active ? (
                    <Icon className="h-[18px] w-[18px]" />
                  ) : (
                    <span className="nums">{i + 1}</span>
                  )}
                </button>
                <span
                  className={cn(
                    "line-clamp-2 text-[0.7rem] font-medium leading-tight transition-colors sm:text-xs",
                    active
                      ? "text-cream-50"
                      : done
                        ? "text-parch-100/70"
                        : "text-ink-500",
                  )}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/* ============================================================
   Selectable card (icon + label) — used for the property grid
   ============================================================ */
export function SelectCard({
  label,
  icon: Icon,
  selected,
  onClick,
}: {
  label: string;
  icon?: LucideIcon;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group relative flex flex-col items-center gap-2.5 rounded-2xl border p-4 text-center transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]",
        selected
          ? "border-gold-500/70 bg-maroon-600/15 ring-2 ring-gold-500/40 shadow-[0_8px_30px_-14px_rgba(180,138,50,0.6)]"
          : "border-ink-700 bg-ink-850/50 hover:border-gold-500/40 hover:bg-ink-800/60",
      )}
    >
      {Icon && (
        <span
          className={cn(
            "grid h-11 w-11 place-items-center rounded-xl transition-colors",
            selected
              ? "bg-gold-500/15 text-gold-300"
              : "bg-ink-800 text-ink-400 group-hover:text-gold-400",
          )}
        >
          <Icon className="h-[20px] w-[20px]" />
        </span>
      )}
      <span
        className={cn(
          "text-[0.82rem] font-medium leading-tight transition-colors",
          selected ? "text-cream-50" : "text-parch-100/80",
        )}
      >
        {label}
      </span>
      {selected && (
        <motion.span
          layoutId="prop-check"
          className="absolute end-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-gold-500 text-ink-950"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <Check className="h-3 w-3" strokeWidth={3} />
        </motion.span>
      )}
    </button>
  );
}

/* ============================================================
   Selectable chip (text only) — purposes / priorities
   ============================================================ */
export function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97]",
        selected
          ? "border-gold-500/70 bg-maroon-600/20 text-cream-50 ring-2 ring-gold-500/40"
          : "border-ink-700 bg-ink-850/50 text-parch-100/75 hover:border-gold-500/40 hover:text-cream-50",
      )}
    >
      {label}
    </button>
  );
}

/* ============================================================
   Review summary row (definition list item)
   ============================================================ */
export function ReviewRow({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-ink-800/70 py-2.5 last:border-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="shrink-0 text-xs font-medium uppercase tracking-wide text-ink-500">
        {label}
      </dt>
      <dd className="min-w-0 text-sm text-cream-50 sm:text-end">
        {value || <span className="text-ink-600">—</span>}
      </dd>
    </div>
  );
}
