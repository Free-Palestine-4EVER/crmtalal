"use client";

import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  emphasis,
  subtitle,
  align = "center",
  index,
  className,
}: {
  eyebrow?: string;
  title: string;
  /** Optional trailing fragment rendered as a gold-shimmer emphasis. */
  emphasis?: string;
  subtitle?: string;
  align?: "center" | "start";
  /** Faint oversized index/label sitting behind the heading (e.g. "02"). */
  index?: string;
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "relative flex flex-col gap-4",
        centered ? "items-center text-center" : "items-start text-start",
        className,
      )}
    >
      {index && (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none select-none font-display text-[5.5rem] font-semibold leading-none text-fg/[0.045] sm:text-[7rem]",
            centered ? "mx-auto" : "",
            "-mb-6 sm:-mb-9",
          )}
        >
          {index}
        </span>
      )}

      {eyebrow && (
        <Reveal y={14}>
          <span
            className={cn(
              "inline-flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-sgold",
              centered ? "justify-center" : "",
            )}
          >
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--s-gold)]/70" />
            {eyebrow}
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--s-gold)]/70" />
          </span>
        </Reveal>
      )}

      <Reveal delay={0.06} y={18}>
        <h2 className="max-w-3xl text-balance font-display text-3xl font-semibold leading-[1.08] tracking-tight text-fg sm:text-4xl md:text-[2.85rem]">
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
          <p className="max-w-2xl text-pretty text-base leading-relaxed text-soft">
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
