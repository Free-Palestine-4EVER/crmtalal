"use client";

import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { useI18n } from "@/i18n";
import { STANDARDS } from "@/content/site";

export function Standards() {
  const { dict, L } = useI18n();

  return (
    <section id="standards" className="relative scroll-mt-24 bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={dict.sections.standardsEyebrow}
          title={dict.sections.standardsTitle}
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STANDARDS.map((s, i) => (
            <Reveal key={s.abbr} delay={(i % 4) * 0.08} className="h-full">
              <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#ece3d2] bg-white p-6 shadow-[0_10px_40px_-24px_rgba(114,20,47,0.25)] transition-colors hover:border-gold-600/40">
                <span className="font-display text-3xl font-semibold tracking-tight text-gold-700">
                  {s.abbr}
                </span>
                <span className="mt-1 h-px w-10 bg-gold-600/30" />
                <h3 className="mt-4 text-sm font-semibold text-ink-900">{L(s.title)}</h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-600">
                  {L(s.desc)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
