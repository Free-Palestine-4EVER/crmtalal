"use client";

import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { useI18n } from "@/i18n";
import { PROCESS_STEPS } from "@/content/site";

export function Process() {
  const { dict, L } = useI18n();

  return (
    <section
      id="process"
      className="relative scroll-mt-24 border-y border-ink-700/40 bg-ink-950/40 py-24 sm:py-28"
    >
      <div className="glow-maroon pointer-events-none absolute inset-x-0 top-0 h-72 opacity-40" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={dict.sections.processEyebrow}
          title={dict.sections.processTitle}
        />

        <div className="relative mt-16">
          {/* connecting hairline (large screens) */}
          <div className="hairline absolute inset-x-0 top-7 hidden h-px lg:block" />

          <ol className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-6">
            {PROCESS_STEPS.map((step, i) => (
              <Reveal key={step.n} delay={(i % 6) * 0.07} className="relative">
                <li className="flex flex-col items-start">
                  <span className="relative z-10 grid h-14 w-14 place-items-center rounded-full border border-gold-500/35 bg-ink-900 font-display text-xl font-semibold text-gradient-gold shadow-card">
                    <span className="nums">{step.n}</span>
                  </span>
                  <h3 className="mt-5 text-base font-semibold leading-snug text-cream-50">
                    {L(step.title)}
                  </h3>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-cream-100/55">
                    {L(step.desc)}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
