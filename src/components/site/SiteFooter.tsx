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
    <footer className="bg-brand relative overflow-hidden">
      {/* thin gold top hairline — brand anchor */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/70 to-transparent"
      />
      <TopoPattern className="text-gold-500" opacity={0.12} />
      <div className="glow-maroon pointer-events-none absolute inset-x-0 top-0 h-40 opacity-50" />

      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="mt-6 max-w-sm text-pretty text-sm leading-relaxed text-cream-100/60">
              {dict.meta.tagline} — {dict.hero.subtitle}
            </p>
            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-gold-500/25 bg-gold-500/10 px-4 py-2 text-xs font-medium text-gold-300">
              <BadgeCheck className="h-4 w-4" />
              {dict.footer.accredited}
            </div>
          </div>

          <div>
            <h4 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-gold-300/90">
              {dict.footer.quickLinks}
            </h4>
            <ul className="mt-6 space-y-3.5">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="group inline-flex items-center gap-2 text-sm text-cream-100/65 transition-colors hover:text-gold-200"
                  >
                    <span className="h-px w-0 bg-gold-400 transition-all duration-300 group-hover:w-4" />
                    {L(l.label)}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-2 text-sm text-cream-100/65 transition-colors hover:text-gold-200"
                >
                  <span className="h-px w-0 bg-gold-400 transition-all duration-300 group-hover:w-4" />
                  {dict.footer.portal}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-gold-300/90">
              {dict.footer.contactUs}
            </h4>
            <ul className="mt-6 space-y-4 text-sm text-cream-100/70">
              <li>
                <a
                  href={`tel:${CONTACT.phoneIntl}`}
                  className="flex items-center gap-3 transition-colors hover:text-gold-200"
                >
                  <Phone className="h-4 w-4 shrink-0 text-gold-500" />
                  <span dir="ltr">{CONTACT.phone1} · {CONTACT.phone2}</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${CONTACT.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 transition-colors hover:text-gold-200"
                >
                  <MessageCircle className="h-4 w-4 shrink-0 text-gold-500" />
                  <span dir="ltr">WhatsApp</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-center gap-3 transition-colors hover:text-gold-200"
                >
                  <Mail className="h-4 w-4 shrink-0 text-gold-500" />
                  <span dir="ltr">{CONTACT.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                <span>{L(CONTACT.addressLine)}</span>
              </li>
            </ul>
            <div className="mt-7 flex items-center gap-3">
              <a
                href={`https://instagram.com/${CONTACT.instagram}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="grid h-10 w-10 place-items-center rounded-full border border-maroon-600/50 text-cream-100/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-500/60 hover:text-gold-200"
              >
                <AtSign className="h-4 w-4" />
              </a>
              <a
                href={`https://wa.me/${CONTACT.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="grid h-10 w-10 place-items-center rounded-full border border-maroon-600/50 text-cream-100/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-500/60 hover:text-gold-200"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-maroon-800/40 pt-8 sm:flex-row">
          <p className="text-xs text-cream-100/45">
            © {new Date().getFullYear()} {dict.meta.legalName}. {dict.footer.rights}
          </p>
          <LanguageToggle variant="ghost" />
        </div>
      </div>
    </footer>
  );
}
