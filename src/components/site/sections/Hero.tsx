"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Phone, ArrowDown, MousePointer2 } from "lucide-react";
import { TopoPattern } from "@/components/brand/TopoPattern";
import { QuickRequest } from "@/components/site/QuickRequest";
import { Counter } from "@/components/site/Counter";
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
      className="max-w-2xl font-display text-[2.6rem] font-semibold leading-[1.04] text-fg sm:text-6xl lg:text-[4rem]"
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
  const { dict, L, locale } = useI18n();
  const ar = locale === "ar";
  const reduce = useReducedMotion();

  return (
    <section className="grain relative isolate overflow-hidden bg-surface">
      <div className="spotlight pointer-events-none absolute inset-0 z-0" />
      <TopoPattern className="text-[var(--s-accent)]" opacity={0.05} />

      <div className="relative z-10 mx-auto grid max-w-7xl items-start gap-12 px-5 pb-20 pt-28 sm:px-8 sm:pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pb-28 lg:pt-36">
        {/* ── LEFT: copy → stats → 3D stage ── */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-scard/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-sgold backdrop-blur"
          >
            <BadgeCheck className="h-4 w-4" />
            {dict.hero.eyebrow}
          </motion.span>

          <div className="mt-6">
            <RevealHeadline title={dict.hero.title} accent={dict.hero.titleAccent} />
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-soft sm:text-lg"
          >
            {dict.hero.subtitle}
          </motion.p>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-9 grid max-w-xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4"
          >
            {STATS.map((s) => (
              <div key={s.value} className="border-s border-[var(--s-gold)]/30 ps-4">
                <dt className="nums font-display text-2xl font-semibold text-accent sm:text-[1.9rem]">
                  <Counter value={s.value} />
                </dt>
                <dd className="mt-1 text-xs leading-snug text-muted">{L(s.label)}</dd>
              </div>
            ))}
          </motion.dl>

          <motion.a
            href={`tel:${CONTACT.phoneIntl}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="group mt-7 inline-flex items-center gap-2.5 text-sm font-medium text-soft transition-colors hover:text-accent"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--s-accent)]/10 text-accent transition-transform group-hover:scale-110">
              <Phone className="h-4 w-4" />
            </span>
            <span dir="ltr">{CONTACT.phone1}</span>
          </motion.a>

          {/* ── 3D stage, below the left text ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_LUXE, delay: 0.6 }}
            className="relative mt-12 h-[20rem] w-full overflow-hidden rounded-[1.75rem] border border-line bg-scard sm:h-[24rem]"
          >
            {/* opaque, lit backdrop so the 3D reads solid — never ghostly */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 90% at 50% 12%, color-mix(in oklab, var(--s-gold) 22%, transparent), transparent 60%), radial-gradient(90% 80% at 80% 100%, color-mix(in oklab, var(--s-accent) 26%, transparent), transparent 65%)",
              }}
            />
            <TopoPattern className="text-[var(--s-gold)]" opacity={0.07} />
            <div className="absolute inset-0">
              <Hero3D />
            </div>
            {/* caption chip */}
            <div className="pointer-events-none absolute bottom-4 start-4 inline-flex items-center gap-2 rounded-full border border-line/70 bg-surface/70 px-3 py-1.5 text-[0.68rem] font-medium text-muted backdrop-blur">
              <MousePointer2 className="h-3.5 w-3.5 text-sgold" />
              {ar ? "حرّك المؤشر للتفاعل" : "Move your cursor to interact"}
            </div>
            {/* gold top hairline */}
            <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[var(--s-gold)]/70 to-transparent" />
          </motion.div>
        </div>

        {/* ── RIGHT: conversion form ── */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE_LUXE, delay: 0.25 }}
          className="flex justify-center lg:sticky lg:top-28 lg:justify-end"
        >
          <QuickRequest />
        </motion.div>
      </div>

      <motion.a
        href="#services"
        aria-label={dict.hero.scroll}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="absolute inset-x-0 bottom-6 mx-auto hidden w-fit flex-col items-center gap-1.5 text-muted transition-colors hover:text-accent sm:flex"
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
