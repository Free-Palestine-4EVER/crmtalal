"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/components/site/SectionHeading";
import { fadeUp, staggerContainer } from "@/components/motion/variants";
import { useI18n } from "@/i18n";
import { STANDARDS } from "@/content/site";

export function Standards() {
  const { dict, L } = useI18n();
  const reduce = useReducedMotion();

  return (
    <section
      id="standards"
      className="grain relative scroll-mt-24 overflow-hidden bg-surface py-24 sm:py-28"
    >
      <div
        aria-hidden
        className="spotlight pointer-events-none absolute inset-x-0 top-0 h-[32rem]"
        style={{ ["--sx" as string]: "22%" }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={dict.sections.standardsEyebrow}
          title={dict.sections.standardsTitle}
          index="03"
        />

        <motion.div
          variants={staggerContainer(0.08, 0.05)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STANDARDS.map((s) => (
            <motion.div
              key={s.abbr}
              variants={fadeUp}
              whileHover={reduce ? undefined : { y: -6 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-scard p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.55)] transition-[border-color,box-shadow] duration-300 hover:border-[var(--s-gold-soft)]/55 hover:shadow-[0_28px_70px_-32px_var(--s-glow)]"
            >
              {/* gold top hairline on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--s-gold)] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />

              <span className="font-display text-[2.6rem] font-semibold leading-none tracking-tight text-sgold">
                {s.abbr}
              </span>
              <span className="mt-2 h-px w-10 bg-[var(--s-gold)]/40 transition-all duration-300 group-hover:w-16" />
              <h3 className="mt-4 text-sm font-semibold text-fg">{L(s.title)}</h3>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-soft">
                {L(s.desc)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
