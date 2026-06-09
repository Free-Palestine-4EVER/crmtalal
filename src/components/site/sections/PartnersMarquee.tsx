"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { PARTNERS } from "@/content/site";
import type { LocalizedText } from "@/i18n/config";

const maskFade = {
  WebkitMaskImage:
    "linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)",
  maskImage:
    "linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)",
} as const;

/**
 * Real partner logos (whitened via CSS to blend with the dark site).
 * Keyed by the partner's English name in content/site.ts; entries whose
 * file is missing fall back to the text pill automatically (onError).
 */
const LOGOS: Record<string, string> = {
  "Tawuniya Insurance": "/brand/partners/tawuniya.svg",
  "Al-Rajhi Development": "/brand/partners/rajhi.png",
  // binsaidan logo only exists on an opaque cream background — text pill instead
  "Al-Zamil Real Estate Group": "/brand/partners/zamil.png",
  "Manassat Real Estate": "/brand/partners/manassat.png",
  "Delta Saudi Energy Projects": "/brand/partners/delta.svg",
  "Ahmed M. Al-Saif & Sons": "/brand/partners/alsaif.svg",
  "Emaar Advanced": "/brand/partners/emaar.png",
  "Tharawat Securities": "/brand/partners/tharawat.svg",
  "Zawaya Real Estate": "/brand/partners/zawaya.png",
};

function Pill({ partner }: { partner: LocalizedText }) {
  const { L } = useI18n();
  const logo = LOGOS[partner.en];
  const [broken, setBroken] = useState(false);
  const label = L(partner);

  // logo-only wall — anything without a clean logo doesn't render
  if (!logo || broken) return null;
  return (
    <span
      className="grid h-14 min-w-36 place-items-center whitespace-nowrap rounded-xl border border-line bg-scard px-6"
      title={label}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo}
        alt={label}
        onError={() => setBroken(true)}
        className="max-h-8 w-auto max-w-32 object-contain opacity-75 brightness-0 invert transition-opacity hover:opacity-100"
        loading="lazy"
      />
    </span>
  );
}

export function PartnersMarquee() {
  const { locale } = useI18n();
  const ar = locale === "ar";
  const withLogos = PARTNERS.filter((p) => LOGOS[p.en]);
  const row = [...withLogos, ...withLogos, ...withLogos];

  return (
    <section className="relative overflow-hidden border-y border-line bg-surface2 py-14">
      <div className="mx-auto mb-9 max-w-7xl px-5 sm:px-8">
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-sgold">
            {ar ? "شركاؤنا في النجاح" : "Partners in success"}
          </span>
          <span className="h-px flex-1 bg-[var(--s-line)]" aria-hidden />
          <span className="font-mono text-xs tracking-[0.2em] text-muted">
            100+
          </span>
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold text-fg sm:text-3xl">
          {ar
            ? "ثقة أكثر من 100 جهة حكومية وخاصة"
            : "Trusted by 100+ public & private entities"}
        </h2>
      </div>

      {/* dir=ltr + explicit animation direction: keeps the loop geometry
          identical in RTL — otherwise the overflowing row anchors off-screen */}
      <div className="relative space-y-3" style={maskFade} dir="ltr">
        <div
          className="marquee flex w-max gap-3"
          style={{
            ["--marquee-dur" as string]: "46s",
            animationDirection: "normal",
          }}
        >
          {row.map((p, i) => (
            <Pill key={`a-${i}`} partner={p} />
          ))}
        </div>
        <div
          className="marquee flex w-max gap-3"
          style={{
            ["--marquee-dur" as string]: "54s",
            animationDirection: "reverse",
          }}
        >
          {row.map((p, i) => (
            <Pill key={`b-${i}`} partner={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
