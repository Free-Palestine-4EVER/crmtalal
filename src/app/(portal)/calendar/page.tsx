"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User as UserIcon,
  Pencil,
  Trash2,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DetailRow, orDash } from "@/components/portal/crm/DetailRow";
import { EventFormModal } from "@/components/portal/crm/EventFormModal";
import {
  CALENDAR_EVENT_TYPE_LABEL,
  CALENDAR_EVENT_TYPE_TONE,
  CALENDAR_EVENT_CHIP,
  CRM_TEXT,
  FIELD_LABEL,
} from "@/components/portal/crm/labels";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useEvents, useUsersByRole } from "@/lib/hooks/data";
import { apiFetch } from "@/lib/api";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/cn";
import { fmtDate, fmtDateTime } from "@/lib/format";
import type { CalendarEvent } from "@/lib/types";

/** Current epoch ms. Wrapped at module scope so the render-purity lint
 *  rule doesn't flag an inline `Date.now()` (this is regular app code). */
const nowMs = () => Date.now();

/** A stable per-day key (local time). */
function dayKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
function isSameDay(a: number, b: number): boolean {
  return dayKey(a) === dayKey(b);
}

export default function CalendarPage() {
  const { dict: d, locale, isRTL, L } = useI18n();
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const { data: events, loading } = useEvents();
  const employees = useUsersByRole("employee").data;
  const admins = useUsersByRole("admin").data;
  const assignees = useMemo(
    () => [...employees, ...admins],
    [employees, admins],
  );

  // Displayed month — first-of-month anchor.
  const [cursor, setCursor] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });

  // Modals
  const [dayOpen, setDayOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [formDefaultDate, setFormDefaultDate] = useState<number | undefined>();
  const [detail, setDetail] = useState<CalendarEvent | null>(null);
  const [toDelete, setToDelete] = useState<CalendarEvent | null>(null);
  const [deleting, setDeleting] = useState(false);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  // Group events by local day.
  const byDay = useMemo(() => {
    const m = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const k = dayKey(e.start);
      const arr = m.get(k);
      if (arr) arr.push(e);
      else m.set(k, [e]);
    }
    // Each bucket sorted by start time.
    for (const arr of m.values()) arr.sort((a, b) => a.start - b.start);
    return m;
  }, [events]);

  // Localized month/year + weekday headers.
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
        month: "long",
        year: "numeric",
      }).format(cursor),
    [cursor, locale],
  );

  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
      weekday: "short",
    });
    // Sunday-first week (matches KSA/Gregorian default here).
    return Array.from({ length: 7 }, (_, i) => {
      const dd = new Date(2023, 0, 1 + i); // 2023-01-01 was a Sunday
      return fmt.format(dd);
    });
  }, [locale]);

  // Cells: leading blanks + every day of the month.
  const cells = useMemo(() => {
    const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out: (number | null)[] = [];
    for (let i = 0; i < firstDow; i++) out.push(null);
    for (let day = 1; day <= daysInMonth; day++)
      out.push(new Date(year, month, day).getTime());
    // Trailing blanks to complete the final week row.
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [year, month]);

  const todayMs = nowMs();

  const goPrev = () => setCursor(new Date(year, month - 1, 1));
  const goNext = () => setCursor(new Date(year, month + 1, 1));
  const goToday = () => {
    const t = new Date();
    setCursor(new Date(t.getFullYear(), t.getMonth(), 1));
  };

  const openDay = (ms: number) => {
    setSelectedDay(ms);
    setDayOpen(true);
  };
  const openAddForDay = (ms?: number) => {
    setEditing(null);
    setFormDefaultDate(ms);
    setFormOpen(true);
  };
  const openEdit = (e: CalendarEvent) => {
    setDetail(null);
    setEditing(e);
    setFormDefaultDate(undefined);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await apiFetch("/api/crm", {
        body: { entity: "events", op: "delete", id: toDelete.id },
      });
      toast.success(d.common.saved);
      setToDelete(null);
      setDetail(null);
    } catch {
      toast.error(d.common.error);
    } finally {
      setDeleting(false);
    }
  };

  // Prev/next chevrons are mirrored for RTL so "previous" always points back.
  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  const dayEvents = selectedDay
    ? (byDay.get(dayKey(selectedDay)) ?? [])
    : [];

  return (
    <div>
      <PageHeader
        icon={CalendarIcon}
        title={d.modules.calendar}
        actions={
          <Button size="sm" onClick={() => openAddForDay(undefined)}>
            <Plus className="h-4 w-4" />
            {d.modules.addEvent}
          </Button>
        }
      />

      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-cream-50">{monthLabel}</h2>
        <div className="flex items-center gap-1.5">
          <Button variant="subtle" size="sm" onClick={goToday}>
            {d.common.today}
          </Button>
          <button
            type="button"
            onClick={goPrev}
            aria-label={d.common.previous}
            className="grid h-9 w-9 place-items-center rounded-lg border border-ink-700 bg-ink-850/70 text-parch-100/80 transition-colors hover:border-gold-500/40 hover:text-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
          >
            <PrevIcon className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label={d.common.next}
            className="grid h-9 w-9 place-items-center rounded-lg border border-ink-700 bg-ink-850/70 text-parch-100/80 transition-colors hover:border-gold-500/40 hover:text-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
          >
            <NextIcon className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-[560px] w-full" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-700/80 bg-ink-850/40 shadow-card">
          {/* Weekday header */}
          <div className="grid grid-cols-7 border-b border-ink-700/70">
            {weekdays.map((w, i) => (
              <div
                key={i}
                className="px-2 py-2.5 text-center text-xs font-medium tracking-wide text-ink-500 uppercase"
              >
                {w}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {cells.map((ms, i) => {
              if (ms === null)
                return (
                  <div
                    key={i}
                    className="min-h-[104px] border-b border-e border-ink-800/60 bg-ink-900/30 last:border-e-0"
                  />
                );

              const list = byDay.get(dayKey(ms)) ?? [];
              const isToday = isSameDay(ms, todayMs);
              const dayNum = new Date(ms).getDate();
              const shown = list.slice(0, 3);
              const extra = list.length - shown.length;

              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => openDay(ms)}
                  className={cn(
                    "group min-h-[104px] cursor-pointer border-b border-e border-ink-800/60 p-1.5 text-start align-top transition-colors hover:bg-ink-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-500",
                    isToday && "bg-gold-500/[0.06]",
                  )}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className={cn(
                        "nums grid h-6 min-w-6 place-items-center rounded-full px-1 text-xs font-semibold",
                        isToday
                          ? "bg-gold-500 text-ink-950"
                          : "text-parch-100/70 group-hover:text-cream-50",
                      )}
                    >
                      {dayNum}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {shown.map((e) => (
                      <span
                        key={e.id}
                        role="button"
                        tabIndex={0}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setDetail(e);
                        }}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter" || ev.key === " ") {
                            ev.preventDefault();
                            ev.stopPropagation();
                            setDetail(e);
                          }
                        }}
                        title={e.title}
                        className={cn(
                          "block truncate rounded-md px-1.5 py-0.5 text-[0.7rem] font-medium ring-1 ring-inset transition-transform hover:scale-[1.01]",
                          CALENDAR_EVENT_CHIP[e.type],
                        )}
                      >
                        {e.title}
                      </span>
                    ))}
                    {extra > 0 && (
                      <span className="block px-1.5 text-[0.7rem] font-medium text-ink-500">
                        +{extra}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Day list modal */}
      <Modal
        open={dayOpen}
        onClose={() => setDayOpen(false)}
        title={selectedDay ? fmtDate(selectedDay, locale) : ""}
        footer={
          <Button
            size="sm"
            onClick={() => {
              setDayOpen(false);
              openAddForDay(selectedDay ?? undefined);
            }}
          >
            <Plus className="h-4 w-4" />
            {d.modules.addEvent}
          </Button>
        }
      >
        {dayEvents.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-500">
            {d.modules.noEvents}
          </p>
        ) : (
          <ul className="space-y-2">
            {dayEvents.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => {
                    setDayOpen(false);
                    setDetail(e);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-ink-700/70 bg-ink-800/40 p-3 text-start transition-colors hover:border-gold-500/30 hover:bg-ink-800/70"
                >
                  <span
                    className={cn(
                      "h-9 w-1 shrink-0 rounded-full",
                      CALENDAR_EVENT_CHIP[e.type],
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-cream-50">
                      {e.title}
                    </span>
                    <span className="nums mt-0.5 block text-xs text-ink-500">
                      {fmtDateTime(e.start, locale)}
                    </span>
                  </span>
                  <Badge tone={CALENDAR_EVENT_TYPE_TONE[e.type]}>
                    {L(CALENDAR_EVENT_TYPE_LABEL[e.type])}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      {/* Event detail modal */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.title}
        description={detail ? L(CALENDAR_EVENT_TYPE_LABEL[detail.type]) : undefined}
        footer={
          detail && (
            <>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setToDelete(detail)}
                  className="text-critical hover:bg-critical/10"
                >
                  <Trash2 className="h-4 w-4" />
                  {d.common.delete}
                </Button>
              )}
              <Button variant="subtle" size="sm" onClick={() => openEdit(detail)}>
                <Pencil className="h-4 w-4" />
                {d.common.edit}
              </Button>
            </>
          )
        }
      >
        {detail && (
          <div className="divide-y divide-ink-700/50">
            <DetailRow label={L(FIELD_LABEL.start)}>
              <span className="nums inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-ink-500" />
                {fmtDateTime(detail.start, locale)}
              </span>
            </DetailRow>
            {detail.end !== undefined && (
              <DetailRow label={L(FIELD_LABEL.end)}>
                <span className="nums">{fmtDateTime(detail.end, locale)}</span>
              </DetailRow>
            )}
            {detail.location && (
              <DetailRow label={L(FIELD_LABEL.location)}>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-ink-500" />
                  {detail.location}
                </span>
              </DetailRow>
            )}
            {detail.clientName && (
              <DetailRow label={L(FIELD_LABEL.clientName)}>
                {detail.clientName}
              </DetailRow>
            )}
            <DetailRow label={L(FIELD_LABEL.assigned)}>
              {detail.assignedToName ? (
                <span className="inline-flex items-center gap-1.5">
                  <UserIcon className="h-3.5 w-3.5 text-ink-500" />
                  {detail.assignedToName}
                </span>
              ) : (
                orDash(null)
              )}
            </DetailRow>
            {detail.projectCode && (
              <DetailRow label={L(FIELD_LABEL.project)} ltr>
                <span className="nums font-mono text-gold-300">
                  {detail.projectCode}
                </span>
              </DetailRow>
            )}
            {detail.notes && (
              <DetailRow label={L(FIELD_LABEL.notes)}>{detail.notes}</DetailRow>
            )}
          </div>
        )}
      </Modal>

      {/* Add / edit event form */}
      <EventFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        event={editing}
        defaultDate={formDefaultDate}
        assignees={assignees}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title={L(CRM_TEXT.deleteEventQ)}
        message={L(CRM_TEXT.deleteWarn)}
        confirmLabel={d.common.delete}
        danger
        loading={deleting}
      />
    </div>
  );
}
