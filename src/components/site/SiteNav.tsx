"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { SiteThemeToggle } from "@/components/site/SiteThemeToggle";
import { useSiteTheme } from "@/components/site/SiteShell";
import { useI18n } from "@/i18n";
import { NAV_LINKS } from "@/content/site";
import { cn } from "@/lib/cn";

export function SiteNav() {
  const { dict, L } = useI18n();
  const { theme } = useSiteTheme();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const logoTone = theme === "dark" ? "official" : "maroon";
  const logoTextTone = theme === "dark" ? "light" : "dark";

  return (
    <>
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-line bg-[var(--s-bg)]/85 shadow-[0_10px_40px_-28px_rgba(127,24,54,0.35)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      {/* gold hairline that fades in on scroll */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--s-gold)]/45 to-transparent transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />

      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link href="/" aria-label="Edarah" className="shrink-0">
          <Logo tone={logoTone} textTone={logoTextTone} priority />
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group relative text-sm font-medium text-soft transition-colors hover:text-accent"
            >
              {L(l.label)}
              <span className="absolute -bottom-1.5 start-0 h-px w-0 bg-[var(--s-gold)] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageToggle className="border-line text-fg hover:text-accent" />
          <SiteThemeToggle />
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-soft transition-colors hover:text-accent"
          >
            <LogIn className="h-4 w-4" />
            {dict.nav.login}
          </Link>
          <Button
            href="/register"
            size="sm"
            className="bg-maroon-600 from-maroon-600 to-maroon-600 text-cream-50 shadow-[0_10px_30px_-14px_rgba(127,24,54,0.6)] hover:bg-maroon-700 hover:from-maroon-700 hover:to-maroon-700"
          >
            {dict.nav.requestValuation}
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-11 w-11 place-items-center rounded-xl border border-line text-fg transition-colors hover:text-accent lg:hidden"
          aria-label={dict.nav.menu}
        >
          <Menu className="h-5 w-5" />
        </button>
      </nav>

    </header>

    {/* mobile menu — OUTSIDE the header: backdrop-filter would otherwise
        become the containing block for this fixed panel and clip it,
        leaving the page visible behind ("transparent menu"). */}
    <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] min-h-svh overflow-y-auto bg-[var(--s-bg)] text-fg lg:hidden"
          >
            <div className="flex h-18 items-center justify-between border-b border-line px-5">
              <Logo tone={logoTone} textTone={logoTextTone} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-11 w-11 place-items-center rounded-xl border border-line text-fg transition-colors hover:text-accent"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-1 px-5 py-6">
              {NAV_LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                  className="border-b border-line py-4 text-lg font-medium text-fg transition-colors hover:text-accent"
                >
                  {L(l.label)}
                </motion.a>
              ))}
              <div className="mt-6 flex flex-col gap-3">
                <Button
                  href="/register"
                  size="lg"
                  className="bg-maroon-600 from-maroon-600 to-maroon-600 text-cream-50 shadow-[0_10px_30px_-14px_rgba(127,24,54,0.6)] hover:bg-maroon-700 hover:from-maroon-700 hover:to-maroon-700"
                >
                  {dict.nav.requestValuation}
                </Button>
                <Button
                  href="/login"
                  variant="outline"
                  size="lg"
                  className="border-line text-fg hover:border-[var(--s-gold)]/60 hover:bg-[var(--s-gold)]/10 hover:text-accent"
                >
                  {dict.nav.login}
                </Button>
                <div className="mt-2 flex items-center justify-center gap-3">
                  <LanguageToggle className="border-line text-fg hover:text-accent" />
                  <SiteThemeToggle />
                </div>
              </div>
            </div>
          </motion.div>
        )}
    </AnimatePresence>
    </>
  );
}
