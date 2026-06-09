"use client";

/**
 * CircularBadge — slow-rotating text-on-a-circle seal with a gold core.
 * The classic luxury-site mark of craft.
 */

import { BadgeCheck } from "lucide-react";

export function CircularBadge({
  text = "EDARAH VALUATION • التقييم العقاري المعتمد • TAQEEM • ",
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div className={`relative grid h-32 w-32 place-items-center ${className ?? ""}`}>
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full animate-spin"
        style={{ animationDuration: "24s" }}
        aria-hidden
      >
        <defs>
          <path
            id="badge-circle"
            d="M50,50 m-39,0 a39,39 0 1,1 78,0 a39,39 0 1,1 -78,0"
          />
        </defs>
        <text
          fill="var(--s-gold)"
          fontSize="8.2"
          fontWeight="600"
          letterSpacing="1.6"
        >
          <textPath href="#badge-circle">{text}</textPath>
        </text>
      </svg>
      <span className="grid h-14 w-14 place-items-center rounded-full border border-[var(--s-gold)]/40 bg-scard text-sgold shadow-[0_10px_30px_-12px_var(--s-glow)]">
        <BadgeCheck className="h-6 w-6" strokeWidth={1.7} />
      </span>
    </div>
  );
}
