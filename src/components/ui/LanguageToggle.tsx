"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/cn";

export function LanguageToggle({
  className,
  variant = "pill",
}: {
  className?: string;
  variant?: "pill" | "ghost";
}) {
  const { locale, toggle } = useI18n();
  const target = locale === "ar" ? "English" : "العربية";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch language to ${target}`}
      className={cn(
        "inline-flex items-center gap-2 rounded-full text-sm font-medium transition-colors",
        variant === "pill"
          ? "border border-ink-700 bg-ink-850/60 px-3.5 py-2 text-parch-100/80 hover:border-gold-500/50 hover:text-white"
          : "px-2 py-1.5 text-parch-100/70 hover:text-white",
        className,
      )}
    >
      <Languages className="h-4 w-4 text-gold-500" />
      <span className={locale === "ar" ? "font-sans" : "font-arabic"}>
        {target}
      </span>
    </button>
  );
}
