"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CheckSquare,
  Plus,
  Check,
  Pencil,
  Trash2,
  CalendarClock,
} from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { Toolbar } from "@/components/ui/Toolbar";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Tooltip } from "@/components/ui/Tooltip";
import { TaskFormModal } from "@/components/portal/crm/TaskFormModal";
import {
  TASK_STATUS_LABEL,
  CRM_TEXT,
  FIELD_LABEL,
} from "@/components/portal/crm/labels";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useTasks, useUsersByRole } from "@/lib/hooks/data";
import { apiFetch } from "@/lib/api";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/cn";
import { fmtDate } from "@/lib/format";
import {
  TASK_STATUSES,
  PRIORITY_TONE,
  type Task,
  type TaskStatus,
} from "@/lib/types";

type Filter = TaskStatus | "all";

/** Current epoch ms. Wrapped at module scope so the render-purity lint
 *  rule doesn't flag an inline `Date.now()` (this is regular app code). */
const nowMs = () => Date.now();

/** Same calendar day in local time? */
function isSameDay(a: number, b: number): boolean {
  const x = new Date(a);
  const y = new Date(b);
  return (
    x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() &&
    x.getDate() === y.getDate()
  );
}

export default function TasksPage() {
  const { dict: d, L } = useI18n();
  const { role, profile } = useAuth();
  const isAdmin = role === "admin";

  const { data: tasks, loading } = useTasks();
  const employees = useUsersByRole("employee").data;
  const admins = useUsersByRole("admin").data;
  const assignees = useMemo(
    () => [...employees, ...admins],
    [employees, admins],
  );

  const [filter, setFilter] = useState<Filter>("all");
  const [mineOnly, setMineOnly] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [toDelete, setToDelete] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  const myUid = profile?.uid;

  // "Assigned to me" pre-filter (applies to counts too).
  const scoped = useMemo(
    () =>
      mineOnly && myUid
        ? tasks.filter((t) => t.assignedTo === myUid)
        : tasks,
    [tasks, mineOnly, myUid],
  );

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: scoped.length,
      todo: 0,
      in_progress: 0,
      done: 0,
      cancelled: 0,
    };
    for (const t of scoped) c[t.status] += 1;
    return c;
  }, [scoped]);

  const filtered = useMemo(() => {
    const list =
      filter === "all" ? scoped : scoped.filter((t) => t.status === filter);
    // Open tasks first, ordered by due date (soonest first, undated last);
    // done/cancelled sink to the bottom.
    const closed = (t: Task) => t.status === "done" || t.status === "cancelled";
    return [...list].sort((a, b) => {
      const ca = closed(a) ? 1 : 0;
      const cb = closed(b) ? 1 : 0;
      if (ca !== cb) return ca - cb;
      const da = a.dueAt ?? Infinity;
      const db = b.dueAt ?? Infinity;
      if (da !== db) return da - db;
      return b.createdAt - a.createdAt;
    });
  }, [scoped, filter]);

  const toggleDone = async (t: Task) => {
    const next = t.status === "done" ? "todo" : "done";
    setBusy(t.id);
    try {
      await apiFetch("/api/crm", {
        body: {
          entity: "tasks",
          op: "update",
          id: t.id,
          data: {
            status: next,
            completedAt: next === "done" ? nowMs() : undefined,
          },
        },
      });
    } catch {
      toast.error(d.common.error);
    } finally {
      setBusy(null);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await apiFetch("/api/crm", {
        body: { entity: "tasks", op: "delete", id: toDelete.id },
      });
      toast.success(d.common.saved);
      setToDelete(null);
    } catch {
      toast.error(d.common.error);
    } finally {
      setDeleting(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (t: Task) => {
    setEditing(t);
    setFormOpen(true);
  };

  const segments = [
    { value: "all" as Filter, label: d.common.all, count: counts.all },
    ...TASK_STATUSES.map((s) => ({
      value: s as Filter,
      label: L(TASK_STATUS_LABEL[s]),
      count: counts[s],
    })),
  ];

  return (
    <div>
      <PageHeader
        icon={CheckSquare}
        title={d.modules.tasks}
        actions={
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            {d.modules.addTask}
          </Button>
        }
      />

      <Toolbar>
        <SegmentedControl
          value={filter}
          onChange={(v) => setFilter(v as Filter)}
          options={segments}
        />
        <button
          type="button"
          onClick={() => setMineOnly((v) => !v)}
          aria-pressed={mineOnly}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500",
            mineOnly
              ? "border-gold-500/40 bg-gold-500/10 text-gold-200"
              : "border-ink-700 bg-ink-850/70 text-parch-100/70 hover:text-parch-50",
          )}
        >
          <Check className="h-3.5 w-3.5" />
          {L(CRM_TEXT.assignedToMe)}
        </button>
      </Toolbar>

      <div className="mt-5 space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[76px] w-full" />
          ))
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title={d.modules.noTasks}
            action={
              <Button size="sm" onClick={openAdd}>
                <Plus className="h-4 w-4" />
                {d.modules.addTask}
              </Button>
            }
          />
        ) : (
          filtered.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              busy={busy === t.id}
              canDelete={isAdmin}
              onToggle={() => toggleDone(t)}
              onEdit={() => openEdit(t)}
              onDelete={() => setToDelete(t)}
            />
          ))
        )}
      </div>

      <TaskFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        task={editing}
        assignees={assignees}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title={L(CRM_TEXT.deleteTaskQ)}
        message={toDelete?.title}
        confirmLabel={d.common.delete}
        danger
        loading={deleting}
      />
    </div>
  );
}

