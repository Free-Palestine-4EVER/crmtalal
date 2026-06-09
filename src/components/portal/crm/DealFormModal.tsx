"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/form";
import { useI18n } from "@/i18n";
import { apiFetch } from "@/lib/api";
import { DEAL_STAGES, type Deal, type DealStage } from "@/lib/types";
import { DEAL_STAGE_LABEL } from "./dealEnums";

type FormState = {
  title: string;
  clientName: string;
  value: string;
  stage: DealStage;
  expectedCloseAt: string; // yyyy-mm-dd for the date input
  notes: string;
};

const empty: FormState = {
  title: "",
  clientName: "",
  value: "",
  stage: "lead",
  expectedCloseAt: "",
  notes: "",
};

/** Convert a stored ms timestamp into a yyyy-mm-dd string for <input type=date>. */
function msToDateInput(ms?: number): string {
  if (!ms) return "";
  const dt = new Date(ms);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toISOString().slice(0, 10);
}

function fromDeal(deal: Deal): FormState {
  return {
    title: deal.title ?? "",
    clientName: deal.clientName ?? "",
    value: deal.value != null ? String(deal.value) : "",
    stage: deal.stage ?? "lead",
    expectedCloseAt: msToDateInput(deal.expectedCloseAt),
    notes: deal.notes ?? "",
  };
}

export function DealFormModal({
  open,
  onClose,
  deal,
}: {
  open: boolean;
  onClose: () => void;
  /** When provided the modal edits; otherwise it creates. */
  deal?: Deal | null;
}) {
  const { dict: d, L } = useI18n();
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const editing = !!deal;

  useEffect(() => {
    if (open) setForm(deal ? fromDeal(deal) : empty);
  }, [open, deal]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.clientName.trim()) {
      toast.error(d.common.required);
      return;
    }
    setSaving(true);
    const data: Record<string, unknown> = {
      title: form.title.trim(),
      clientName: form.clientName.trim(),
      stage: form.stage,
    };
    if (form.value.trim()) {
      const n = Number(form.value);
      if (!Number.isNaN(n)) data.value = n;
    }
    if (form.expectedCloseAt) {
      const ms = new Date(form.expectedCloseAt).getTime();
      if (!Number.isNaN(ms)) data.expectedCloseAt = ms;
    }
    if (form.notes.trim()) data.notes = form.notes.trim();

    try {
      await apiFetch("/api/crm", {
        body: {
          entity: "deals",
          op: editing ? "update" : "create",
          ...(editing ? { id: deal!.id } : {}),
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
      title={editing ? d.common.edit : d.modules.addDeal}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            {d.common.cancel}
          </Button>
          <Button
            type="submit"
            form="deal-form"
            variant="gold"
            size="sm"
            loading={saving}
          >
            {editing ? d.common.save : d.common.create}
          </Button>
        </>
      }
    >
      <form id="deal-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field
          label={L({ ar: "عنوان الصفقة", en: "Deal title" })}
          required
          className="sm:col-span-2"
        >
          <Input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder={L({ ar: "مثال: تقييم برج سكني", en: "e.g. Tower valuation" })}
            autoFocus
            required
          />
        </Field>

        <Field label={L({ ar: "العميل", en: "Client" })} required>
          <Input
            value={form.clientName}
            onChange={(e) => set("clientName", e.target.value)}
            placeholder={L({ ar: "اسم العميل", en: "Client name" })}
            required
          />
        </Field>

        <Field label={d.modules.value} hint={L({ ar: "بالريال السعودي", en: "In SAR" })}>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step={1000}
            dir="ltr"
            value={form.value}
            onChange={(e) => set("value", e.target.value)}
            placeholder="0"
            className="nums text-start"
          />
        </Field>

        <Field label={d.modules.stage}>
          <Select
            value={form.stage}
            onChange={(e) => set("stage", e.target.value as DealStage)}
          >
            {DEAL_STAGES.map((s) => (
              <option key={s} value={s}>
                {L(DEAL_STAGE_LABEL[s])}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={L({ ar: "تاريخ الإغلاق المتوقع", en: "Expected close date" })}>
          <Input
            type="date"
            dir="ltr"
            value={form.expectedCloseAt}
            onChange={(e) => set("expectedCloseAt", e.target.value)}
            className="text-start"
          />
        </Field>

        <Field label={L({ ar: "ملاحظات", en: "Notes" })} className="sm:col-span-2">
          <Textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder={L({ ar: "تفاصيل إضافية عن الصفقة…", en: "Additional deal details…" })}
          />
        </Field>
      </form>
    </Modal>
  );
}
