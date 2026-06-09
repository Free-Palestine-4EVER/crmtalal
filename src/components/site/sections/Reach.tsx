"use client";

import { Globe2, MapPin } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { TopoPattern } from "@/components/brand/TopoPattern";
import { useI18n } from "@/i18n";
import { REACH } from "@/content/site";

export function Reach() {
  const { dict, L, locale } = useI18n();

  return (
    <section
      id="reach"
      className="relative scroll-mt-24 overflow-hidden border-y border-[#ece3d2] bg-[#fbf8f2] py-24 sm:py-28"
    >
      <TopoPattern className="text-maroon-600/40" opacity={0.05} />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={dict.sections.reachEyebrow}
          title={dict.sections.reachTitle}
        />

        <div className="mx-auto mt-14 max-w-4xl">
          {/* domestic — prominent */}
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl border border-maroon-600/15 bg-maroon-600/[0.08] p-8 text-center shadow-[0_10px_40px_-24px_rgba(114,20,47,0.3)] sm:p-10">
              <span className="relative grid mx-auto h-12 w-12 place-items-center rounded-full bg-maroon-600/10 text-maroon-600">
                <MapPin className="h-6 w-6" strokeWidth={1.6} />
              </span>
              <p className="relative mt-5 font-display text-2xl font-semibold leading-snug text-ink-900 sm:text-3xl">
                {L(REACH.domestic)}
              </p>
            </div>
          </Reveal>

          {/* international */}
          <Reveal delay={0.1}>
            <div className="mt-9 flex items-center justify-center gap-3 text-gold-700">
              <Globe2 className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                {locale === "ar" ? "وحضور دولي" : "& international presence"}
              </span>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {REACH.international.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 rounded-full border border-gold-600/30 bg-white px-5 py-2.5 text-sm font-medium text-ink-600 shadow-[0_8px_30px_-22px_rgba(114,20,47,0.25)] transition-colors hover:border-gold-600 hover:text-maroon-600"
                >
                  {L(c)}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
