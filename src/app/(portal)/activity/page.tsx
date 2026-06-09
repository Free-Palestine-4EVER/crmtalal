"use client";

import { useMemo, useState } from "react";
import { Activity as ActivityIcon } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useActivities } from "@/lib/hooks/data";
import { useI18n } from "@/i18n";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Activity, ActivityEntity } from "@/lib/types";

const ENTITIES: ActivityEntity[] = [
  "project",
  "lead",
  "contact",
  "company",
  "deal",
  "task",
  "invoice",
];

/** Badge tone per entity — keeps the timeline scannable by colour. */
const ENTITY_TONE: Record<ActivityEntity, BadgeTone> = {
  project: "gold",
  lead: "info",
  contact: "steel",
  company: "steel",
  deal: "caution",
  task: "neutral",
  invoice: "positive",
  user: "neutral",
};

type Filter = "all" | ActivityEntity;

export default function ActivityPage() {
  const { dict: d, locale } = useI18n();
  const { data: activities, loading } = useActivities(80);
  const [filter, setFilter] = useState<Filter>("all");

  /** Prefer a dictionary module label, else humanize the entity enum. */
  const entityLabel = (e: ActivityEntity): string => {
    const mod = d.modules as Record<string, string>;
    return mod[e] ?? e.charAt(0).toUpperCase() + e.slice(1);
  };

  // Counts per entity for the filter chips (only entities that appear).
  const counts = useMemo(() => {
    const map = new Map<ActivityEntity, number>();
    for (const a of activities)
      map.set(a.entity, (map.get(a.entity) ?? 0) + 1);
    return map;
  }, [activities]);

  const options = useMemo(
    () => [
      { value: "all" as const, label: d.common.all, count: activities.length },
      ...ENTITIES.filter((e) => counts.has(e)).map((e) => ({
        value: e,
        label: entityLabel(e),
        count: counts.get(e),
      })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activities.length, counts, d],
  );

  const filtered = useMemo(
    () =>
      filter === "all"
        ? activities
        : activities.filter((a) => a.entity === filter),
    [activities, filter],
  );

  return (
    <div>
      <PageHeader icon={ActivityIcon} title={d.modules.activity} />

      {!loading && activities.length > 0 && options.length > 1 && (
        <div className="mb-6 overflow-x-auto pb-1">
          <SegmentedControl
            value={filter}
            onChange={(v) => setFilter(v as Filter)}
            options={options}
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <Skeleton className="h-12 flex-1" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ActivityIcon}
          title={d.dash.noActivity}
          description={d.dash.recentActivity}
        />
      ) : (
        <ol className="relative">
          {filtered.map((a, i) => (
            <ActivityItem
              key={a.id}
              activity={a}
              label={entityLabel(a.entity)}
              tone={ENTITY_TONE[a.entity]}
              when={timeAgo(a.at, locale)}
              last={i === filtered.length - 1}
            />
          ))}
        </ol>
      )}
    </div>
  );
}

function ActivityItem({
  activity: a,
  label,
  tone,
  when,
  last,
}: {
  activity: Activity;
  label: string;
  tone: BadgeTone;
  when: string;
  last: boolean;
}) {
  return (
    <li className="relative flex gap-4 ps-0">
      {/* Connector line — logical inset so it flips for RTL */}
      {!last && (
        <span
          aria-hidden
          className="absolute bottom-0 top-11 w-px bg-ink-700"
          style={{ insetInlineStart: "1.25rem" }}
        />
      )}
      <Avatar name={a.actorName || "?"} size="md" className="z-[1] mt-0.5" />
      <div
        className={cn(
          "min-w-0 flex-1",
          last ? "pb-0" : "pb-6",
        )}
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold text-cream-50">
            {a.actorName || "—"}
          </span>
          <Badge tone={tone} className="py-0.5 text-[0.7rem]">
            {label}
          </Badge>
          <span className="text-xs text-ink-500">{when}</span>
        </div>
        <p className="mt-1 text-sm text-cream-100/80">
          {a.summary}
          {a.entityLabel && (
            <span className="text-ink-500"> · {a.entityLabel}</span>
          )}
        </p>
      </div>
    </li>
  );
}