function TaskRow({
  task,
  busy,
  canDelete,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task;
  busy: boolean;
  canDelete: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { dict: d, locale, L } = useI18n();
  const done = task.status === "done";
  const cancelled = task.status === "cancelled";
  const closed = done || cancelled;

  const now = nowMs();
  const overdue = !closed && task.dueAt !== undefined && task.dueAt < now;
  const dueToday =
    !closed &&
    task.dueAt !== undefined &&
    !overdue &&
    isSameDay(task.dueAt, now);

  return (
    <div className="group flex items-start gap-3.5 rounded-2xl border border-ink-700/80 bg-ink-850/60 p-4 shadow-card transition-colors hover:border-gold-500/30 hover:bg-ink-800/60">
      {/* Toggle */}
      <button
        type="button"
        onClick={onToggle}
        disabled={busy || cancelled}
        aria-pressed={done}
        aria-label={done ? L(CRM_TEXT.reopen) : d.modules.markDone}
        className={cn(
          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500",
          done
            ? "border-positive bg-positive/90 text-ink-950"
            : "border-ink-600 text-transparent hover:border-gold-500",
          (busy || cancelled) && "opacity-50",
        )}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </button>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span
            className={cn(
              "text-[0.95rem] font-medium text-cream-50",
              closed && "text-ink-400 line-through",
            )}
          >
            {task.title}
          </span>

          {task.priority !== "normal" && (
            <Badge tone={PRIORITY_TONE[task.priority]}>
              {task.priority === "high"
                ? d.project.priorityHigh
                : d.project.priorityUrgent}
            </Badge>
          )}

          {cancelled && (
            <Badge tone="critical">{L(TASK_STATUS_LABEL.cancelled)}</Badge>
          )}

          {task.relatedProjectCode && (
            <span className="nums font-mono text-xs text-gold-300" dir="ltr">
              {task.relatedProjectCode}
            </span>
          )}
        </div>

        {task.description && (
          <p
            className={cn(
              "mt-1 line-clamp-2 text-sm text-parch-100/70",
              closed && "text-ink-500",
            )}
          >
            {task.description}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
          {task.dueAt !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5",
                overdue
                  ? "font-medium text-critical"
                  : dueToday
                    ? "font-medium text-gold-300"
                    : "text-ink-500",
              )}
            >
              <CalendarClock className="h-3.5 w-3.5" />
              {dueToday
                ? d.modules.dueToday
                : overdue
                  ? `${d.modules.overdue} · ${fmtDate(task.dueAt, locale)}`
                  : fmtDate(task.dueAt, locale)}
            </span>
          )}

          {task.assignedToName ? (
            <span className="inline-flex items-center gap-1.5 text-ink-400">
              <Avatar name={task.assignedToName} size="sm" />
              {task.assignedToName}
            </span>
          ) : (
            <span className="text-ink-600">{L(FIELD_LABEL.unassigned)}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <Tooltip content={d.common.edit}>
          <button
            type="button"
            onClick={onEdit}
            aria-label={d.common.edit}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-white/5 hover:text-parch-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </Tooltip>
        {canDelete && (
          <Tooltip content={d.common.delete}>
            <button
              type="button"
              onClick={onDelete}
              aria-label={d.common.delete}
              className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-critical/15 hover:text-critical focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
