"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { useI18n } from "@/i18n";
import { FAQS } from "@/content/site";
import { EASE_LUXE } from "@/components/motion/variants";
import { cn } from "@/lib/cn";

export function Faq() {
  const { locale, L } = useI18n();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative scroll-mt-24 bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={locale === "ar" ? "الأسئلة الشائعة" : "FAQs"}
          title={locale === "ar" ? "إجابات لأكثر ما يُسأل" : "Answers to what's most asked"}
        />

        <div className="mt-12 flex flex-col gap-3">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={i} delay={Math.min(i, 4) * 0.05}>
                <div
                  className={cn(
                    "overflow-hidden rounded-2xl border bg-white shadow-[0_10px_40px_-24px_rgba(114,20,47,0.25)] transition-colors",
                    isOpen ? "border-gold-600/40" : "border-[#ece3d2]",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-start"
                  >
                    <span className="text-base font-semibold text-ink-900">{L(faq.q)}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.3, ease: EASE_LUXE }}
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors",
                        isOpen
                          ? "border-gold-600/50 bg-gold-500/12 text-gold-700"
                          : "border-[#ece3d2] text-ink-500",
                      )}
                    >
                      <Plus className="h-4 w-4" />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.34, ease: EASE_LUXE }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-pretty text-sm leading-relaxed text-ink-600">
                          {L(faq.a)}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
