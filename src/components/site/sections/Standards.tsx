"use client";

import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { useI18n } from "@/i18n";
import { STANDARDS } from "@/content/site";

export function Standards() {
  const { dict, L } = useI18n();

  return (
    <section id="standards" className="relative scroll-mt-24 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={dict.sections.standardsEyebrow}
          title={dict.sections.standardsTitle}
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STANDARDS.map((s, i) => (
            <Reveal key={s.abbr} delay={(i % 4) * 0.08} className="h-full">
              <div className="glass group relative flex h-full flex-col overflow-hidden rounded-2xl p-6 transition-colors hover:border-gold-500/40">
                <div className="glow-gold pointer-events-none absolute inset-x-0 top-0 h-24 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="font-display text-3xl font-semibold tracking-tight text-gradient-gold">
                  {s.abbr}
                </span>
                <span className="mt-1 h-px w-10 bg-gold-500/40" />
                <h3 className="mt-4 text-sm font-semibold text-cream-50">{L(s.title)}</h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-cream-100/55">
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
