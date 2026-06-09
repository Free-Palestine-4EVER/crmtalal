"use client";

import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

/**
 * Editorial section heading — a hairline rule, a mono index + kicker,
 * then an oversized display title. Start-aligned by default.
 */
export function SectionHeading({
  eyebrow,
  title,
  emphasis,
  subtitle,
  align = "start",
  index,
  className,
}: {
  eyebrow?: string;
  title: string;
  /** Optional trailing fragment rendered as a gold-shimmer emphasis. */
  emphasis?: string;
  subtitle?: string;
  align?: "center" | "start";
  /** Mono chapter index, e.g. "01". */
  index?: string;
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "relative flex flex-col",
        centered ? "items-center text-center" : "items-start text-start",
        className,
      )}
    >
      {/* rule + mono kicker row */}
      <Reveal y={10} className="w-full">
        <div
          className={cn(
            "flex items-baseline gap-4 border-t border-line pt-5",
            centered && "justify-center border-t-0 pt-0",
          )}
        >
          {index && (
            <span className="font-mono text-xs font-medium tracking-[0.2em] text-sgold">
              /&nbsp;{index}
            </span>
          )}
          {eyebrow && (
            <span className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-muted">
              {eyebrow}
            </span>
          )}
          {!centered && (
            <span
              aria-hidden
              className="ms-auto hidden font-mono text-xs tracking-[0.2em] text-muted/50 sm:block"
            >
              EDARAH®
            </span>
          )}
        </div>
      </Reveal>

      <Reveal delay={0.06} y={20}>
        <h2 className="mt-6 max-w-4xl text-balance font-display text-4xl font-semibold leading-[1.04] tracking-tight text-fg sm:text-5xl md:text-[3.6rem]">
          {title}
          {emphasis && (
            <>
              {" "}
              <span className="text-gold-shimmer">{emphasis}</span>
            </>
          )}
        </h2>
      </Reveal>

      {subtitle && (
        <Reveal delay={0.12} y={18}>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-soft">
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
