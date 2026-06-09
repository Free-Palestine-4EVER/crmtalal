"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/form";
import { apiFetch } from "@/lib/api";
import { useI18n } from "@/i18n";
import { CONTACT_TYPE_LABEL, FIELD_LABEL } from "./labels";
import { CONTACT_TYPES, type Contact, type ContactType } from "@/lib/types";

type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  type: ContactType;
  notes: string;
};

function initialForm(c?: Contact | null): ContactFormState {
  return {
    name: c?.name ?? "",
    email: c?.email ?? "",
    phone: c?.phone ?? "",
    company: c?.company ?? "",
    title: c?.title ?? "",
    type: c?.type ?? "client",
    notes: c?.notes ?? "",
  };
}

export function ContactFormModal({
  open,
  onClose,
  contact,
}: {
  open: boolean;
  onClose: () => void;
  /** Pass to edit; omit to create. */
  contact?: Contact | null;
}) {
  // Fresh mount per open / target so state initializes from props directly.
  return (
    <ContactFormBody
      key={open ? (contact?.id ?? "new") : "closed"}
      open={open}
      onClose={onClose}
      contact={contact}
    />
  );
}

function ContactFormBody({
  open,
  onClose,
  contact,
}: {
  open: boolean;
  onClose: () => void;
  contact?: Contact | null;
}) {
  const { dict: d, L } = useI18n();
  const editing = !!contact;
  const [form, setForm] = useState<ContactFormState>(() => initialForm(contact));
  const [saving, setSaving] = useState(false);
  const [nameErr, setNameErr] = useState(false);

  const set = <K extends keyof ContactFormState>(
    key: K,
    value: ContactFormState[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setNameErr(true);
      return;
    }
    setSaving(true);
    try {
      const data: Record<string, unknown> = {
        name: form.name.trim(),
        type: form.type,
      };
      const optional: (keyof ContactFormState)[] = [
        "email",
        "phone",
        "company",
        "title",
        "notes",
      ];
      for (const k of optional) {
        const v = form[k].trim();
        if (v) data[k] = v;
      }

      if (editing && contact) {
        await apiFetch("/api/crm", {
          body: { entity: "contacts", op: "update", id: contact.id, data },
        });
      } else {
        await apiFetch("/api/crm", {
          body: { entity: "contacts", op: "create", data },
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
      title={editing ? d.common.edit : d.modules.addContact}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            {d.common.cancel}
          </Button>
          <Button type="submit" form="contact-form" size="sm" loading={saving}>
            {d.common.save}
          </Button>
        </>
      }
    >
      <form
        id="contact-form"
        onSubmit={submit}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field
          label={L(FIELD_LABEL.name)}
          required
          error={nameErr ? d.common.required : undefined}
          className="sm:col-span-2"
        >
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            autoFocus
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

        <Field label={L(FIELD_LABEL.phone)}>
          <Input
            dir="ltr"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            style={{ textAlign: "start" }}
          />
        </Field>

        <Field label={L(FIELD_LABEL.company)}>
          <Input
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
          />
        </Field>

        <Field label={L(FIELD_LABEL.jobTitle)}>
          <Input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </Field>

        <Field label={L(FIELD_LABEL.type)} className="sm:col-span-2">
          <Select
            value={form.type}
            onChange={(e) => set("type", e.target.value as ContactType)}
          >
            {CONTACT_TYPES.map((t) => (
              <option key={t} value={t}>
                {L(CONTACT_TYPE_LABEL[t])}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={L(FIELD_LABEL.notes)} className="sm:col-span-2">
          <Textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </Field>
      </form>
    </Modal>
  );
}
