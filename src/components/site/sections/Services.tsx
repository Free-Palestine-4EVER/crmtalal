"use client";

import { Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/components/site/SectionHeading";
import { TiltCard } from "@/components/site/TiltCard";
import { getIcon } from "@/components/site/icons";
import { fadeUp, staggerContainer } from "@/components/motion/variants";
import { useI18n } from "@/i18n";
import { SERVICES } from "@/content/site";
import { cn } from "@/lib/cn";

export function Services() {
  const { dict, L } = useI18n();
  const reduce = useReducedMotion();

  return (
    <section
      id="services"
      className="grain relative scroll-mt-24 overflow-hidden bg-surface py-24 sm:py-28"
    >
      {/* soft gold spotlight, theme-aware */}
      <div
        aria-hidden
        className="spotlight pointer-events-none absolute inset-x-0 top-0 h-[36rem]"
        style={{ ["--sx" as string]: "78%" }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={dict.sections.servicesEyebrow}
          title={dict.sections.servicesTitle}
          index="01"
        />

        <motion.div
          variants={staggerContainer(0.08, 0.05)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-6"
        >
          {SERVICES.map((service, i) => {
            const Icon = getIcon(service.icon);
            return (
              <TiltCard
                key={service.id}
                className={cn("group/tilt", i < 2 ? "lg:col-span-3" : "lg:col-span-2")}
              >
              <motion.article
                variants={fadeUp}
                whileHover={reduce ? undefined : { y: -6 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-scard p-6 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.55)] transition-[border-color,box-shadow] duration-300 hover:border-[var(--s-gold-soft)]/55 hover:shadow-[0_28px_70px_-32px_var(--s-glow)] sm:p-7"
              >
                {/* gold top hairline — fades in on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--s-gold)] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                {/* faint index */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute end-5 top-4 select-none font-display text-3xl font-semibold leading-none text-fg/[0.06]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--s-gold)]/12 text-sgold ring-1 ring-inset ring-[var(--s-gold)]/15 transition-all duration-300 group-hover:bg-[var(--s-gold)]/20 group-hover:ring-[var(--s-gold)]/35">
                  <Icon className="h-6 w-6" strokeWidth={1.6} />
                </span>

                <h3 className="mt-5 font-display text-xl font-semibold leading-snug text-fg">
                  {L(service.title)}
                </h3>
                <p className="mt-2.5 text-pretty text-sm leading-relaxed text-soft">
                  {L(service.desc)}
                </p>

                <ul className="mt-5 space-y-2.5 border-t border-line pt-5">
                  {service.items.map((it, k) => (
                    <li
                      key={k}
                      className="flex items-start gap-2.5 text-sm text-soft"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-sgold"
                        strokeWidth={2.2}
                      />
                      <span className="text-pretty">{L(it)}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
              </TiltCard>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
