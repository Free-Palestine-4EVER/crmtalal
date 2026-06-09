"use client";

/**
 * GoldDust — a field of softly floating gold motes. Pure CSS animation,
 * deterministic layout (no Math.random → no hydration mismatch).
 */

const MOTES = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 53 + 11) % 97}%`,
  top: `${(i * 37 + 19) % 88}%`,
  size: 2 + ((i * 7) % 4),
  dur: 5.5 + ((i * 13) % 50) / 10,
  delay: ((i * 17) % 60) / 10,
  opacity: 0.25 + ((i * 11) % 40) / 100,
}));

export function GoldDust({ className }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}>
      {MOTES.map((m, i) => (
        <span
          key={i}
          className="dust absolute rounded-full bg-[#e7ce8e] blur-[1px]"
          style={{
            left: m.left,
            top: m.top,
            width: m.size,
            height: m.size,
            ["--dust-dur" as string]: `${m.dur}s`,
            ["--dust-delay" as string]: `${m.delay}s`,
            ["--dust-o" as string]: m.opacity,
          }}
        />
      ))}
    </div>
  );
}
