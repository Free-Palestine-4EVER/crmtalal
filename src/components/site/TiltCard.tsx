"use client";

/**
 * TiltCard — cursor-tracked 3D tilt with a travelling gold sheen.
 * Wraps any card; disabled for touch pointers and reduced motion.
 */

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/cn";

export function TiltCard({
  children,
  className,
  max = 7,
}: {
  children: React.ReactNode;
  className?: string;
  /** max tilt in degrees */
  max?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 220, damping: 28, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 220, damping: 28, mass: 0.6 });

  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const sheenX = useTransform(sx, [0, 1], ["-30%", "130%"]);
  const sheenY = useTransform(sy, [0, 1], ["-30%", "130%"]);

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType === "touch") return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={
        reduce
          ? undefined
          : { rotateX, rotateY, transformPerspective: 900 }
      }
      className={cn("relative h-full [transform-style:preserve-3d]", className)}
    >
      {children}
      {/* travelling gold sheen */}
      {!reduce && (
        <motion.span
          aria-hidden
          style={{ left: sheenX, top: sheenY }}
          className="pointer-events-none absolute h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-2xl transition-opacity duration-300 [background:radial-gradient(circle,rgba(201,162,76,0.22),transparent_70%)] group-hover/tilt:opacity-100"
        />
      )}
    </motion.div>
  );
}
