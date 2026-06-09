"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

type Variant =
  | "primary"
  | "gold"
  | "outline"
  | "ghost"
  | "subtle"
  | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none";

const variants: Record<Variant, string> = {
  gold: "bg-gradient-to-b from-gold-400 to-gold-600 text-ink-950 shadow-[0_10px_30px_-12px_rgba(180,138,50,0.7)] hover:from-gold-300 hover:to-gold-500",
  primary:
    "bg-parch-50 text-ink-900 hover:bg-white shadow-[0_10px_30px_-14px_rgba(255,255,255,0.5)]",
  outline:
    "border border-gold-500/40 text-gold-300 hover:bg-gold-500/10 hover:border-gold-500/70",
  ghost: "text-parch-100/80 hover:text-white hover:bg-white/5",
  subtle: "bg-ink-750 text-parch-100 hover:bg-ink-700 border border-ink-700",
  danger: "bg-critical/90 text-white hover:bg-critical",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
  icon: "h-10 w-10",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(
    { variant = "gold", size = "md", loading, className, children, ...props },
    ref,
  ) {
    const classes = cn(base, variants[variant], sizes[size], className);
    const content = (
      <>
        {loading && <Spinner className="h-4 w-4" />}
        {children}
      </>
    );

    if ("href" in props && props.href !== undefined) {
      const { href, ...rest } = props as ButtonAsLink;
      return (
        <Link
          href={href}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
          {...rest}
        >
          {content}
        </Link>
      );
    }

    const { disabled, ...rest } = props as ButtonAsButton;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        disabled={disabled || loading}
        {...rest}
      >
        {content}
      </button>
    );
  },
);
