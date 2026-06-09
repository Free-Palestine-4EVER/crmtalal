"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

/** Animated number that counts up when scrolled into view, preserving any
 *  prefix/suffix (e.g. "+100,000", "6+"). Years (19xx/20xx) aren't animated. */
export function Counter({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const m = value.match(/^([^\d]*)([\d,]+)(.*)$/);
  const prefix = m?.[1] ?? "";
  const numStr = m?.[2] ?? "";
  const suffix = m?.[3] ?? "";
  const target = Number(numStr.replace(/,/g, "")) || 0;
  const isYear = /^(19|20)\d{2}$/.test(numStr);

  const [display, setDisplay] = useState(isYear ? target : 0);

  useEffect(() => {
    if (!m || isYear || !inView) return;
    const controls = animate(0, target, {
      duration: 1.7,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, target, isYear, m]);

  if (!m) return <span className={className}>{value}</span>;
  return (
    <span ref={ref} className={className}>
      {prefix}
      {isYear ? String(display) : display.toLocaleString()}
      {suffix}
    </span>
  );
}
