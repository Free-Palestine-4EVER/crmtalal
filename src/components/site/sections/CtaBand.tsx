"use client";

import { MessageCircle } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { TopoPattern } from "@/components/brand/TopoPattern";
import { useI18n } from "@/i18n";
import { CONTACT } from "@/content/site";

export function CtaBand() {
  const { dict } = useI18n();

  return (
    <section className="relative px-5 py-20 sm:px-8 sm:py-24">
      <div className="bg-brand relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-maroon-600/40 px-6 py-16 text-center sm:px-12 sm:py-20">
        <TopoPattern className="text-gold-500" opacity={0.14} />
        <div className="glow-gold pointer-events-none absolute inset-x-0 top-0 h-40" />

        <div className="relative mx-auto max-w-2xl">
          <Reveal>
            <h2 className="text-balance font-display text-3xl font-semibold leading-tight text-cream-50 sm:text-[2.75rem]">
              {dict.cta.title}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-5 text-pretty text-base leading-relaxed text-cream-100/70 sm:text-lg">
              {dict.cta.subtitle}
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Button href="/register" variant="gold" size="lg">
                {dict.cta.button}
              </Button>
              <Button
                href={`https://wa.me/${CONTACT.whatsapp}`}
                variant="outline"
                size="lg"
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="h-4 w-4" />
                {dict.cta.secondary}
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
