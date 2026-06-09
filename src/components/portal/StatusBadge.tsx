"use client";

import { Badge } from "@/components/ui/Badge";
import {
  STATUS_TONE,
  PRIORITY_TONE,
  type ProjectStatus,
  type Priority,
} from "@/lib/types";
import { useDict } from "@/i18n";

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const d = useDict();
  return (
    <Badge tone={STATUS_TONE[status]} dot>
      {d.status[status]}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const d = useDict();
  if (priority === "normal") return null;
  return (
    <Badge tone={PRIORITY_TONE[priority]}>
      {priority === "high" ? d.project.priorityHigh : d.project.priorityUrgent}
    </Badge>
  );
}
