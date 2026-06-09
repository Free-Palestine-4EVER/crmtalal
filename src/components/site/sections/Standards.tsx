"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/site/SectionHeading";
import { fadeUp, staggerContainer } from "@/components/motion/variants";
import { useI18n } from "@/i18n";
import { STANDARDS } from "@/content/site";

export function Standards() {
  const { dict, L } = useI18n();

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

        {/* credentials wall — monumental rows */}
        <motion.ol
          variants={staggerContainer(0.1, 0.05)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-14"
        >
          {STANDARDS.map((s, i) => (
            <motion.li
              key={s.abbr}
              variants={fadeUp}
              className="group relative border-t border-line last:border-b"
            >
              <div className="grid items-center gap-x-8 gap-y-2 py-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:py-10">
                <div className="flex items-baseline gap-5">
                  <span className="font-mono text-xs tracking-[0.2em] text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="text-outline font-display text-[3.2rem] font-semibold leading-none tracking-tight transition-all duration-500 group-hover:text-sgold sm:text-[4.6rem] lg:text-[5.4rem]"
                    style={{
                      WebkitTextStrokeColor: "color-mix(in oklab, var(--s-gold) 55%, transparent)",
                    }}
                  >
                    {s.abbr}
                  </span>
                </div>
                <div className="sm:justify-self-end sm:text-end">
                  <h3 className="text-base font-semibold text-fg">{L(s.title)}</h3>
                  <p className="mt-1.5 max-w-md text-pretty text-sm leading-relaxed text-soft sm:ms-auto">
                    {L(s.desc)}
                  </p>
                </div>
              </div>
              {/* gold sweep on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-[var(--s-gold)] via-[var(--s-gold)]/60 to-transparent transition-transform duration-700 group-hover:scale-x-100 rtl:origin-right"
              />
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
