"use client";

/**
 * Shared dark-theme recharts primitives for the analytics dashboard.
 * Centralizes palette + axis/grid/tooltip styling so every chart reads the same.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ---- Palette (matches globals.css tokens) ---- */
export const CHART = {
  gold: "#c9a24c",
  maroon: "#72142f",
  maroonLight: "#8a2442",
  steel: "#5f7689",
  positive: "#4e9f6b",
  info: "#5f8db0",
  caution: "#cf9a36",
  grid: "#272c39",
  axis: "#475063",
} as const;

/** Donut / multi-series slice palette. */
export const SLICE_PALETTE = [
  CHART.gold,
  CHART.maroonLight,
  CHART.steel,
  CHART.positive,
  CHART.info,
  CHART.caution,
];

/** Shared axis props — small muted ticks, no axis line. */
export const AXIS_PROPS = {
  tick: { fill: CHART.axis, fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const;

/** A single tooltip row payload entry from recharts. */
type TooltipEntry = {
  name?: ReactNode;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
};

export type ChartTooltipProps = {
  active?: boolean;
  label?: ReactNode;
  payload?: TooltipEntry[];
  /** Format a numeric value (e.g. money). */
  format?: (v: number) => string;
  /** Override the heading (defaults to `label`). */
  labelFor?: (entry: TooltipEntry) => ReactNode;
};

/** Dark, bordered tooltip used across all charts. */
export function ChartTooltip({
  active,
  label,
  payload,
  format,
  labelFor,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const heading = labelFor ? labelFor(payload[0]) : label;
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-800/95 px-3 py-2 shadow-card backdrop-blur-sm">
      {heading != null && heading !== "" && (
        <p className="mb-1 text-xs font-medium text-cream-100">{heading}</p>
      )}
      <div className="space-y-0.5">
        {payload.map((entry, i) => {
          const raw = entry.value;
          const text =
            typeof raw === "number" && format ? format(raw) : String(raw ?? "");
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              {entry.color && (
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
              )}
              {entry.name != null && entry.name !== "" && (
                <span className="text-ink-500">{entry.name}</span>
              )}
              <span className="nums ms-auto font-semibold text-cream-50">
                {text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** A datum used by the simple bar/area/pie helpers below. */
export type ChartDatum = { label: string; value: number; color?: string };

/** Centered fallback shown inside a chart's fixed-height box when empty. */
export function ChartEmpty({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-[260px] flex-col items-center justify-center gap-2 text-center",
        className,
      )}
    >
      <span className="h-px w-12 bg-ink-700" />
      <p className="text-sm text-ink-500">{message}</p>
    </div>
  );
}
