"use client";

import { Check } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Card } from "@/components/ui/Card";
import { getIcon } from "@/components/site/icons";
import { useI18n } from "@/i18n";
import { SERVICES } from "@/content/site";

export function Services() {
  const { dict, L } = useI18n();

  return (
    <section id="services" className="relative scroll-mt-24 bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={dict.sections.servicesEyebrow}
          title={dict.sections.servicesTitle}
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => {
            const Icon = getIcon(service.icon);
            return (
              <Reveal key={service.id} delay={(i % 3) * 0.08} className="h-full">
                <Card
                  interactive
                  className="group flex h-full flex-col border-[#ece3d2] bg-white p-6 shadow-[0_10px_40px_-24px_rgba(114,20,47,0.25)] hover:border-gold-600/40 hover:bg-white sm:p-7"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold-500/12 text-gold-700 transition-colors group-hover:bg-gold-500/20">
                    <Icon className="h-6 w-6" strokeWidth={1.6} />
                  </span>

                  <h3 className="mt-5 font-display text-xl font-semibold leading-snug text-ink-900">
                    {L(service.title)}
                  </h3>
                  <p className="mt-2.5 text-pretty text-sm leading-relaxed text-ink-600">
                    {L(service.desc)}
                  </p>

                  <ul className="mt-5 space-y-2.5 border-t border-[#ece3d2] pt-5">
                    {service.items.slice(0, 3).map((it, k) => (
                      <li key={k} className="flex items-start gap-2.5 text-sm text-ink-600">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" strokeWidth={2.2} />
                        <span className="text-pretty">{L(it)}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
