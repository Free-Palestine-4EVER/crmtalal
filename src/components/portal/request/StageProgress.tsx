"use client";

import { Check, Ban } from "lucide-react";
import {
  STATUS_FLOW,
  statusIndex,
  TERMINAL_STATUSES,
  type ProjectStatus,
} from "@/lib/types";
import { useDict } from "@/i18n";
import { cn } from "@/lib/cn";

export function StageProgress({ status }: { status: ProjectStatus }) {
  const d = useDict();

  if (TERMINAL_STATUSES.includes(status)) {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl border border-critical/30 bg-critical/10 px-4 py-2.5 text-sm font-medium text-critical">
        <Ban className="h-4 w-4" />
        {d.status[status]}
      </div>
    );
  }

  const cur = statusIndex(status);

  return (
    <div className="no-scrollbar flex items-start gap-1 overflow-x-auto pb-1">
      {STATUS_FLOW.map((s, i) => {
        const done = i < cur;
        const active = i === cur;
        return (
          <div key={s} className="flex shrink-0 items-center gap-1">
            <div className="flex w-16 flex-col items-center gap-1.5">
              <div
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full border text-xs font-semibold transition-colors",
                  done
                    ? "border-gold-500 bg-gold-500 text-ink-950"
                    : active
                      ? "border-gold-500 bg-gold-500/10 text-gold-300"
                      : "border-ink-700 text-ink-500",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-center text-[0.6rem] leading-tight",
                  active ? "text-gold-300" : "text-ink-500",
                )}
              >
                {d.status[s]}
              </span>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div
                className={cn(
                  "mt-4 h-px w-5",
                  i < cur ? "bg-gold-500" : "bg-ink-700",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
