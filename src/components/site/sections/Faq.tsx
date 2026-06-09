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
    <section id="faq" className="relative scroll-mt-24 bg-surface py-24 sm:py-28">
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
                    "overflow-hidden rounded-2xl border bg-scard shadow-[0_14px_44px_-30px_rgba(127,24,54,0.32)] transition-all duration-300",
                    isOpen
                      ? "border-[var(--s-gold)]/45 shadow-[0_18px_50px_-28px_var(--s-glow)]"
                      : "border-line hover:border-[var(--s-gold)]/30",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start"
                  >
                    <span
                      className={cn(
                        "text-base font-semibold transition-colors",
                        isOpen ? "text-accent" : "text-fg",
                      )}
                    >
                      {L(faq.q)}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.3, ease: EASE_LUXE }}
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors",
                        isOpen
                          ? "border-[var(--s-gold)]/55 bg-[var(--s-gold)]/12 text-sgold"
                          : "border-line text-muted",
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
                        <div className="px-6 pb-5">
                          <span className="mb-4 block h-px w-full bg-gradient-to-r from-[var(--s-gold)]/30 via-line to-transparent" />
                          <p className="text-pretty text-sm leading-relaxed text-soft">
                            {L(faq.a)}
                          </p>
                        </div>
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
