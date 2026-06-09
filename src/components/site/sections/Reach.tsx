"use client";

import { Globe2 } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SaudiMap } from "@/components/site/SaudiMap";
import { TopoPattern } from "@/components/brand/TopoPattern";
import { useI18n } from "@/i18n";
import { REACH } from "@/content/site";
import { EASE_LUXE } from "@/components/motion/variants";

export function Reach() {
  const { dict, L, locale } = useI18n();
  const ar = locale === "ar";

  return (
    <section
      id="reach"
      className="grain relative scroll-mt-24 overflow-hidden border-y border-line bg-surface2 py-24 sm:py-28"
    >
      <TopoPattern className="text-[var(--s-accent)]/40" opacity={0.05} />
      <div className="spotlight pointer-events-none absolute inset-x-0 top-0 h-72" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={dict.sections.reachEyebrow}
          title={dict.sections.reachTitle}
          index="04"
        />

        <div className="mt-14 grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          {/* interactive Kingdom map */}
          <Reveal y={30}>
            <SaudiMap />
          </Reveal>

          {/* coverage details */}
          <div>
            <Reveal>
              <p className="text-balance font-display text-2xl font-semibold leading-snug text-fg sm:text-[1.8rem]">
                {L(REACH.domestic)}
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-soft">
                {ar
                  ? "فرق معاينة معتمدة تصل إلى كل منطقة في المملكة — من المقر الرئيسي في الرياض إلى أبعد نقطة."
                  : "Certified inspection teams reach every region of the Kingdom — from our Riyadh HQ to the farthest point."}
              </p>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="mt-9 flex items-center gap-3 text-sgold">
                <Globe2 className="h-4 w-4" />
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.24em]">
                  {ar ? "وحضور دولي" : "& international presence"}
                </span>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--s-gold)]/60" />
              </div>
            </Reveal>

            <motion.div
              className="mt-6 flex flex-wrap gap-3"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              transition={{ staggerChildren: 0.06, delayChildren: 0.05 }}
            >
              {REACH.international.map((c, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 14, scale: 0.96 },
                    show: { opacity: 1, y: 0, scale: 1 },
                  }}
                  transition={{ duration: 0.55, ease: EASE_LUXE }}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-scard px-5 py-2.5 text-sm font-medium text-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--s-gold)]/55 hover:text-accent"
                >
                  {L(c)}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
