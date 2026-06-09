"use client";

import { Phone, MessageCircle, Mail, MapPin, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { useI18n } from "@/i18n";
import { CONTACT } from "@/content/site";

type Item = {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
  dir?: "ltr";
  external?: boolean;
};

export function ContactStrip() {
  const { dict, L } = useI18n();

  const items: Item[] = [
    {
      icon: Phone,
      label: dict.contact.phone,
      value: `${CONTACT.phone1} · ${CONTACT.phone2}`,
      href: `tel:${CONTACT.phoneIntl}`,
      dir: "ltr",
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: CONTACT.phoneIntl,
      href: `https://wa.me/${CONTACT.whatsapp}`,
      dir: "ltr",
      external: true,
    },
    {
      icon: Mail,
      label: dict.contact.email,
      value: CONTACT.email,
      href: `mailto:${CONTACT.email}`,
      dir: "ltr",
    },
    {
      icon: MapPin,
      label: dict.contact.address,
      value: L(CONTACT.addressLine),
    },
  ];

  return (
    <section id="contact" className="relative scroll-mt-24 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={dict.sections.contactEyebrow}
          title={dict.sections.contactTitle}
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => {
            const Icon = it.icon;
            const inner = (
              <div className="group flex h-full items-start gap-4 rounded-2xl border border-ink-700/70 bg-ink-850/50 p-6 transition-colors hover:border-gold-500/40 hover:bg-ink-800/60">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-400">
                  <Icon className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-cream-100/45">
                    {it.label}
                  </span>
                  <span
                    dir={it.dir}
                    className="truncate text-sm font-medium text-cream-50 transition-colors group-hover:text-gold-200"
                  >
                    {it.value}
                  </span>
                </span>
              </div>
            );

            return (
              <Reveal key={i} delay={(i % 4) * 0.07} className="h-full">
                {it.href ? (
                  <a
                    href={it.href}
                    {...(it.external ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="block h-full"
                  >
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
