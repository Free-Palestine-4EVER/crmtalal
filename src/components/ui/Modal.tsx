"use client";

import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  size?: Size;
  footer?: React.ReactNode;
  /** Hide the top-end close button. */
  hideClose?: boolean;
  className?: string;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  footer,
  hideClose,
  className,
}: ModalProps) {
  const titleId = useId();
  const descId = useId();

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll while open.
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descId : undefined}
            className={cn(
              "relative z-10 w-full rounded-2xl border border-ink-700 bg-ink-850 shadow-elevated",
              sizes[size],
              className,
            )}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute end-3.5 top-3.5 grid h-9 w-9 place-items-center rounded-full text-ink-500 transition-colors hover:bg-white/5 hover:text-parch-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            )}

            {(title || description) && (
              <div className="border-b border-ink-700/70 px-6 py-5 pe-14">
                {title && (
                  <h2
                    id={titleId}
                    className="text-lg font-semibold text-parch-50"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p id={descId} className="mt-1 text-sm text-ink-500">
                    {description}
                  </p>
                )}
              </div>
            )}

            {children && <div className="px-6 py-5">{children}</div>}

            {footer && (
              <div className="flex items-center justify-end gap-3 border-t border-ink-700/70 px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
