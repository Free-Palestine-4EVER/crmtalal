"use client";

/**
 * SaudiMap — an interactive, hand-drawn (simplified, original) outline of
 * Saudi Arabia with the cities we serve. Hover/tap a city → gold ping +
 * bilingual label. Riyadh (HQ) breathes permanently.
 */

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/i18n";

type City = {
  id: string;
  ar: string;
  en: string;
  /** % coordinates inside the 100×88 viewBox */
  x: number;
  y: number;
  hq?: boolean;
  /** label placement relative to the pin */
  side?: "start" | "end";
  dy?: number;
};

const CITIES: City[] = [
  { id: "riyadh", ar: "الرياض", en: "Riyadh", x: 55, y: 42, hq: true, side: "end" },
  { id: "jeddah", ar: "جدة", en: "Jeddah", x: 23, y: 55, side: "start" },
  { id: "makkah", ar: "مكة", en: "Makkah", x: 26.5, y: 57.5, side: "end", dy: 2.2 },
  { id: "madinah", ar: "المدينة", en: "Madinah", x: 24, y: 40, side: "start" },
  { id: "dammam", ar: "الدمام", en: "Dammam", x: 71, y: 32, side: "end", dy: -1.2 },
  { id: "khobar", ar: "الخبر", en: "Khobar", x: 73.5, y: 34.5, side: "end", dy: 2 },
  { id: "buraidah", ar: "بريدة", en: "Buraidah", x: 43, y: 32, side: "start", dy: -1.4 },
  { id: "hail", ar: "حائل", en: "Hail", x: 35, y: 26, side: "start" },
  { id: "tabuk", ar: "تبوك", en: "Tabuk", x: 16, y: 18, side: "end" },
  { id: "abha", ar: "أبها", en: "Abha", x: 36, y: 73, side: "start" },
  { id: "jazan", ar: "جازان", en: "Jazan", x: 33, y: 81, side: "start" },
  { id: "najran", ar: "نجران", en: "Najran", x: 48, y: 76, side: "end" },
  { id: "alula", ar: "العلا", en: "AlUla", x: 22, y: 29, side: "start" },
  { id: "taif", ar: "الطائف", en: "Taif", x: 30, y: 59, side: "start", dy: 2.2 },
];

/** Original simplified silhouette of the Kingdom (not survey-accurate). */
const KSA_PATH =
  "M 13 9 L 30 16 L 38 14 L 46 19 L 52 19 L 57 23 L 68 25 " +
  "L 70 29 L 75 30 L 76 34 L 73 37 L 76 40 L 82 38 L 88 42 " +
  "L 86 47 L 80 50 L 76 56 L 67 60 L 62 66 L 55 70 L 50 79 " +
  "L 43 84 L 36 85 L 31 78 L 27 70 L 23 63 L 19 56 L 21 50 " +
  "L 17 44 L 14 36 L 9 28 L 12 21 Z";

export function SaudiMap() {
  const { locale } = useI18n();
  const ar = locale === "ar";
  const reduce = useReducedMotion();
  const [active, setActive] = useState<string | null>(null);

  const activeCity = CITIES.find((c) => c.id === active) ?? null;

  return (
    <div className="relative mx-auto w-full max-w-3xl" dir="ltr">
      <svg
        viewBox="0 0 100 88"
        className="h-auto w-full"
        role="img"
        aria-label={ar ? "خريطة المملكة العربية السعودية" : "Map of Saudi Arabia"}
      >
        <defs>
          <linearGradient id="ksa-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--s-accent)" stopOpacity="0.14" />
            <stop offset="55%" stopColor="var(--s-gold)" stopOpacity="0.07" />
            <stop offset="100%" stopColor="var(--s-accent)" stopOpacity="0.1" />
          </linearGradient>
          <radialGradient id="ksa-glow" cx="0.55" cy="0.45" r="0.6">
            <stop offset="0%" stopColor="var(--s-gold)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--s-gold)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* land mass */}
        <motion.path
          d={KSA_PATH}
          fill="url(#ksa-fill)"
          stroke="var(--s-gold)"
          strokeOpacity={0.75}
          strokeWidth={0.5}
          strokeLinejoin="round"
          initial={reduce ? { opacity: 1 } : { pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 2.2, ease: "easeInOut" }}
        />
        <path d={KSA_PATH} fill="url(#ksa-glow)" />

        {/* cities */}
        {CITIES.map((c, i) => {
          const isActive = active === c.id;
          return (
            <g
              key={c.id}
              transform={`translate(${c.x} ${c.y})`}
              onPointerEnter={() => setActive(c.id)}
              onPointerLeave={() => setActive(null)}
              onClick={() => setActive(isActive ? null : c.id)}
              className="cursor-pointer"
            >
              {/* generous invisible hit area */}
              <circle r={3.2} fill="transparent" />
              {/* breathing ping — permanent for HQ, on-hover for the rest */}
              {(c.hq || isActive) && !reduce && (
                <motion.circle
                  r={1.2}
                  fill="none"
                  stroke="var(--s-gold)"
                  strokeWidth={0.25}
                  animate={{ r: [1.2, 2.8], opacity: [0.8, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                />
              )}
              <motion.circle
                r={c.hq ? 1.25 : 0.95}
                fill={c.hq || isActive ? "var(--s-gold)" : "var(--s-accent)"}
                initial={reduce ? { scale: 1 } : { scale: 0 }}
                whileInView={{ scale: isActive ? 1.45 : 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: reduce ? 0 : 0.35 + i * 0.05, type: "spring", stiffness: 320, damping: 18 }}
              />
              {/* city name label */}
              <motion.text
                x={c.side === "end" ? 2.2 : -2.2}
                y={(c.dy ?? 0) + 0.9}
                textAnchor={c.side === "end" ? "start" : "end"}
                fontSize={2.9}
                fontWeight={c.hq ? 700 : 500}
                fill={c.hq || isActive ? "var(--s-gold)" : "var(--s-fg)"}
                fillOpacity={c.hq || isActive ? 1 : 0.78}
                style={{ fontFamily: "var(--font-arabic)" }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: reduce ? 0 : 0.5 + i * 0.05, duration: 0.5 }}
              >
                {ar ? c.ar : c.en}
              </motion.text>
            </g>
          );
        })}
      </svg>

      {/* floating bilingual label */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-2 flex justify-center">
        <motion.div
          key={activeCity?.id ?? "hint"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-full border border-line bg-scard px-5 py-2 shadow-[0_14px_40px_-20px_var(--s-glow)]"
        >
          {activeCity ? (
            <span className="flex items-baseline gap-3">
              <span className="font-display text-base font-semibold text-fg">
                {ar ? activeCity.ar : activeCity.en}
              </span>
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-sgold">
                {activeCity.hq ? (ar ? "المقر الرئيسي" : "HQ") : ar ? activeCity.en : activeCity.ar}
              </span>
            </span>
          ) : (
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted">
              {ar ? "مرّر على أي مدينة" : "Hover any city"}
            </span>
          )}
        </motion.div>
      </div>
    </div>
  );
}
