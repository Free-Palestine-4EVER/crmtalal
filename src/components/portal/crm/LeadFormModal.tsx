"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/form";
import { apiFetch } from "@/lib/api";
import { useI18n } from "@/i18n";
import { LEAD_SOURCES_PRESENT } from "./constants";
import { LEAD_SOURCE_LABEL, FIELD_LABEL } from "./labels";
import type { Lead, LeadSource } from "@/lib/types";

type LeadFormState = {
  name: string;
  phone: string;
  email: string;
  propertyType: string;
  purpose: string;
  region: string;
  source: LeadSource;
  message: string;
  note: string;
};

function initialForm(lead?: Lead | null): LeadFormState {
  return {
    name: lead?.name ?? "",
    phone: lead?.phone ?? "",
    email: lead?.email ?? "",
    propertyType: lead?.propertyType ?? "",
    purpose: lead?.purpose ?? "",
    region: lead?.region ?? "",
    source: lead?.source ?? "manual",
    message: lead?.message ?? "",
    note: lead?.note ?? "",
  };
}

export function LeadFormModal({
  open,
  onClose,
  lead,
}: {
  open: boolean;
  onClose: () => void;
  /** Pass to edit an existing lead; omit to create. */
  lead?: Lead | null;
}) {
  // Remount the body on each open (and per target lead) so its state
  // initializes fresh from props — no setState-in-effect needed.
  return (
    <LeadFormBody
      key={open ? (lead?.id ?? "new") : "closed"}
      open={open}
      onClose={onClose}
      lead={lead}
    />
  );
}

function LeadFormBody({
  open,
  onClose,
  lead,
}: {
  open: boolean;
  onClose: () => void;
  lead?: Lead | null;
}) {
  const { dict: d, L } = useI18n();
  const editing = !!lead;
  const [form, setForm] = useState<LeadFormState>(() => initialForm(lead));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<{ name?: boolean; phone?: boolean }>({});

  const set = <K extends keyof LeadFormState>(key: K, value: LeadFormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const nextErr = {
      name: !form.name.trim(),
      phone: !form.phone.trim(),
    };
    if (nextErr.name || nextErr.phone) {
      setErr(nextErr);
      return;
    }
    setSaving(true);
    try {
      // Trim everything; drop empty optionals so we don't store "".
      const data: Record<string, unknown> = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        source: form.source,
      };
      const optional: (keyof LeadFormState)[] = [
        "email",
        "propertyType",
        "purpose",
        "region",
        "message",
        "note",
      ];
      for (const k of optional) {
        const v = form[k].trim();
        if (v) data[k] = v;
      }

      if (editing && lead) {
        await apiFetch("/api/crm", {
          body: { entity: "leads", op: "update", id: lead.id, data },
        });
      } else {
        await apiFetch("/api/crm", {
          body: { entity: "leads", op: "create", data },
        });
      }
      toast.success(d.common.saved);
      onClose();
    } catch {
      toast.error(d.common.error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? d.common.edit : d.modules.addLead}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            {d.common.cancel}
          </Button>
          <Button type="submit" form="lead-form" size="sm" loading={saving}>
            {d.common.save}
          </Button>
        </>
      }
    >
      <form id="lead-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field
          label={L(FIELD_LABEL.name)}
          required
          error={err.name ? d.common.required : undefined}
        >
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            autoFocus
          />
        </Field>

        <Field
          label={L(FIELD_LABEL.phone)}
          required
          error={err.phone ? d.common.required : undefined}
        >
          <Input
            dir="ltr"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            style={{ textAlign: "start" }}
          />
        </Field>

        <Field label={L(FIELD_LABEL.email)}>
          <Input
            dir="ltr"
            inputMode="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            style={{ textAlign: "start" }}
          />
        </Field>

        <Field label={L(FIELD_LABEL.source)}>
          <Select
            value={form.source}
            onChange={(e) => set("source", e.target.value as LeadSource)}
          >
            {LEAD_SOURCES_PRESENT.map((s) => (
              <option key={s} value={s}>
                {L(LEAD_SOURCE_LABEL[s])}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={L(FIELD_LABEL.propertyType)}>
          <Input
            value={form.propertyType}
            onChange={(e) => set("propertyType", e.target.value)}
          />
        </Field>

        <Field label={L(FIELD_LABEL.purpose)}>
          <Input
            value={form.purpose}
            onChange={(e) => set("purpose", e.target.value)}
          />
        </Field>

        <Field label={L(FIELD_LABEL.region)} className="sm:col-span-2">
          <Input
            value={form.region}
            onChange={(e) => set("region", e.target.value)}
          />
        </Field>

        <Field label={L(FIELD_LABEL.message)} className="sm:col-span-2">
          <Textarea
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
          />
        </Field>

        <Field label={L(FIELD_LABEL.note)} className="sm:col-span-2">
          <Textarea
            value={form.note}
            onChange={(e) => set("note", e.target.value)}
          />
        </Field>
      </form>
    </Modal>
  );
}
