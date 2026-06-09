"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/form";
import { apiFetch } from "@/lib/api";
import { useI18n } from "@/i18n";
import {
  PRIORITIES,
  type Priority,
  type Task,
  type UserProfile,
} from "@/lib/types";
import { FIELD_LABEL, CRM_TEXT } from "./labels";

/** Convert a ms timestamp into a value for <input type="date"> (local). */
function toDateInput(ms?: number): string {
  if (!ms) return "";
  const d = new Date(ms);
  const off = d.getTimezoneOffset();
  return new Date(ms - off * 60000).toISOString().slice(0, 10);
}

export function TaskFormModal({
  open,
  onClose,
  task,
  assignees,
}: {
  open: boolean;
  onClose: () => void;
  /** Present → edit mode; absent → create mode. */
  task?: Task | null;
  assignees: UserProfile[];
}) {
  const { dict: d, L } = useI18n();
  const editing = !!task;
  const [saving, setSaving] = useState(false);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? L(CRM_TEXT.editTask) : d.modules.addTask}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            {d.common.cancel}
          </Button>
          <Button
            size="sm"
            loading={saving}
            type="submit"
            form="task-form"
          >
            {saving ? d.common.saving : d.common.save}
          </Button>
        </>
      }
    >
      {/* Keyed so each open (or target change) mounts a fresh form whose
          state initializes from the task — no setState-in-effect needed. */}
      {open && (
        <TaskForm
          key={task?.id ?? "new"}
          task={task}
          assignees={assignees}
          onClose={onClose}
          onSavingChange={setSaving}
        />
      )}
    </Modal>
  );
}

function TaskForm({
  task,
  assignees,
  onClose,
  onSavingChange,
}: {
  task?: Task | null;
  assignees: UserProfile[];
  onClose: () => void;
  onSavingChange: (v: boolean) => void;
}) {
  const { dict: d, L } = useI18n();
  const editing = !!task;

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "normal");
  const [dueAt, setDueAt] = useState(toDateInput(task?.dueAt));
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo ?? "");
  const [relatedProjectCode, setRelatedProjectCode] = useState(
    task?.relatedProjectCode ?? "",
  );

  const priorityLabel = (p: Priority) =>
    p === "normal"
      ? d.project.priorityNormal
      : p === "high"
        ? d.project.priorityHigh
        : d.project.priorityUrgent;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error(d.common.required);
      return;
    }
    onSavingChange(true);

    const chosen = assignees.find((u) => u.uid === assignedTo);
    const data: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueAt: dueAt ? new Date(dueAt).getTime() : undefined,
      assignedTo: assignedTo || undefined,
      assignedToName: chosen?.name || undefined,
      relatedProjectCode: relatedProjectCode.trim() || undefined,
    };
    // Preserve status on edit; default new tasks to "todo".
    if (!editing) data.status = "todo";

    try {
      await apiFetch("/api/crm", {
        body: {
          entity: "tasks",
          op: editing ? "update" : "create",
          ...(editing ? { id: task!.id } : {}),
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
    <form id="task-form" onSubmit={submit} className="space-y-4">
      <Field label={L(FIELD_LABEL.title)} required>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={L(CRM_TEXT.titlePlaceholderTask)}
          autoFocus
        />
      </Field>

      <Field label={L(FIELD_LABEL.description)}>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={L(FIELD_LABEL.priority)}>
          <Select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {priorityLabel(p)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={L(FIELD_LABEL.dueDate)}>
          <Input
            type="date"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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

        <Field label={L(FIELD_LABEL.project)}>
          <Input
            value={relatedProjectCode}
            onChange={(e) => setRelatedProjectCode(e.target.value)}
            placeholder={L(CRM_TEXT.projectPlaceholder)}
            dir="ltr"
            style={{ textAlign: "start" }}
            className="nums"
          />
        </Field>
      </div>
    </form>
  );
}
