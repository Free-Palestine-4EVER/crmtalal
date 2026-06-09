"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { Phone, ArrowDown } from "lucide-react";
import { QuickRequest } from "@/components/site/QuickRequest";
import { Counter } from "@/components/site/Counter";
import { GoldDust } from "@/components/site/GoldDust";
import { CircularBadge } from "@/components/site/CircularBadge";
import { Magnetic } from "@/components/site/Magnetic";
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
      className="max-w-3xl font-display text-[2.7rem] font-semibold leading-[1.04] text-cream-50 drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)] sm:text-6xl lg:text-[4.1rem] xl:text-[4.6rem]"
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
            className={cn("inline-block", it.accent && "text-gradient-gold")}
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
  const dir = locale === "ar" ? "rtl" : "ltr";
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  // extended scroll stage — the tower DESCENDS into frame while the page scrolls
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 22,
    mass: 0.8,
  });
  // true parallax: each layer travels at its own speed.
  // The tower starts HALF revealed (pushed down) and rises fully into frame.
  const towerY = useTransform(smoothProgress, [0, 1], reduce ? ["0%", "0%"] : ["30%", "-8%"]);
  const copyY = useTransform(smoothProgress, [0, 1], reduce ? [0, 0] : [0, -110]);
  const copyOpacity = useTransform(scrollYProgress, [0.55, 1], [1, reduce ? 1 : 0.3]);
  const skyY = useTransform(smoothProgress, [0, 1], reduce ? ["0%", "0%"] : ["-6%", "18%"]);
  const formY = useTransform(smoothProgress, [0, 1], reduce ? [0, 0] : [0, -45]);

  return (
    <section ref={ref} className="relative lg:h-[175svh]">
      <div className="bg-grain relative isolate overflow-hidden bg-ink-950 lg:sticky lg:top-0 lg:h-svh">
      {/* ── ONE full-bleed cinematic backdrop ── */}
      <motion.div
        aria-hidden
        style={{ y: skyY, backgroundImage: "url('/images/parallax-1.jpg')" }}
        className="absolute inset-[-8%] bg-cover bg-center opacity-45 will-change-transform"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,11,14,0.62) 0%, rgba(42,7,18,0.3) 45%, rgba(10,11,14,0.82) 100%)",
        }}
      />
      {/* gold heartbeat glow */}
      <motion.div
        aria-hidden
        animate={reduce ? undefined : { opacity: [0.45, 0.85, 0.45], scale: [1, 1.06, 1] }}
        transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
        className="pointer-events-none absolute inset-x-0 top-0 h-[60%]"
        style={{
          background:
            "radial-gradient(55% 60% at 32% 42%, rgba(201,162,76,0.26), transparent 70%)",
        }}
      />
      <GoldDust />

      {/* ── content grid — dir=ltr PINS the sides in both locales:
             col-1 = tower+copy (LEFT), col-2 = form (RIGHT) ── */}
      <div
        dir="ltr"
        className="relative z-10 mx-auto grid min-h-svh max-w-7xl items-center gap-10 px-5 pb-16 pt-28 sm:px-8 sm:pt-32 lg:grid-cols-[1.08fr_0.92fr] lg:gap-6 lg:pt-24"
      >
        {/* ════ TOWER + TEXT OVER IT — physically LEFT ════ */}
        <div dir={dir} className="relative lg:min-h-[94svh]">
          {/* the 3D tower fills this half, descending into frame on scroll */}
          <motion.div
            style={{ y: towerY }}
            className="absolute inset-x-0 -bottom-24 top-[-3rem] will-change-transform lg:-bottom-32"
            aria-hidden
          >
            <Hero3D />
          </motion.div>

          {/* rotating gold seal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute end-0 top-0 hidden xl:block"
          >
            <CircularBadge />
          </motion.div>

          {/* copy — sits over the tower */}
          <motion.div
            style={{ y: copyY, opacity: copyOpacity }}
            className="relative z-10 flex h-full flex-col justify-center py-10 lg:py-16"
          >
            <motion.span
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex w-fit items-center gap-3 font-mono text-[0.7rem] font-medium uppercase tracking-[0.3em] text-gold-300"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-400" />
              </span>
              {dict.hero.eyebrow}
            </motion.span>

            <div className="mt-6">
              <RevealHeadline title={dict.hero.title} accent={dict.hero.titleAccent} />
            </div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-cream-100/80 drop-shadow-[0_1px_12px_rgba(0,0,0,0.5)] sm:text-lg"
            >
              {dict.hero.subtitle}
            </motion.p>

            {/* monumental stats */}
            <motion.dl
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="mt-10 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-4"
            >
              {STATS.map((s) => (
                <div key={s.value} className="border-t border-cream-50/20 pt-4">
                  <dt className="nums font-mono text-2xl font-semibold leading-none tracking-tight text-cream-50 sm:text-[1.7rem]">
                    <Counter value={s.value} />
                  </dt>
                  <dd className="mt-2 font-mono text-[0.62rem] uppercase leading-snug tracking-[0.18em] text-cream-100/55">
                    {L(s.label)}
                  </dd>
                </div>
              ))}
            </motion.dl>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Magnetic>
                  <a
                    href="#request"
                    className="group inline-flex h-13 items-center gap-3 rounded-full bg-gradient-to-b from-gold-500 to-gold-600 px-7 font-semibold text-ink-950 shadow-[0_18px_50px_-16px_rgba(201,162,76,0.55)] transition-shadow hover:shadow-[0_22px_60px_-14px_rgba(201,162,76,0.75)]"
                  >
                    {dict.hero.ctaPrimary}
                    <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                  </a>
                </Magnetic>
              </motion.div>
              <motion.a
                href={`tel:${CONTACT.phoneIntl}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="group inline-flex items-center gap-2.5 font-mono text-sm font-medium text-cream-100/80 transition-colors hover:text-gold-300"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full border border-cream-50/25 text-gold-300 transition-transform group-hover:scale-110">
                  <Phone className="h-4 w-4" />
                </span>
                <span dir="ltr">{CONTACT.phone1}</span>
              </motion.a>
            </div>

            {/* mono coordinates footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              aria-hidden
              className="mt-12 hidden font-mono text-[0.62rem] tracking-[0.25em] text-cream-100/40 lg:block"
            >
              RIYADH HQ — 24.7136°N, 46.6753°E&nbsp;&nbsp;·&nbsp;&nbsp;EST. 2012&nbsp;&nbsp;·&nbsp;&nbsp;TAQEEM LICENSE
            </motion.p>
          </motion.div>
        </div>

        {/* ════ FORM — pure glass over the image, physically RIGHT ════ */}
        <motion.div
          id="request"
          dir={dir}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: EASE_LUXE, delay: 0.45 }}
          style={{ y: formY }}
          className="flex scroll-mt-24 justify-center pb-6 lg:justify-end lg:pb-0"
        >
          <QuickRequest />
        </motion.div>
      </div>

        {/* bottom fade into the next section */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--s-bg2)] to-transparent"
        />
      </div>
    </section>
  );
}
