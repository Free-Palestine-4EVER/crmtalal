"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n";

export type PaginationProps = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  className?: string;
};

const DOTS = "dots";

/** Build a compact page list with leading/trailing ellipses. */
function buildRange(page: number, pageCount: number): (number | typeof DOTS)[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const range: (number | typeof DOTS)[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  if (start > 2) range.push(DOTS);
  for (let i = start; i <= end; i++) range.push(i);
  if (end < pageCount - 1) range.push(DOTS);
  range.push(pageCount);
  return range;
}

export function Pagination({
  page,
  pageCount,
  onChange,
  className,
}: PaginationProps) {
  const { isRTL } = useI18n();
  if (pageCount <= 1) return null;

  const pages = buildRange(page, pageCount);
  // Chevrons point in the logical reading direction.
  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  const arrowCls =
    "grid h-9 w-9 place-items-center rounded-lg border border-ink-700 text-parch-100/80 transition-colors hover:border-gold-500/40 hover:text-parch-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav
      className={cn("flex items-center gap-1.5", className)}
      aria-label="Pagination"
    >
      <button
        type="button"
        aria-label="Previous page"
        className={arrowCls}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <PrevIcon className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === DOTS ? (
          <span
            key={`dots-${i}`}
            className="nums grid h-9 w-9 place-items-center text-sm text-ink-500"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? "page" : undefined}
            onClick={() => onChange(p)}
            className={cn(
              "nums grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500",
              p === page
                ? "bg-gold-500/15 text-gold-300 ring-1 ring-gold-500/30"
                : "text-parch-100/75 hover:bg-white/5 hover:text-parch-50",
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Next page"
        className={arrowCls}
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
      >
        <NextIcon className="h-4 w-4" />
      </button>
    </nav>
  );
}
