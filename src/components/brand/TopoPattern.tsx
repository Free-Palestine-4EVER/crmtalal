import { cn } from "@/lib/cn";

/**
 * Topographic contour motif echoing the company profile's background lines.
 * Decorative only — pointer-events none, low opacity.
 */
export function TopoPattern({
  className,
  opacity = 0.5,
}: {
  className?: string;
  opacity?: number;
}) {
  const rings = (cx: number, cy: number, count: number, base: number, grow: number) =>
    Array.from({ length: count }).map((_, i) => (
      <ellipse
        key={`${cx}-${cy}-${i}`}
        cx={cx}
        cy={cy}
        rx={base + i * grow}
        ry={(base + i * grow) * 0.72}
        transform={`rotate(${-18 + i * 1.5} ${cx} ${cy})`}
      />
    ));

  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      style={{ opacity }}
    >
      <g
        stroke="currentColor"
        strokeWidth={1}
        className="text-gold-500/25"
        vectorEffect="non-scaling-stroke"
      >
        {rings(340, 300, 9, 60, 46)}
        {rings(920, 540, 8, 50, 52)}
        {rings(150, 660, 6, 40, 40)}
      </g>
    </svg>
  );
}
