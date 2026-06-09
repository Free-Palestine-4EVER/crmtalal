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
      className="relative scroll-mt-24 border-y border-[#ece3d2] bg-[#fbf8f2] py-24 sm:py-28"
    >
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
                  <span className="relative z-10 grid h-14 w-14 place-items-center rounded-full border border-gold-600/30 bg-white font-display text-xl font-semibold text-maroon-600 shadow-[0_10px_30px_-16px_rgba(114,20,47,0.35)]">
                    <span className="nums">{step.n}</span>
                  </span>
                  <h3 className="mt-5 text-base font-semibold leading-snug text-ink-900">
                    {L(step.title)}
                  </h3>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-600">
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
