"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { PenLine, ShieldCheck, FileCheck2, Stamp } from "lucide-react";
import { TopoPattern } from "@/components/brand/TopoPattern";
import { GoldDust } from "@/components/site/GoldDust";
import { useI18n } from "@/i18n";
import { EASE_LUXE } from "@/components/motion/variants";

const Pen3D = dynamic(() => import("@/components/site/Pen3D").then((m) => m.Pen3D), {
  ssr: false,
});

export function PenSignature() {
  const { locale } = useI18n();
  const ar = locale === "ar";
  const reduce = useReducedMotion();

  const points = [
    {
      icon: ShieldCheck,
      title: ar ? "موقّع ومعتمد" : "Signed & accredited",
      desc: ar
        ? "كل تقرير موقّع من مقيّم معتمد من الهيئة السعودية (تقييم)."
        : "Every report is signed by a TAQEEM-accredited valuer.",
    },
    {
      icon: FileCheck2,
      title: ar ? "قابل للتدقيق" : "Fully auditable",
      desc: ar
        ? "منهجية واضحة وأدلة موثّقة خلف كل رقم."
        : "A clear methodology and documented evidence behind every figure.",
    },
    {
      icon: Stamp,
      title: ar ? "مختوم رسميًا" : "Officially sealed",
      desc: ar
        ? "تقرير رسمي تُبنى عليه قرارات التمويل والاستثمار."
        : "A formal certificate that financing and investment decisions rest on.",
    },
  ];

  return (
    <section className="bg-brand-radial bg-grain relative isolate overflow-hidden py-24 sm:py-28">
      <TopoPattern className="text-gold-500" opacity={0.1} />
      <div className="glow-gold pointer-events-none absolute inset-x-0 -top-16 h-72 opacity-70" />
      <GoldDust />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-8">
        {/* ── Text ── */}
        <div className="order-2 lg:order-1">
          <motion.span
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 rounded-full border border-gold-500/30 bg-ink-900/40 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-gold-300 backdrop-blur"
          >
            <PenLine className="h-3.5 w-3.5" />
            {ar ? "توقيع الثقة" : "The signature of trust"}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE_LUXE, delay: 0.06 }}
            className="mt-6 text-balance font-display text-[2.4rem] font-semibold leading-[1.06] text-cream-50 sm:text-5xl md:text-[3.4rem]"
          >
            {ar ? (
              <>
                موقّعة. مختومة.{" "}
                <span className="text-gradient-gold">معتمدة.</span>
              </>
            ) : (
              <>
                Signed. Sealed.{" "}
                <span className="text-gradient-gold">Certified.</span>
              </>
            )}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.14 }}
            className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-cream-100/75 sm:text-lg"
          >
            {ar
              ? "لا يكتمل التقييم حتى تُوضع التوقيعات. كل تقرير من إدارة يحمل توقيع خبير معتمد وختمًا رسميًا — وثيقة تصمد أمام البنوك والمحاكم والمستثمرين."
              : "A valuation isn't finished until it's signed. Each Edarah report carries a certified expert's signature and an official seal — a document that stands up to banks, courts, and investors."}
          </motion.p>

          <div className="mt-9 space-y-4">
            {points.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, x: ar ? 18 : -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.08 }}
                className="flex items-start gap-4"
              >
                <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-300">
                  <p.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-cream-50">
                    {p.title}
                  </h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-cream-100/65">
                    {p.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Pen 3D stage ── */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: EASE_LUXE }}
          className="relative order-1 h-[24rem] w-full lg:order-2 lg:h-[30rem]"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 55% at 50% 45%, rgba(201,162,76,0.28), transparent 65%)",
            }}
          />
          <div className="absolute inset-0">
            <Pen3D />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
