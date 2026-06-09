"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useSiteTheme } from "./SiteShell";
import { cn } from "@/lib/cn";

export function SiteThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useSiteTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light" : "Switch to dark"}
      className={cn(
        "relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border transition-colors",
        "border-line text-fg hover:text-accent",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={dark ? "moon" : "sun"}
          initial={{ y: 14, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.22 }}
        >
          {dark ? (
            <Moon className="h-[18px] w-[18px]" />
          ) : (
            <Sun className="h-[18px] w-[18px]" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
