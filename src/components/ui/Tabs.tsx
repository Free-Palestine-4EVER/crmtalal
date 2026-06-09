"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export type TabItem<K extends string = string> = {
  key: K;
  label: React.ReactNode;
  icon?: LucideIcon;
};

export type TabsProps<K extends string = string> = {
  tabs: TabItem<K>[];
  value: K;
  onChange: (key: K) => void;
  /** Visual variant. "underline" (default) or "pill". */
  variant?: "underline" | "pill";
  className?: string;
};

export function Tabs<K extends string = string>({
  tabs,
  value,
  onChange,
  variant = "underline",
  className,
}: TabsProps<K>) {
  if (variant === "pill") {
    return (
      <div
        role="tablist"
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-ink-700 bg-ink-850/70 p-1",
          className,
        )}
      >
        {tabs.map((tab) => {
          const active = tab.key === value;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.key)}
              className={cn(
                "relative inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500",
                active
                  ? "text-ink-950"
                  : "text-parch-100/70 hover:text-parch-50",
              )}
            >
              {active && (
                <motion.span
                  layoutId="tabs-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-b from-gold-400 to-gold-600"
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              {Icon && <Icon className="relative h-4 w-4" />}
              <span className="relative">{tab.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-1 border-b border-ink-700/70",
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = tab.key === value;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500",
              active
                ? "text-gold-300"
                : "text-parch-100/65 hover:text-parch-50",
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {tab.label}
            {active && (
              <motion.span
                layoutId="tabs-underline"
                className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-gold-500"
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export type TabPanelsProps<K extends string = string> = {
  value: K;
  panels: Partial<Record<K, React.ReactNode>>;
  className?: string;
};

/** Renders the panel matching the active key. */
export function TabPanels<K extends string = string>({
  value,
  panels,
  className,
}: TabPanelsProps<K>) {
  return (
    <div role="tabpanel" className={className}>
      {panels[value]}
    </div>
  );
}
