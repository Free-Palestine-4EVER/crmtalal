"use client";

/**
 * WordBand — a full-bleed strip of enormous display words drifting past:
 * alternating hollow-outline and gold-shimmer type. Editorial, unmistakable.
 */

import { useI18n } from "@/i18n";

const WORDS: { ar: string; en: string }[] = [
  { ar: "تقييم معتمد", en: "Certified Valuation" },
  { ar: "تقييم", en: "TAQEEM" },
  { ar: "دقة", en: "Precision" },
  { ar: "IVS", en: "IVS" },
  { ar: "ثقة", en: "Trust" },
  { ar: "منذ ٢٠١٢", en: "Since 2012" },
];

export function WordBand() {
  const { L } = useI18n();
  const row = (key: string) => (
    <div key={key} className="flex w-max shrink-0 items-center gap-8 pe-8">
      {WORDS.map((w, i) => (
        <span key={`${key}-${i}`} className="flex items-center gap-8">
          <span
            className={`whitespace-nowrap font-display text-5xl font-semibold uppercase leading-none tracking-tight sm:text-7xl ${
              i % 2 === 0 ? "text-outline" : "text-gold-shimmer"
            }`}
          >
            {L(w)}
          </span>
          <span className="text-xl text-sgold/60" aria-hidden>
            ◆
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <section
      aria-hidden
      className="relative overflow-hidden border-y border-line bg-surface2 py-10 sm:py-14"
    >
      <div
        className="marquee flex w-max"
        style={{ ["--marquee-dur" as string]: "46s" }}
      >
        {row("a")}
        {row("b")}
      </div>
      {/* edge fades */}
      <span className="pointer-events-none absolute inset-y-0 start-0 w-24 bg-gradient-to-r from-[var(--s-bg2)] to-transparent" />
      <span className="pointer-events-none absolute inset-y-0 end-0 w-24 bg-gradient-to-l from-[var(--s-bg2)] to-transparent" />
    </section>
  );
}
