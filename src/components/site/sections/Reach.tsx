"use client";

import { Globe2, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { TopoPattern } from "@/components/brand/TopoPattern";
import { useI18n } from "@/i18n";
import { REACH } from "@/content/site";
import { EASE_LUXE } from "@/components/motion/variants";

export function Reach() {
  const { dict, L, locale } = useI18n();

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
        />

        <div className="mx-auto mt-14 max-w-4xl">
          {/* domestic — prominent */}
          <Reveal y={28}>
            <div className="group relative overflow-hidden rounded-3xl border border-[var(--s-accent)]/20 bg-[var(--s-accent)]/[0.08] p-9 text-center text-fg shadow-[0_24px_70px_-40px_rgba(114,20,47,0.5)] transition-all duration-500 hover:border-[var(--s-accent)]/35 hover:shadow-[0_30px_80px_-38px_rgba(114,20,47,0.55)] sm:p-12">
              {/* soft inner gold glow on hover */}
              <span className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(60%_100%_at_50%_0%,var(--s-glow),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--s-accent)]/12 text-accent ring-1 ring-[var(--s-accent)]/20 transition-transform duration-500 group-hover:scale-105">
                <MapPin className="h-7 w-7" strokeWidth={1.6} />
              </span>
              <p className="relative mx-auto mt-6 max-w-2xl text-balance font-display text-2xl font-semibold leading-snug text-fg sm:text-[2rem]">
                {L(REACH.domestic)}
              </p>
            </div>
          </Reveal>

          {/* international */}
          <Reveal delay={0.1}>
            <div className="mt-10 flex items-center justify-center gap-3 text-sgold">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--s-gold)]/60" />
              <Globe2 className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.24em]">
                {locale === "ar" ? "وحضور دولي" : "& international presence"}
              </span>
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--s-gold)]/60" />
            </div>
          </Reveal>

          <motion.div
            className="mt-7 flex flex-wrap justify-center gap-3"
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
                className="inline-flex items-center gap-2 rounded-full border border-line bg-scard px-5 py-2.5 text-sm font-medium text-soft shadow-[0_10px_36px_-26px_rgba(114,20,47,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--s-gold)]/55 hover:text-accent hover:shadow-[0_14px_40px_-24px_var(--s-glow)]"
              >
                {L(c)}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
