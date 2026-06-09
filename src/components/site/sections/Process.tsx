"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { SectionHeading } from "@/components/site/SectionHeading";
import { fadeUp, staggerContainer } from "@/components/motion/variants";
import { useI18n } from "@/i18n";
import { PROCESS_STEPS, CONTACT } from "@/content/site";

export function Process() {
  const { dict, L, locale } = useI18n();
  const ar = locale === "ar";
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 75%", "end 70%"],
  });
  const drawn = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <section
      id="process"
      className="relative scroll-mt-24 overflow-hidden border-y border-line bg-surface2 py-24 sm:py-28"
    >
      <div className="relative mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        {/* sticky chapter block */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            eyebrow={dict.sections.processEyebrow}
            title={dict.sections.processTitle}
            index="02"
          />
          <p className="mt-6 max-w-md text-pretty text-sm leading-relaxed text-soft">
            {ar
              ? "منهجية واحدة لا تتغيّر — من أول اتصال حتى تسليم تقرير موقّع ومعتمد. تتابع كل مرحلة لحظيًا من حسابك."
              : "One unchanging methodology — from first contact to a signed, certified report. Track every stage live from your account."}
          </p>
          <a
            href={`tel:${CONTACT.phoneIntl}`}
            className="mt-8 inline-flex items-center gap-3 font-mono text-sm text-sgold transition-colors hover:text-accent"
            dir="ltr"
          >
            {CONTACT.phone1} ↗
          </a>
        </div>

        {/* steps — monumental numbered rows with a self-drawing spine */}
        <div className="relative">
          {/* spine */}
          <div
            aria-hidden
            className="absolute bottom-0 start-[1.05rem] top-2 hidden w-px bg-[var(--s-line)] sm:block"
          />
          <motion.div
            aria-hidden
            style={{ scaleY: drawn }}
            className="absolute bottom-0 start-[1.05rem] top-2 hidden w-px origin-top bg-gradient-to-b from-[var(--s-gold)] via-[var(--s-gold)]/70 to-transparent sm:block"
          />

          <motion.ol
            ref={listRef}
            variants={staggerContainer(0.08, 0.05)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="space-y-2"
          >
            {PROCESS_STEPS.map((step) => (
              <motion.li
                key={step.n}
                variants={fadeUp}
                className="group relative flex gap-6 rounded-xl p-4 transition-colors duration-300 hover:bg-[var(--s-bg)]/60 sm:gap-8 sm:p-5"
              >
                <span className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--s-gold)]/40 bg-scard font-mono text-xs font-semibold text-sgold transition-colors duration-300 group-hover:border-[var(--s-gold)]">
                  {step.n}
                </span>
                <div className="min-w-0 pt-1">
                  <h3 className="font-display text-xl font-semibold leading-snug text-fg sm:text-2xl">
                    {L(step.title)}
                  </h3>
                  <p className="mt-1.5 max-w-lg text-pretty text-sm leading-relaxed text-soft">
                    {L(step.desc)}
                  </p>
                </div>
                <span
                  aria-hidden
                  className="ms-auto hidden self-center font-display text-5xl font-semibold leading-none text-fg/[0.05] transition-colors duration-300 group-hover:text-fg/[0.1] lg:block"
                >
                  {step.n}
                </span>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  );
}
