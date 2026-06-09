"use client";

import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n";

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** CSS width of the panel. Default "22rem". */
  width?: string;
  className?: string;
  hideClose?: boolean;
};

export function Drawer({
  open,
  onClose,
  title,
  children,
  width = "22rem",
  className,
  hideClose,
}: DrawerProps) {
  const titleId = useId();
  const { isRTL } = useI18n();
  // Slide in from the inline-end side: that's the left in RTL, the right in LTR.
  const offscreen = isRTL ? "-100%" : "100%";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />

          {/* Panel pinned to the inline-end edge */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            className={cn(
              "absolute inset-y-0 end-0 flex h-full max-w-[92vw] flex-col border-s border-ink-700 bg-ink-850 shadow-elevated",
              className,
            )}
            style={{ width }}
            initial={{ x: offscreen }}
            animate={{ x: 0 }}
            exit={{ x: offscreen }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {(title || !hideClose) && (
              <div className="flex items-center justify-between gap-4 border-b border-ink-700/70 px-5 py-4">
                {title ? (
                  <h2
                    id={titleId}
                    className="text-base font-semibold text-parch-50"
                  >
                    {title}
                  </h2>
                ) : (
                  <span />
                )}
                {!hideClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="-me-1.5 grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-500 transition-colors hover:bg-white/5 hover:text-parch-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
