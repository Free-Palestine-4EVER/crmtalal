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
  /** chapter index shown as mono numeral, e.g. "02" */
  index?: string;
  align?: "center" | "start";
  /** image-only mode — for artwork with text already baked in */
  bare?: boolean;
};

const DEFAULT_FALLBACK =
  "linear-gradient(135deg, #2a0712 0%, #72142f 45%, #14161d 100%)";

/**
 * Full-bleed photographic chapter divider. The image drifts slower than the
 * page (depth), the text is bottom-anchored like a film title card.
 */
export function ParallaxShowcase({
  image,
  eyebrow,
  title,
  sub,
  fallback = DEFAULT_FALLBACK,
  index,
  bare = false,
}: Props) {
  const { L } = useI18n();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-10%", "10%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], reduce ? [1, 1, 1] : [1.08, 1.02, 1.08]);

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[88svh] items-end overflow-hidden"
      style={{ background: fallback }}
    >
      {/* parallax photo layer */}
      <motion.div
        aria-hidden
        style={{ y, scale, backgroundImage: `url("${image}")` }}
        className="pointer-events-none absolute inset-[-10%] bg-cover bg-center"
      />
      {/* film grade */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: bare
            ? "linear-gradient(to top, rgba(8,4,5,0.45), transparent 35%)"
            : "linear-gradient(to top, rgba(8,4,5,0.94) 0%, rgba(8,4,5,0.35) 42%, rgba(8,4,5,0.18) 100%)",
        }}
      />
      <div className="grain pointer-events-none absolute inset-0" />

      {!bare && (
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-14 sm:px-8 sm:pb-20">
          {/* kicker rule */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="flex items-baseline gap-4 border-t border-cream-50/20 pt-5"
          >
            {index && (
              <span className="font-mono text-xs font-medium tracking-[0.2em] text-gold-300">
                /&nbsp;{index}
              </span>
            )}
            <span className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-cream-100/70">
              {L(eyebrow)}
            </span>
            <span
              aria-hidden
              className="ms-auto hidden font-mono text-xs tracking-[0.2em] text-cream-100/40 sm:block"
            >
              25.7°N — 46.7°E
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            className="mt-7 max-w-4xl text-balance font-display text-[2.6rem] font-semibold leading-[1.02] text-cream-50 drop-shadow-[0_2px_28px_rgba(0,0,0,0.55)] sm:text-6xl lg:text-7xl"
          >
            {L(title)}
          </motion.h2>

          {sub && (
            <motion.p
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: 0.16 }}
              className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-cream-100/80 sm:text-lg"
            >
              {L(sub)}
            </motion.p>
          )}
        </div>
      )}
    </section>
  );
}
