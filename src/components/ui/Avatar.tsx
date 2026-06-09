"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

/** Derive 1–2 uppercase initials from a name. */
function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export type AvatarProps = {
  name: string;
  src?: string;
  size?: Size;
  /** Show a gold ring around the avatar. */
  ring?: boolean;
  className?: string;
};

export function Avatar({
  name,
  src,
  size = "md",
  ring,
  className,
}: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const showImage = src && !errored;

  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-maroon-600 to-ink-800 font-semibold text-cream-50 select-none",
        sizes[size],
        ring && "ring-2 ring-gold-500/60 ring-offset-2 ring-offset-ink-900",
        className,
      )}
      aria-label={name}
      title={name}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <span aria-hidden>{initialsFromName(name)}</span>
      )}
    </span>
  );
}
