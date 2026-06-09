"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useI18n } from "@/i18n";
import type { LocalizedText } from "@/i18n/config";

type Props = {
  /** photo fallback / poster */
  image: string;
  /** when set, a looping muted video replaces the photo */
  video?: string;
  poster?: string;
  eyebrow: LocalizedText;
  title: LocalizedText;
  sub?: LocalizedText;
  /** fallback gradient shown until media is available */
  fallback?: string;
  /** chapter index shown as mono numeral, e.g. "02" */
  index?: string;
  align?: "center" | "start";
  /** image-only mode — for artwork with text already baked in */
  bare?: boolean;
  /** floating 3D ornament rendered beside the title (e.g. the ribbon mark) */
  ornament?: ReactNode;
  /** text enters from the RIGHT and keeps drifting right→left with scroll */
  slide?: boolean;
};

const DEFAULT_FALLBACK =
  "linear-gradient(135deg, #2a0712 0%, #72142f 45%, #14161d 100%)";

/**
 * Full-bleed cinematic chapter divider. The media layer travels hard against
 * the scroll (aggressive depth), text bottom-anchored like a film title card.
 */
export function ParallaxShowcase({
  image,
  video,
  poster,
  eyebrow,
  title,
  sub,
  fallback = DEFAULT_FALLBACK,
  index,
  bare = false,
  ornament,
  slide = false,
}: Props) {
  const { L } = useI18n();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // aggressive, spring-smoothed travel
  const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.4 });
  const y = useTransform(smooth, [0, 1], reduce ? ["0%", "0%"] : ["-26%", "26%"]);
  const textY = useTransform(smooth, [0.4, 1], reduce ? ["0%", "0%"] : ["0%", "60%"]);
  // slide mode: continuous right→left drift while the section scrolls
  const textX = useTransform(
    smooth,
    [0.1, 0.9],
    !slide || reduce ? [0, 0] : [90, -70],
  );

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[92svh] items-end overflow-hidden"
      style={{ background: fallback }}
    >
      {/* parallax media layer */}
      <motion.div
        aria-hidden
        style={{ y, ...(video ? {} : { backgroundImage: `url("${image}")` }) }}
        className="pointer-events-none absolute inset-[-26%] scale-105 bg-cover bg-center will-change-transform"
      >
        {video && (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={video}
            poster={poster ?? image}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        )}
      </motion.div>
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

      {/* floating 3D ornament — spins with scroll via its own stage */}
      {ornament && (
        <div
          aria-hidden
          className="pointer-events-none absolute end-[4%] top-1/2 z-10 hidden h-72 w-72 -translate-y-1/2 lg:block xl:h-96 xl:w-96"
        >
          {ornament}
        </div>
      )}

      {!bare && (
        <motion.div
          style={{ y: textY, x: textX }}
          className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-14 sm:px-8 sm:pb-20"
        >
          {/* kicker rule */}
          <motion.div
            initial={slide ? { opacity: 0, x: 90 } : { opacity: 0, y: 16 }}
            whileInView={slide ? { opacity: 1, x: 0 } : { opacity: 1, y: 0 }}
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
            initial={slide ? { opacity: 0, x: 140 } : { opacity: 0, y: 32 }}
            whileInView={slide ? { opacity: 1, x: 0 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            className="mt-7 max-w-4xl text-balance font-display text-[2.6rem] font-semibold leading-[1.02] text-cream-50 drop-shadow-[0_2px_28px_rgba(0,0,0,0.55)] sm:text-6xl lg:text-7xl"
          >
            {L(title)}
          </motion.h2>

          {sub && (
            <motion.p
              initial={slide ? { opacity: 0, x: 110 } : { opacity: 0, y: 22 }}
              whileInView={slide ? { opacity: 1, x: 0 } : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: 0.16 }}
              className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-cream-100/80 sm:text-lg"
            >
              {L(sub)}
            </motion.p>
          )}
        </motion.div>
      )}
    </section>
  );
}
