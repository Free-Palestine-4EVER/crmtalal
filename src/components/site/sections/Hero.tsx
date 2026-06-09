"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Phone, ArrowDown } from "lucide-react";
import { TopoPattern } from "@/components/brand/TopoPattern";
import { QuickRequest } from "@/components/site/QuickRequest";
import { Counter } from "@/components/site/Counter";
import { GoldDust } from "@/components/site/GoldDust";
import { CircularBadge } from "@/components/site/CircularBadge";
import { useI18n } from "@/i18n";
import { STATS, CONTACT } from "@/content/site";
import { EASE_LUXE } from "@/components/motion/variants";
import { cn } from "@/lib/cn";

const Hero3D = dynamic(
  () => import("@/components/site/Hero3D").then((m) => m.Hero3D),
  { ssr: false },
);

function RevealHeadline({ title, accent }: { title: string; accent: string }) {
  const reduce = useReducedMotion();
  const idx = accent ? title.indexOf(accent) : -1;
  const segs =
    idx === -1
      ? [{ text: title, accent: false }]
      : [
          { text: title.slice(0, idx), accent: false },
          { text: accent, accent: true },
          { text: title.slice(idx + accent.length), accent: false },
        ];
  const words = segs.flatMap((s, si) =>
    s.text
      .split(/\s+/)
      .filter(Boolean)
      .map((w, wi) => ({ w, accent: s.accent, key: `${si}-${wi}` })),
  );

  return (
    <motion.h1
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.055, delayChildren: 0.1 } } }}
      className="max-w-3xl font-display text-[2.8rem] font-semibold leading-[1.02] text-fg sm:text-6xl lg:text-[4.4rem] xl:text-[5rem]"
    >
      {words.map((it) => (
        <span
          key={it.key}
          className="inline-block overflow-hidden pe-[0.26em] align-bottom"
        >
          <motion.span
            variants={{
              hidden: reduce ? { opacity: 0 } : { y: "118%" },
              show: { y: 0, opacity: 1, transition: { duration: 0.75, ease: EASE_LUXE } },
            }}
            className={cn("inline-block", it.accent && "text-gold-shimmer")}
          >
            {it.w}
          </motion.span>
        </span>
      ))}
    </motion.h1>
  );
}

export function Hero() {
  const { dict, L } = useI18n();
  const reduce = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-surface">
      <div className="grid lg:min-h-svh lg:grid-cols-[1.04fr_0.96fr]">
        {/* ════ LEFT — editorial light panel ════ */}
        <div className="grain relative flex flex-col justify-center px-5 pb-16 pt-28 sm:px-10 sm:pt-32 lg:ps-[max(2.5rem,calc((100vw-80rem)/2+2rem))] lg:pe-14 lg:pt-24">
          <div className="spotlight pointer-events-none absolute inset-0 -z-10" />
          <TopoPattern className="text-[var(--s-accent)]" opacity={0.05} />

          {/* rotating gold seal, floating near the seam */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute -end-2 top-24 hidden xl:block"
          >
            <CircularBadge />
          </motion.div>

          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-scard/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-sgold backdrop-blur"
          >
            <BadgeCheck className="h-4 w-4" />
            {dict.hero.eyebrow}
          </motion.span>

          <div className="mt-7">
            <RevealHeadline title={dict.hero.title} accent={dict.hero.titleAccent} />
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-soft sm:text-lg"
          >
            {dict.hero.subtitle}
          </motion.p>

          {/* monumental stats */}
          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-12 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4"
          >
            {STATS.map((s) => (
              <div key={s.value} className="border-s-2 border-[var(--s-gold)]/40 ps-4">
                <dt className="nums font-display text-[1.9rem] font-semibold leading-none text-accent sm:text-[2.3rem]">
                  <Counter value={s.value} />
                </dt>
                <dd className="mt-2 text-xs leading-snug text-muted">{L(s.label)}</dd>
              </div>
            ))}
          </motion.dl>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <motion.a
              href={`tel:${CONTACT.phoneIntl}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.85 }}
              className="group inline-flex items-center gap-2.5 text-sm font-medium text-soft transition-colors hover:text-accent"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--s-accent)]/10 text-accent transition-transform group-hover:scale-110">
                <Phone className="h-4 w-4" />
              </span>
              <span dir="ltr">{CONTACT.phone1}</span>
            </motion.a>

            <motion.a
              href="#services"
              aria-label={dict.hero.scroll}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="hidden items-center gap-2.5 text-muted transition-colors hover:text-accent sm:inline-flex"
            >
              <motion.span
                animate={reduce ? {} : { y: [0, 5, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="grid h-10 w-10 place-items-center rounded-full border border-line"
              >
                <ArrowDown className="h-4 w-4" />
              </motion.span>
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.22em]">
                {dict.hero.scroll}
              </span>
            </motion.a>
          </div>
        </div>

        {/* ════ RIGHT — cinematic dark panel: skyline + 3D + floating form ════ */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: EASE_LUXE, delay: 0.2 }}
          className="bg-brand-radial bg-grain relative flex flex-col overflow-hidden"
        >
          {/* skyline photo, deep-graded into the panel */}
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center opacity-[0.32]"
            style={{ backgroundImage: "url('/images/parallax-1.jpg')" }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,11,14,0.55) 0%, rgba(42,7,18,0.35) 45%, rgba(10,11,14,0.78) 100%)",
            }}
          />
          {/* gold heartbeat glow behind the model */}
          <motion.div
            aria-hidden
            animate={reduce ? undefined : { opacity: [0.5, 0.95, 0.5], scale: [1, 1.07, 1] }}
            transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
            className="pointer-events-none absolute inset-x-0 top-0 h-[55%]"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 38%, rgba(201,162,76,0.3), transparent 70%)",
            }}
          />

          {/* the 3D ribbon — large, solid, alive */}
          <div className="absolute inset-0">
            <Hero3D />
          </div>

          <GoldDust />

          {/* gold seam hairline between the two worlds */}
          <span className="pointer-events-none absolute inset-y-0 start-0 hidden w-px bg-gradient-to-b from-transparent via-gold-500/60 to-transparent lg:block" />

          {/* breathing room for the model, then the floating request form */}
          <div className="h-[19rem] shrink-0 sm:h-[21rem] lg:h-auto lg:grow" />
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: EASE_LUXE, delay: 0.5 }}
            className="relative z-10 flex justify-center px-5 pb-10 sm:px-10 lg:pb-14"
          >
            <QuickRequest />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
