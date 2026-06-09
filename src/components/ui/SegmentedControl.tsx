"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export type SegmentOption<V extends string = string> = {
  value: V;
  label: React.ReactNode;
  count?: number;
};

export type SegmentedControlProps<V extends string = string> = {
  options: SegmentOption<V>[];
  value: V;
  onChange: (value: V) => void;
  className?: string;
};

export function SegmentedControl<V extends string = string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<V>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-ink-700 bg-ink-850/70 p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500",
              active ? "text-cream-50" : "text-parch-100/70 hover:text-parch-50",
            )}
          >
            {active && (
              <motion.span
                layoutId="segmented-active"
                className="absolute inset-0 rounded-full bg-maroon-600 shadow-[0_8px_22px_-12px_rgba(127,24,54,0.9)] ring-1 ring-gold-500/30"
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <span className="relative">{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={cn(
                  "nums relative rounded-full px-1.5 py-0.5 text-[0.7rem] font-semibold",
                  active
                    ? "bg-cream-50/15 text-cream-50"
                    : "bg-ink-700/70 text-parch-100/70",
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
