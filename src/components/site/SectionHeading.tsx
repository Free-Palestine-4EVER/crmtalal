"use client";

import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-start",
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <span className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">
            <span className="h-px w-7 bg-gradient-to-r from-transparent to-gold-500" />
            {eyebrow}
            <span className="h-px w-7 bg-gradient-to-l from-transparent to-gold-500" />
          </span>
        </Reveal>
      )}
      <Reveal delay={0.06}>
        <h2 className="max-w-3xl text-balance font-display text-3xl font-semibold leading-tight text-cream-50 sm:text-4xl md:text-[2.75rem]">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.12}>
          <p className="max-w-2xl text-pretty text-base leading-relaxed text-cream-100/55">
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
