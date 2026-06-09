"use client";

import Link from "next/link";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { StatusBadge, PriorityBadge } from "./StatusBadge";
import { useI18n } from "@/i18n";
import { timeAgo } from "@/lib/format";
import type { Project } from "@/lib/types";

export function RequestRow({
  p,
  showClient,
}: {
  p: Project;
  showClient?: boolean;
}) {
  const { dict, locale, isRTL } = useI18n();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  const who = showClient
    ? p.clientName
    : (p.assignedToName ?? dict.project.unassigned);

  return (
    <Link
      href={`/requests/${p.id}`}
      className="group flex items-center gap-3.5 rounded-xl border border-ink-800 bg-ink-850/40 px-3.5 py-3 transition-colors hover:border-gold-500/30 hover:bg-ink-800/60"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink-800 text-gold-400">
        <FileText className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.7rem] text-gold-400">{p.code}</span>
          <PriorityBadge priority={p.priority} />
        </div>
        <p className="truncate text-sm font-medium text-cream-50">{p.title}</p>
        <p className="truncate text-xs text-ink-500">
          {dict.propertyTypes[p.propertyType] ?? p.propertyType} · {who} ·{" "}
          {timeAgo(p.updatedAt, locale)}
        </p>
      </div>
      <StatusBadge status={p.status} />
      <Chevron className="h-4 w-4 shrink-0 text-ink-600 transition-colors group-hover:text-gold-400" />
    </Link>
  );
}
