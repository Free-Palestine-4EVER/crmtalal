"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export type DropdownItem = {
  key: string;
  label: React.ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
};

export type DropdownProps = {
  trigger: React.ReactNode;
  items: DropdownItem[];
  /** Align the panel to the inline-start or inline-end edge of the trigger. */
  align?: "start" | "end";
  className?: string;
  /** Class for the wrapping trigger button. */
  triggerClassName?: string;
};

export function Dropdown({
  trigger,
  items,
  align = "end",
  className,
  triggerClassName,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Click-outside + Escape to close.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500",
          triggerClassName,
        )}
      >
        {trigger}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -2 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute z-50 mt-2 min-w-[11rem] origin-top overflow-hidden rounded-xl border border-ink-700 bg-ink-800 p-1.5 shadow-elevated",
              align === "end" ? "end-0" : "start-0",
            )}
          >
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    item.onClick?.();
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 disabled:pointer-events-none disabled:opacity-50",
                    item.danger
                      ? "text-critical hover:bg-critical/10"
                      : "text-parch-100/85 hover:bg-white/5 hover:text-parch-50",
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
