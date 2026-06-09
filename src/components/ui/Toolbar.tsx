"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

export type ToolbarProps = {
  /** Controlled search value. */
  search?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  /** Right-aligned slot for filter controls (selects, segmented controls, buttons). */
  children?: React.ReactNode;
  className?: string;
};

export function Toolbar({
  search,
  onSearch,
  searchPlaceholder,
  children,
  className,
}: ToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {onSearch && (
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 w-full rounded-xl border border-ink-700 bg-ink-850/70 ps-10 pe-4 text-[0.95rem] text-parch-50 placeholder:text-ink-500 transition-colors focus:border-gold-500/70 focus:bg-ink-850 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          />
        </div>
      )}

      {children && (
        <div className="flex flex-wrap items-center gap-2 sm:ms-auto">
          {children}
        </div>
      )}
    </div>
  );
}
