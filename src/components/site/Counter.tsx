"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

/** Animated number that counts up when scrolled into view, preserving any
 *  prefix/suffix (e.g. "+100,000", "6+"). Years (19xx/20xx) aren't animated.
 *  Bulletproof: starts on view OR after a short fallback, and always lands
 *  exactly on the target value. */
export function Counter({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  const m = value.match(/^([^\d]*)([\d,]+)(.*)$/);
  const prefix = m?.[1] ?? "";
  const numStr = m?.[2] ?? "";
  const suffix = m?.[3] ?? "";
  const target = Number(numStr.replace(/,/g, "")) || 0;
  const isYear = /^(19|20)\d{2}$/.test(numStr);

  const [display, setDisplay] = useState(isYear ? target : 0);
  const started = useRef(false);

  useEffect(() => {
    if (!m || isYear) return;
    let controls: ReturnType<typeof animate> | null = null;

    const start = () => {
      if (started.current) return;
      started.current = true;
      controls = animate(0, target, {
        duration: 1.4,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (v) => setDisplay(Math.round(v)),
        onComplete: () => setDisplay(target), // land exactly
      });
    };

    if (inView) start();
    // fallback: never leave a counter stuck at 0 if the observer misfires
    const fallback = setTimeout(start, 1800);

    return () => {
      clearTimeout(fallback);
      if (controls) {
        controls.stop();
        // if unmounted/re-rendered mid-flight, snap to the real number
        setDisplay(target);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, target, isYear]);

  if (!m) return <span className={className}>{value}</span>;
  return (
    <span ref={ref} className={className}>
      {prefix}
      {isYear ? String(display) : display.toLocaleString()}
      {suffix}
    </span>
  );
}
