"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, AtSign, MessageCircle, BadgeCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { TopoPattern } from "@/components/brand/TopoPattern";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useI18n } from "@/i18n";
import { NAV_LINKS, CONTACT } from "@/content/site";

export function SiteFooter() {
  const { dict, L } = useI18n();

  return (
    <footer className="relative overflow-hidden border-t border-maroon-700/30 bg-brand">
      <TopoPattern className="text-gold-500" opacity={0.12} />
      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-pretty text-sm leading-relaxed text-cream-100/55">
              {dict.meta.tagline} — {dict.hero.subtitle}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold-500/25 bg-gold-500/10 px-3.5 py-2 text-xs text-gold-300">
              <BadgeCheck className="h-4 w-4" />
              {dict.footer.accredited}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-cream-50">
              {dict.footer.quickLinks}
            </h4>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-sm text-cream-100/60 transition-colors hover:text-gold-300"
                  >
                    {L(l.label)}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  className="text-sm text-cream-100/60 transition-colors hover:text-gold-300"
                >
                  {dict.footer.portal}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-cream-50">
              {dict.footer.contactUs}
            </h4>
            <ul className="mt-5 space-y-3.5 text-sm text-cream-100/65">
              <li>
                <a href={`tel:${CONTACT.phoneIntl}`} className="flex items-center gap-3 hover:text-gold-300">
                  <Phone className="h-4 w-4 text-gold-500" />
                  <span dir="ltr">{CONTACT.phone1} · {CONTACT.phone2}</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${CONTACT.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 hover:text-gold-300"
                >
                  <MessageCircle className="h-4 w-4 text-gold-500" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-3 hover:text-gold-300">
                  <Mail className="h-4 w-4 text-gold-500" />
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gold-500" />
                {L(CONTACT.addressLine)}
              </li>
            </ul>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={`https://instagram.com/${CONTACT.instagram}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="grid h-10 w-10 place-items-center rounded-full border border-maroon-600/50 text-cream-100/70 transition-colors hover:border-gold-500/60 hover:text-gold-300"
              >
                <AtSign className="h-4 w-4" />
              </a>
              <a
                href={`https://wa.me/${CONTACT.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="grid h-10 w-10 place-items-center rounded-full border border-maroon-600/50 text-cream-100/70 transition-colors hover:border-gold-500/60 hover:text-gold-300"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-maroon-800/40 pt-7 sm:flex-row">
          <p className="text-xs text-cream-100/45">
            © {new Date().getFullYear()} {dict.meta.legalName}. {dict.footer.rights}
          </p>
          <LanguageToggle variant="ghost" />
        </div>
      </div>
    </footer>
  );
}
