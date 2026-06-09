"use client";

import { useI18n } from "@/i18n";
import { PARTNERS } from "@/content/site";

const maskFade = {
  WebkitMaskImage:
    "linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)",
  maskImage:
    "linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)",
} as const;

export function PartnersMarquee() {
  const { L, locale } = useI18n();
  const ar = locale === "ar";
  const row = [...PARTNERS, ...PARTNERS];

  const Pill = ({ label }: { label: string }) => (
    <span className="whitespace-nowrap rounded-full border border-line bg-scard px-5 py-2.5 text-sm font-medium text-soft">
      {label}
    </span>
  );

  return (
    <section className="relative overflow-hidden border-y border-line bg-surface2 py-14">
      <div className="mx-auto mb-9 max-w-7xl px-5 text-center sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sgold">
          {ar ? "شركاؤنا في النجاح" : "Partners in success"}
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-fg sm:text-3xl">
          {ar
            ? "ثقة أكثر من 100 جهة حكومية وخاصة"
            : "Trusted by 100+ public & private entities"}
        </h2>
      </div>

      <div className="relative space-y-3" style={maskFade}>
        <div
          className="marquee flex w-max gap-3"
          style={{ ["--marquee-dur" as string]: "46s" }}
        >
          {row.map((p, i) => (
            <Pill key={`a-${i}`} label={L(p)} />
          ))}
        </div>
        <div
          className="marquee flex w-max gap-3 [animation-direction:reverse]"
          style={{ ["--marquee-dur" as string]: "54s" }}
        >
          {row.map((p, i) => (
            <Pill key={`b-${i}`} label={L(p)} />
          ))}
        </div>
      </div>
    </section>
  );
}
