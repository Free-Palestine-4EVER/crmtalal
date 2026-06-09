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
    <section id="contact" className="relative scroll-mt-24 bg-surface2 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={dict.sections.contactEyebrow}
          title={dict.sections.contactTitle}
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => {
            const Icon = it.icon;
            const inner = (
              <div className="group relative flex h-full items-start gap-4 overflow-hidden rounded-2xl border border-line bg-scard p-6 shadow-[0_14px_44px_-30px_rgba(114,20,47,0.3)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--s-gold)]/45 hover:shadow-[0_20px_54px_-30px_var(--s-glow)]">
                {/* gold glow wash on hover */}
                <span className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(70%_100%_at_50%_0%,var(--s-glow),transparent_72%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--s-gold)]/12 text-sgold ring-1 ring-[var(--s-gold)]/15 transition-transform duration-300 group-hover:scale-105">
                  <Icon className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <span className="relative flex min-w-0 flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {it.label}
                  </span>
                  <span
                    dir={it.dir}
                    className="truncate text-sm font-medium text-fg transition-colors group-hover:text-accent"
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
