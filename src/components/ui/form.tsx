"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/cn";

const fieldBase =
  "w-full rounded-xl border border-ink-700 bg-ink-850/70 px-4 text-[0.95rem] text-parch-50 placeholder:text-ink-500 transition-colors focus:border-gold-500/70 focus:bg-ink-850 focus:outline-none focus:ring-2 focus:ring-gold-500/20 disabled:opacity-60";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-parch-100/85"
        >
          {label}
          {required && <span className="text-gold-500"> *</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-ink-500">{hint}</p>
      )}
      {error && <p className="text-xs text-critical">{error}</p>}
    </div>
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input ref={ref} className={cn(fieldBase, "h-12", className)} {...props} />
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(fieldBase, "min-h-28 resize-y py-3 leading-relaxed", className)}
      {...props}
    />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          fieldBase,
          "h-12 cursor-pointer appearance-none pe-10",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute end-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
});
