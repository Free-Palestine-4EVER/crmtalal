"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/form";
import { useI18n } from "@/i18n";
import { apiFetch } from "@/lib/api";
import { COMPANY_TYPES, type Company, type CompanyType } from "@/lib/types";
import { COMPANY_TYPE_LABEL } from "./dealEnums";

type FormState = {
  name: string;
  type: CompanyType;
  sector: string;
  website: string;
  phone: string;
  email: string;
  city: string;
  notes: string;
};

const empty: FormState = {
  name: "",
  type: "client",
  sector: "",
  website: "",
  phone: "",
  email: "",
  city: "",
  notes: "",
};

function fromCompany(c: Company): FormState {
  return {
    name: c.name ?? "",
    type: c.type ?? "client",
    sector: c.sector ?? "",
    website: c.website ?? "",
    phone: c.phone ?? "",
    email: c.email ?? "",
    city: c.city ?? "",
    notes: c.notes ?? "",
  };
}

export function CompanyFormModal({
  open,
  onClose,
  company,
}: {
  open: boolean;
  onClose: () => void;
  /** When provided the modal edits; otherwise it creates. */
  company?: Company | null;
}) {
  const { dict: d, L } = useI18n();
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const editing = !!company;

  // Reset the form whenever the modal opens (or the target company changes).
  useEffect(() => {
    if (open) setForm(company ? fromCompany(company) : empty);
  }, [open, company]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error(d.common.required);
      return;
    }
    setSaving(true);
    // Drop empty optional strings so we don't store blanks.
    const data: Record<string, unknown> = {
      name: form.name.trim(),
      type: form.type,
    };
    for (const k of ["sector", "website", "phone", "email", "city", "notes"] as const) {
      const v = form[k].trim();
      if (v) data[k] = v;
    }
    try {
      await apiFetch("/api/crm", {
        body: {
          entity: "companies",
          op: editing ? "update" : "create",
          ...(editing ? { id: company!.id } : {}),
          data,
        },
      });
      toast.success(d.common.saved);
      onClose();
    } catch {
      toast.error(d.common.error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? d.common.edit : d.modules.addCompany}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            {d.common.cancel}
          </Button>
          <Button
            type="submit"
            form="company-form"
            variant="gold"
            size="sm"
            loading={saving}
          >
            {editing ? d.common.save : d.common.create}
          </Button>
        </>
      }
    >
      <form id="company-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label={d.modules.companies} required className="sm:col-span-2">
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder={L({ ar: "اسم الشركة", en: "Company name" })}
            autoFocus
            required
          />
        </Field>

        <Field label={d.common.status} hint={L({ ar: "نوع الشركة", en: "Company type" })}>
          <Select value={form.type} onChange={(e) => set("type", e.target.value as CompanyType)}>
            {COMPANY_TYPES.map((t) => (
              <option key={t} value={t}>
                {L(COMPANY_TYPE_LABEL[t])}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={L({ ar: "القطاع", en: "Sector" })}>
          <Input
            value={form.sector}
            onChange={(e) => set("sector", e.target.value)}
            placeholder={L({ ar: "مثال: العقارات", en: "e.g. Real estate" })}
          />
        </Field>

        <Field label={L({ ar: "المدينة", en: "City" })}>
          <Input
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder={L({ ar: "الرياض", en: "Riyadh" })}
          />
        </Field>

        <Field label={L({ ar: "الهاتف", en: "Phone" })}>
          <Input
            dir="ltr"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+966 5X XXX XXXX"
            className="text-start"
          />
        </Field>

        <Field label={L({ ar: "البريد الإلكتروني", en: "Email" })}>
          <Input
            dir="ltr"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="name@company.com"
            className="text-start"
          />
        </Field>

        <Field label={L({ ar: "الموقع الإلكتروني", en: "Website" })}>
          <Input
            dir="ltr"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
            placeholder="company.com"
            className="text-start"
          />
        </Field>

        <Field label={L({ ar: "ملاحظات", en: "Notes" })} className="sm:col-span-2">
          <Textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder={L({ ar: "ملاحظات إضافية…", en: "Additional notes…" })}
          />
        </Field>
      </form>
    </Modal>
  );
}
