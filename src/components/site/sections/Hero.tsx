"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LogoMark } from "@/components/brand/Logo";
import { TopoPattern } from "@/components/brand/TopoPattern";
import { useI18n } from "@/i18n";
import { STATS } from "@/content/site";
import { EASE_LUXE } from "@/components/motion/variants";

/** Render a headline, wrapping the accent phrase in the gold gradient. */
function AccentedTitle({ title, accent }: { title: string; accent: string }) {
  const idx = accent ? title.indexOf(accent) : -1;
  if (idx === -1) return <>{title}</>;
  return (
    <>
      {title.slice(0, idx)}
      <span className="text-gradient-gold">{accent}</span>
      {title.slice(idx + accent.length)}
    </>
  );
}

export function Hero() {
  const { dict, L } = useI18n();
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
  };
  const item = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 26 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: EASE_LUXE },
    },
  };

  return (
    <section className="bg-brand-radial relative isolate flex min-h-svh flex-col justify-center overflow-hidden">
      {/* textures */}
      <TopoPattern className="text-gold-500" opacity={0.16} />
      <div className="glow-gold pointer-events-none absolute inset-x-0 top-0 h-[60vh]" />

      {/* giant corner watermark */}
      <div className="pointer-events-none absolute -bottom-16 select-none opacity-[0.05] ltr:-right-10 rtl:-left-10">
        <LogoMark className="h-[34rem] w-auto" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-5 pb-20 pt-32 sm:px-8 sm:pt-36">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex max-w-3xl flex-col items-start"
        >
          {/* eyebrow */}
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-gold-300"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold-400" />
            </span>
            {dict.hero.eyebrow}
          </motion.span>

          {/* headline */}
          <motion.h1
            variants={item}
            className="mt-7 text-balance font-display text-[2.6rem] font-semibold leading-[1.05] text-cream-50 sm:text-6xl lg:text-7xl"
          >
            <AccentedTitle title={dict.hero.title} accent={dict.hero.titleAccent} />
          </motion.h1>

          {/* subtitle */}
          <motion.p
            variants={item}
            className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-cream-100/65 sm:text-lg"
          >
            {dict.hero.subtitle}
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-4">
            <Button href="/register" variant="gold" size="lg">
              {dict.hero.ctaPrimary}
            </Button>
            <Button href="#services" variant="outline" size="lg">
              {dict.hero.ctaSecondary}
            </Button>
          </motion.div>

          {/* stats */}
          <motion.dl
            variants={item}
            className="mt-14 grid w-full max-w-2xl grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-4"
          >
            {STATS.map((s) => (
              <div key={s.value} className="flex flex-col gap-1.5 ltr:border-l rtl:border-r ltr:pl-4 rtl:pr-4 border-gold-500/25">
                <dt className="nums font-display text-2xl font-semibold text-gradient-gold sm:text-3xl">
                  {s.value}
                </dt>
                <dd className="text-xs leading-snug text-cream-100/55">{L(s.label)}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.a
        href="#services"
        aria-label={dict.hero.scroll}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute inset-x-0 bottom-7 mx-auto flex w-fit flex-col items-center gap-2 text-cream-100/45 transition-colors hover:text-gold-300"
      >
        <span className="text-[0.65rem] font-medium uppercase tracking-[0.25em]">
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
