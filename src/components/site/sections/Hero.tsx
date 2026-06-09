"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Phone, ArrowDown } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { TopoPattern } from "@/components/brand/TopoPattern";
import { QuickRequest } from "@/components/site/QuickRequest";
import { useI18n } from "@/i18n";
import { STATS, CONTACT } from "@/content/site";
import { EASE_LUXE } from "@/components/motion/variants";

function AccentedTitle({ title, accent }: { title: string; accent: string }) {
  const idx = accent ? title.indexOf(accent) : -1;
  if (idx === -1) return <>{title}</>;
  return (
    <>
      {title.slice(0, idx)}
      <span className="relative whitespace-nowrap text-maroon-600">
        {accent}
        <span className="absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-gradient-to-r from-gold-400 to-gold-600" />
      </span>
      {title.slice(idx + accent.length)}
    </>
  );
}

export function Hero() {
  const { dict, L } = useI18n();
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
  };
  const item = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_LUXE } },
  };

  return (
    <section className="relative isolate overflow-hidden bg-[#fbf8f2]">
      {/* soft textures */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 85% 0%, rgba(201,162,76,0.14), transparent 60%), radial-gradient(50% 45% at 0% 100%, rgba(114,20,47,0.07), transparent 60%)",
        }}
      />
      <TopoPattern className="text-maroon-600/40" opacity={0.05} />
      <div className="pointer-events-none absolute -bottom-20 select-none opacity-[0.04] ltr:-left-10 rtl:-right-10">
        <LogoMark tone="maroon" className="h-[32rem] w-auto" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-28 sm:px-8 sm:pt-32 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:pb-28 lg:pt-36">
        {/* Left: message */}
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-gold-600/30 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold-700"
          >
            <BadgeCheck className="h-4 w-4" />
            {dict.hero.eyebrow}
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-6 text-balance font-display text-[2.5rem] font-semibold leading-[1.06] text-ink-900 sm:text-6xl"
          >
            <AccentedTitle title={dict.hero.title} accent={dict.hero.titleAccent} />
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-ink-600 sm:text-lg"
          >
            {dict.hero.subtitle}
          </motion.p>

          {/* stats */}
          <motion.dl
            variants={item}
            className="mt-10 grid max-w-xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4"
          >
            {STATS.map((s) => (
              <div
                key={s.value}
                className="ltr:border-l rtl:border-r ltr:pl-4 rtl:pr-4 border-gold-600/30"
              >
                <dt className="nums font-display text-2xl font-semibold text-maroon-600 sm:text-3xl">
                  {s.value}
                </dt>
                <dd className="mt-1 text-xs leading-snug text-ink-500">
                  {L(s.label)}
                </dd>
              </div>
            ))}
          </motion.dl>

          <motion.div variants={item} className="mt-8">
            <a
              href={`tel:${CONTACT.phoneIntl}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-ink-700 transition-colors hover:text-maroon-600"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-maroon-600/10 text-maroon-600">
                <Phone className="h-4 w-4" />
              </span>
              <span dir="ltr">{CONTACT.phone1}</span>
            </a>
          </motion.div>
        </motion.div>

        {/* Right: the funnel form */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE_LUXE, delay: 0.15 }}
          className="flex justify-center lg:justify-end"
        >
          <QuickRequest />
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.a
        href="#services"
        aria-label={dict.hero.scroll}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute inset-x-0 bottom-6 mx-auto hidden w-fit flex-col items-center gap-1.5 text-ink-500 transition-colors hover:text-maroon-600 sm:flex"
      >
        <span className="text-[0.65rem] font-medium uppercase tracking-[0.22em]">
          {dict.hero.scroll}
        </span>
        <motion.span
          animate={reduce ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="h-4 w-4" />
        </motion.span>
      </motion.a>
    </section>
  );
}
