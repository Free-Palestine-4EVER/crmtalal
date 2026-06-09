"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useI18n } from "@/i18n";
import type { LocalizedText } from "@/i18n/config";

type Props = {
  image: string;
  eyebrow: LocalizedText;
  title: LocalizedText;
  sub?: LocalizedText;
  /** fallback gradient shown until the photo is dropped in */
  fallback?: string;
  align?: "center" | "start";
};

const DEFAULT_FALLBACK =
  "linear-gradient(135deg, #2a0712 0%, #72142f 45%, #14161d 100%)";

export function ParallaxShowcase({
  image,
  eyebrow,
  title,
  sub,
  fallback = DEFAULT_FALLBACK,
  align = "center",
}: Props) {
  const { L } = useI18n();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // photo drifts up slower than the page → depth
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-12%", "12%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], reduce ? [1, 1, 1] : [1.12, 1.04, 1.12]);
  const textY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["18%", "-18%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.55, 0.42, 0.62]);

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[82svh] items-center overflow-hidden"
      style={{ background: fallback }}
    >
      {/* parallax photo layer (background-image → no broken icon if absent) */}
      <motion.div
        aria-hidden
        style={{
          y,
          scale,
          backgroundImage: `url("${image}")`,
        }}
        className="pointer-events-none absolute inset-[-12%] bg-cover bg-center"
      />
      {/* legibility overlays */}
      <motion.div
        aria-hidden
        style={{ opacity: overlayOpacity }}
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0405] via-[#0a0405]/40 to-[#0a0405]/60"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 70% at 50% 50%, transparent 30%, rgba(8,4,5,0.55) 100%)",
        }}
      />
      {/* fine grain */}
      <div className="grain pointer-events-none absolute inset-0" />

      <motion.div
        style={{ y: textY }}
        className={`relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-8 ${
          align === "center" ? "text-center" : "text-start"
        }`}
      >
        <div className={align === "center" ? "mx-auto max-w-3xl" : "max-w-2xl"}>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-gold-300"
          >
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold-500/80" />
            {L(eyebrow)}
            {align === "center" && (
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-gold-500/80" />
            )}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            className="mt-6 text-balance font-display text-[2.5rem] font-semibold leading-[1.05] text-cream-50 drop-shadow-[0_2px_30px_rgba(0,0,0,0.6)] sm:text-6xl md:text-[4.2rem]"
          >
            {L(title)}
          </motion.h2>

          {sub && (
            <motion.p
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.16 }}
              className={`mt-6 text-pretty text-base leading-relaxed text-cream-100/85 sm:text-lg ${
                align === "center" ? "mx-auto max-w-2xl" : "max-w-xl"
              }`}
            >
              {L(sub)}
            </motion.p>
          )}
        </div>
      </motion.div>
    </section>
  );
}
