"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useI18n } from "@/i18n";
import { NAV_LINKS } from "@/content/site";
import { cn } from "@/lib/cn";

export function SiteNav() {
  const { dict, L } = useI18n();
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

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-maroon-700/40 bg-ink-950/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link href="/" aria-label="Edarah" className="shrink-0">
          <Logo priority />
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-cream-100/75 transition-colors hover:text-gold-300"
            >
              {L(l.label)}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageToggle />
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-cream-100/80 transition-colors hover:text-white"
          >
            <LogIn className="h-4 w-4" />
            {dict.nav.login}
          </Link>
          <Button href="/register" size="sm">
            {dict.nav.requestValuation}
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-11 w-11 place-items-center rounded-xl border border-maroon-700/40 text-cream-50 lg:hidden"
          aria-label={dict.nav.menu}
        >
          <Menu className="h-5 w-5" />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-brand lg:hidden"
          >
            <div className="flex h-18 items-center justify-between px-5">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-11 w-11 place-items-center rounded-xl border border-maroon-700/50 text-cream-50"
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
                  className="border-b border-maroon-800/40 py-4 text-lg font-medium text-cream-50"
                >
                  {L(l.label)}
                </motion.a>
              ))}
              <div className="mt-6 flex flex-col gap-3">
                <Button href="/register" size="lg">
                  {dict.nav.requestValuation}
                </Button>
                <Button href="/login" variant="outline" size="lg">
                  {dict.nav.login}
                </Button>
                <div className="mt-2 flex justify-center">
                  <LanguageToggle />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
