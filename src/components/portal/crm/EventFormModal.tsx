"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/form";
import { apiFetch } from "@/lib/api";
import { useI18n } from "@/i18n";
import {
  CALENDAR_EVENT_TYPES,
  type CalendarEventType,
  type CalendarEvent,
  type UserProfile,
} from "@/lib/types";
import { FIELD_LABEL, CRM_TEXT, CALENDAR_EVENT_TYPE_LABEL } from "./labels";

/** ms → value for <input type="datetime-local"> in local time. */
function toDateTimeInput(ms?: number): string {
  if (!ms) return "";
  const d = new Date(ms);
  const off = d.getTimezoneOffset();
  return new Date(ms - off * 60000).toISOString().slice(0, 16);
}

/** A datetime-local value at 09:00 on the given day (local). */
function defaultStartFor(dayMs?: number): string {
  if (!dayMs) return "";
  const d = new Date(dayMs);
  d.setHours(9, 0, 0, 0);
  return toDateTimeInput(d.getTime());
}

export function EventFormModal({
  open,
  onClose,
  event,
  defaultDate,
  assignees,
}: {
  open: boolean;
  onClose: () => void;
  /** Present → edit mode; absent → create mode. */
  event?: CalendarEvent | null;
  /** ms of the day to prefill the start with (create mode). */
  defaultDate?: number;
  assignees: UserProfile[];
}) {
  const { dict: d, L } = useI18n();
  const editing = !!event;
  const [saving, setSaving] = useState(false);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? L(CRM_TEXT.editEvent) : d.modules.addEvent}
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            {d.common.cancel}
          </Button>
          <Button
            size="sm"
            loading={saving}
            type="submit"
            form="event-form"
          >
            {saving ? d.common.saving : d.common.save}
          </Button>
        </>
      }
    >
      {/* Keyed so each open mounts a fresh form whose state initializes from
          the event / default date — avoids syncing props via an effect. */}
      {open && (
        <EventForm
          key={event?.id ?? `new-${defaultDate ?? 0}`}
          event={event}
          defaultDate={defaultDate}
          assignees={assignees}
          onClose={onClose}
          onSavingChange={setSaving}
        />
      )}
    </Modal>
  );
}

function EventForm({
  event,
  defaultDate,
  assignees,
  onClose,
  onSavingChange,
}: {
  event?: CalendarEvent | null;
  defaultDate?: number;
  assignees: UserProfile[];
  onClose: () => void;
  onSavingChange: (v: boolean) => void;
}) {
  const { dict: d, L } = useI18n();
  const editing = !!event;

  const [title, setTitle] = useState(event?.title ?? "");
  const [type, setType] = useState<CalendarEventType>(event?.type ?? "meeting");
  const [start, setStart] = useState(
    event ? toDateTimeInput(event.start) : defaultStartFor(defaultDate),
  );
  const [end, setEnd] = useState(toDateTimeInput(event?.end));
  const [location, setLocation] = useState(event?.location ?? "");
  const [clientName, setClientName] = useState(event?.clientName ?? "");
  const [assignedTo, setAssignedTo] = useState(event?.assignedTo ?? "");
  const [notes, setNotes] = useState(event?.notes ?? "");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !start) {
      toast.error(d.common.required);
      return;
    }
    const startMs = new Date(start).getTime();
    const endMs = end ? new Date(end).getTime() : undefined;
    if (endMs !== undefined && endMs < startMs) {
      toast.error(d.common.error);
      return;
    }
    onSavingChange(true);

    const chosen = assignees.find((u) => u.uid === assignedTo);
    const data: Record<string, unknown> = {
      title: title.trim(),
      type,
      start: startMs,
      end: endMs,
      location: location.trim() || undefined,
      clientName: clientName.trim() || undefined,
      assignedTo: assignedTo || undefined,
      assignedToName: chosen?.name || undefined,
      notes: notes.trim() || undefined,
    };

    try {
      await apiFetch("/api/crm", {
        body: {
          entity: "events",
          op: editing ? "update" : "create",
          ...(editing ? { id: event!.id } : {}),
          data,
        },
      });
      toast.success(d.common.saved);
      onClose();
    } catch {
      toast.error(d.common.error);
    } finally {
      onSavingChange(false);
    }
  };

  return (
    <form id="event-form" onSubmit={submit} className="space-y-4">
      <Field label={L(FIELD_LABEL.title)} required>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={L(CRM_TEXT.titlePlaceholderEvent)}
          autoFocus
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={L(FIELD_LABEL.type)}>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as CalendarEventType)}
          >
            {CALENDAR_EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {L(CALENDAR_EVENT_TYPE_LABEL[t])}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={L(FIELD_LABEL.assigned)}>
          <Select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          >
            <option value="">{L(FIELD_LABEL.unassigned)}</option>
            {assignees.map((u) => (
              <option key={u.uid} value={u.uid}>
                {u.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={L(FIELD_LABEL.start)} required>
          <Input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </Field>

        <Field label={`${L(FIELD_LABEL.end)} (${d.common.optional})`}>
          <Input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={L(FIELD_LABEL.location)}>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </Field>

        <Field label={L(FIELD_LABEL.clientName)}>
          <Input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </Field>
      </div>

      <Field label={L(FIELD_LABEL.notes)}>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
    </form>
  );
}
