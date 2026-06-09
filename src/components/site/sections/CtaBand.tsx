"use client";

import dynamic from "next/dynamic";
import { MessageCircle, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";
import { Magnetic } from "@/components/site/Magnetic";
import { GoldDust } from "@/components/site/GoldDust";
import { Button } from "@/components/ui/Button";
import { TopoPattern } from "@/components/brand/TopoPattern";
import { useI18n } from "@/i18n";
import { CONTACT } from "@/content/site";
import { EASE_LUXE } from "@/components/motion/variants";

const Ribbon3D = dynamic(
  () => import("@/components/site/Ribbon3D").then((m) => m.Ribbon3D),
  { ssr: false },
);

export function CtaBand() {
  const { dict, locale } = useI18n();
  const reduce = useReducedMotion();

  return (
    <section className="relative px-5 py-20 sm:px-8 sm:py-24">
      <div className="bg-brand bg-grain relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-maroon-600/40 px-6 py-20 text-center shadow-[0_40px_120px_-50px_rgba(127,24,54,0.7)] sm:px-12 sm:py-24">
        <TopoPattern className="text-gold-500" opacity={0.14} />

        {/* gold hairline along the top edge */}
        <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/70 to-transparent" />

        {/* animated, breathing gold glow */}
        <motion.div
          aria-hidden
          className="glow-gold pointer-events-none absolute inset-x-0 -top-10 h-64"
          animate={reduce ? undefined : { opacity: [0.55, 1, 0.55], scale: [1, 1.06, 1] }}
          transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
        />
        {/* soft maroon counter-glow, bottom */}
        <div className="glow-maroon pointer-events-none absolute inset-x-0 bottom-0 h-48 rotate-180 opacity-60" />

        {/* the 3D ribbon mark, spinning behind the call to action */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60">
          <Ribbon3D />
        </div>
        <GoldDust className="opacity-70" />

        <div className="relative mx-auto max-w-3xl">
          <Reveal y={16}>
            <span className="inline-flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-gold-300">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold-500/70" />
              {locale === "ar" ? "ابدأ الآن" : "Get started"}
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-gold-500/70" />
            </span>
          </Reveal>

          <Reveal delay={0.06}>
            <h2 className="mt-5 text-balance font-display text-[2.25rem] font-semibold leading-[1.05] text-cream-50 sm:text-5xl md:text-[3.25rem]">
              {dict.cta.title}
            </h2>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-cream-100/75 sm:text-lg">
              {dict.cta.subtitle}
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <motion.div
              className="mt-10 flex flex-wrap justify-center gap-4"
              whileInView={reduce ? undefined : { scale: [0.98, 1] }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE_LUXE }}
            >
              <Magnetic>
                <Button
                  href="/register"
                  variant="gold"
                  size="lg"
                  className="group shadow-[0_18px_50px_-18px_rgba(180,138,50,0.7)]"
                >
                  {dict.cta.button}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:rotate-[-90deg]" />
                </Button>
              </Magnetic>
              <Magnetic>
                <Button
                  href={`https://wa.me/${CONTACT.whatsapp}`}
                  variant="outline"
                  size="lg"
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  {dict.cta.secondary}
                </Button>
              </Magnetic>
            </motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
