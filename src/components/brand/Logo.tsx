"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n";

const SRC = {
  official: "/brand/logo-official.png", // white + gold (for dark/maroon surfaces)
  maroon: "/brand/logo-maroon.png", // for light surfaces
  gold: "/brand/logo-gold.png",
  charcoal: "/brand/logo-charcoal.png",
} as const;

type Tone = keyof typeof SRC;

// Intrinsic ratio of the official wordmark.
const LOGO_W = 900;
const LOGO_H = 693;

export function LogoMark({
  tone = "official",
  className,
  priority,
}: {
  tone?: Tone;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={SRC[tone]}
      alt="Edarah — إدارة"
      width={LOGO_W}
      height={LOGO_H}
      priority={priority}
      className={cn("w-auto select-none", className)}
    />
  );
}

/** Full lockup: calligraphic mark + typeset name + descriptor. */
export function Logo({
  tone = "official",
  showText = true,
  textTone = "light",
  className,
  priority,
}: {
  tone?: Tone;
  showText?: boolean;
  textTone?: "light" | "dark";
  className?: string;
  priority?: boolean;
}) {
  const { locale, dict } = useI18n();
  const textColor = textTone === "dark" ? "text-ink-900" : "text-cream-50";
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LogoMark tone={tone} priority={priority} className="h-10 sm:h-11" />
      {showText && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "text-[1.3rem] font-semibold tracking-wide",
              textColor,
            )}
          >
            {locale === "ar" ? "إدارة" : "EDARAH"}
          </span>
          <span className="mt-1 text-[0.58rem] font-medium uppercase tracking-[0.28em] text-gold-500">
            {locale === "ar" ? "للتقييم العقاري" : "Real Estate Valuation"}
          </span>
        </span>
      )}
      <span className="sr-only">{dict.meta.legalName}</span>
    </span>
  );
}
