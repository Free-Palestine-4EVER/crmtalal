"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

type Side = "top" | "bottom" | "start" | "end";

const positions: Record<Side, string> = {
  top: "bottom-full start-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full start-1/2 -translate-x-1/2 mt-2",
  start: "end-full top-1/2 -translate-y-1/2 me-2",
  end: "start-full top-1/2 -translate-y-1/2 ms-2",
};

const offsets: Record<Side, { x?: number; y?: number }> = {
  top: { y: 4 },
  bottom: { y: -4 },
  start: { x: 4 },
  end: { x: -4 },
};

export type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: Side;
  className?: string;
};

export function Tooltip({
  content,
  children,
  side = "top",
  className,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const off = offsets[side];

  return (
    <span
      className="relative inline-flex"
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <AnimatePresence>
        {open && content && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, ...off }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, ...off }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "pointer-events-none absolute z-50 w-max max-w-xs rounded-lg border border-ink-700 bg-ink-800 px-2.5 py-1.5 text-xs font-medium text-parch-50 shadow-elevated",
              positions[side],
              className,
            )}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
