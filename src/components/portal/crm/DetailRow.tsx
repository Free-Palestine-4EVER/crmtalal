"use client";

import { cn } from "@/lib/cn";

/** A label/value pair for entity detail drawers. */
export function DetailRow({
  label,
  children,
  ltr,
  className,
}: {
  label: string;
  children: React.ReactNode;
  /** Force LTR direction on the value (phones, emails). */
  ltr?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1 py-2.5", className)}>
      <span className="text-xs font-medium tracking-wide text-ink-500 uppercase">
        {label}
      </span>
      <span
        className="text-sm text-parch-100/90 break-words"
        dir={ltr ? "ltr" : undefined}
        style={ltr ? { textAlign: "start" } : undefined}
      >
        {children}
      </span>
    </div>
  );
}

/** Renders an empty-value dash when content is falsy. */
export function orDash(value: React.ReactNode): React.ReactNode {
  if (value === null || value === undefined || value === "") return "—";
  return value;
}
