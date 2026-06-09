"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { TiltCard } from "@/components/site/TiltCard";
import { fadeUp, staggerContainer } from "@/components/motion/variants";
import { useI18n } from "@/i18n";
import { SERVICES } from "@/content/site";
import { cn } from "@/lib/cn";

/** Saudi photography per service — drops in from /public/images/services/. */
const CARD_ART: Record<string, { img: string; fallback: string }> = {
  land: {
    img: "/images/services/land.jpg",
    fallback: "linear-gradient(150deg,#3a2c14,#72142f 80%)",
  },
  residential: {
    img: "/images/services/residential.jpg",
    fallback: "linear-gradient(150deg,#4e3b1d,#2a0712 80%)",
  },
  commercial: {
    img: "/images/services/commercial.jpg",
    fallback: "linear-gradient(150deg,#14161d,#5e1228 85%)",
  },
  undeveloped: {
    img: "/images/services/raw.jpg",
    fallback: "linear-gradient(150deg,#6f541f,#14161d 80%)",
  },
  projects: {
    img: "/images/services/projects.jpg",
    fallback: "linear-gradient(150deg,#191c25,#72142f 85%)",
  },
};

export function Services() {
  const { dict, L } = useI18n();

  return (
    <section
      id="services"
      className="grain relative scroll-mt-24 overflow-hidden bg-surface py-24 sm:py-28"
    >
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
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-6"
        >
          {SERVICES.map((service, i) => {
            const art = CARD_ART[service.id] ?? CARD_ART.land;
            const big = i < 2;
            return (
              <TiltCard
                key={service.id}
                max={4}
                className={cn("group/tilt", big ? "lg:col-span-3" : "lg:col-span-2")}
              >
                <motion.article
                  variants={fadeUp}
                  className={cn(
                    "group relative flex h-full flex-col justify-end overflow-hidden rounded-[1.25rem] border border-line",
                    big ? "min-h-[26rem]" : "min-h-[22rem]",
                  )}
                  style={{ background: art.fallback }}
                >
                  {/* photography */}
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    style={{ backgroundImage: `url("${art.img}")` }}
                  />
                  {/* cinematic scrim */}
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-[#0a0405]/92 via-[#0a0405]/35 to-[#0a0405]/15 transition-opacity duration-500"
                  />
                  {/* mono index — top corner */}
                  <span className="absolute start-5 top-5 font-mono text-xs font-medium tracking-[0.25em] text-cream-100/70">
                    /&nbsp;{String(i + 1).padStart(2, "0")}
                  </span>
                  {/* hover arrow */}
                  <span className="absolute end-5 top-5 grid h-9 w-9 place-items-center rounded-full border border-cream-50/25 text-cream-50 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <ArrowUpRight className="h-4 w-4 rtl:-rotate-90" />
                  </span>

                  {/* content — bottom anchored */}
                  <div className="relative p-6 sm:p-7">
                    <h3
                      className={cn(
                        "font-display font-semibold leading-tight text-cream-50",
                        big ? "text-3xl sm:text-[2.1rem]" : "text-2xl",
                      )}
                    >
                      {L(service.title)}
                    </h3>
                    <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-cream-100/75">
                      {L(service.desc)}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {service.items.slice(0, big ? 5 : 3).map((it, k) => (
                        <span
                          key={k}
                          className="rounded-full border border-cream-50/20 bg-[#0a0405]/30 px-3 py-1 font-mono text-[0.66rem] tracking-wide text-cream-100/85 backdrop-blur-sm"
                        >
                          {L(it)}
                        </span>
                      ))}
                    </div>
                    {/* gold hairline grows on hover */}
                    <span className="mt-5 block h-px w-10 bg-gold-500/70 transition-all duration-500 group-hover:w-full" />
                  </div>
                </motion.article>
              </TiltCard>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
