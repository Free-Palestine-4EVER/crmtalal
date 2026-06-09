"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/components/site/SectionHeading";
import { fadeUp, staggerContainer } from "@/components/motion/variants";
import { useI18n } from "@/i18n";
import { PROCESS_STEPS } from "@/content/site";

export function Process() {
  const { dict, L } = useI18n();
  const reduce = useReducedMotion();

  return (
    <section
      id="process"
      className="relative scroll-mt-24 overflow-hidden border-y border-line bg-surface2 py-24 sm:py-28"
    >
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={dict.sections.processEyebrow}
          title={dict.sections.processTitle}
          index="02"
        />

        <div className="relative mt-20">
          {/* connecting hairline (large screens) — theme-aware gold */}
          <div
            aria-hidden
            className="absolute inset-x-7 top-8 hidden h-px bg-gradient-to-r from-transparent via-[var(--s-gold)]/45 to-transparent lg:block"
          />

          <motion.ol
            variants={staggerContainer(0.09, 0.05)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-6"
          >
            {PROCESS_STEPS.map((step) => (
              <motion.li
                key={step.n}
                variants={fadeUp}
                className="group relative flex flex-col items-start"
              >
                <motion.span
                  whileHover={reduce ? undefined : { y: -4 }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                  className="relative z-10 grid h-16 w-16 place-items-center rounded-full border border-[var(--s-gold)]/35 bg-scard font-display text-2xl font-semibold text-accent shadow-[0_14px_36px_-20px_var(--s-glow)] transition-colors duration-300 group-hover:border-[var(--s-gold)]"
                >
                  {/* faint gold ring that wakes up on hover */}
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full ring-1 ring-inset ring-[var(--s-gold)]/0 transition-all duration-300 group-hover:ring-[var(--s-gold)]/30"
                  />
                  <span className="nums">{step.n}</span>
                </motion.span>

                <h3 className="mt-5 text-base font-semibold leading-snug text-fg">
                  {L(step.title)}
                </h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-soft">
                  {L(step.desc)}
                </p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  );
}
