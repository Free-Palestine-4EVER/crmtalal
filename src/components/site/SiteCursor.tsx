"use client";

/**
 * SiteCursor — a trailing antique-gold ring + dot that follows the pointer
 * and blooms over interactive elements. Additive (native cursor untouched);
 * renders nothing for touch devices or reduced motion.
 */

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

export function SiteCursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);

  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const rx = useSpring(mx, { stiffness: 260, damping: 24, mass: 0.5 });
  const ry = useSpring(my, { stiffness: 260, damping: 24, mass: 0.5 });

  useEffect(() => {
    if (reduce) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);

    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      setVisible(true);
      const t = e.target as Element | null;
      setActive(!!t?.closest("a, button, [role='button'], input, textarea, select, label"));
    };
    const onLeave = () => setVisible(false);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce, mx, my]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      style={{ x: rx, y: ry }}
      className="pointer-events-none fixed left-0 top-0 z-[70] hidden lg:block"
    >
      <motion.span
        animate={{
          scale: active ? 2.1 : 1,
          opacity: visible ? (active ? 0.9 : 0.55) : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="absolute -left-4 -top-4 block h-8 w-8 rounded-full border border-[#c9a24c]/70"
      />
      <motion.span
        animate={{ scale: active ? 0 : 1, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute -left-[3px] -top-[3px] block h-1.5 w-1.5 rounded-full bg-[#c9a24c]"
      />
    </motion.div>
  );
}
