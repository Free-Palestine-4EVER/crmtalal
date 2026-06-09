"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { EASE_LUXE } from "./variants";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
} & Omit<HTMLMotionProps<"div">, "ref">;

/** Scroll-triggered reveal with reduced-motion support. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  once = true,
  ...rest
}: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: EASE_LUXE }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
