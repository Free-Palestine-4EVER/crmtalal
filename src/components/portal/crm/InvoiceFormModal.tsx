"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/form";
import { apiFetch } from "@/lib/api";
import { useI18n } from "@/i18n";
import { fmtMoney } from "@/lib/format";
import { INVOICE_STATUSES } from "@/lib/types";
import type { Invoice, InvoiceStatus } from "@/lib/types";
import { INVOICE_LABEL, INVOICE_STATUS_LABEL } from "./invoiceLabels";

/* Editable line item — qty/unitPrice held as strings so the inputs can be
   cleared while typing; coerced to numbers on submit and for live totals. */
type ItemRow = {
  id: string;
  description: string;
  qty: string;
  unitPrice: string;
};

function newRow(): ItemRow {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `it-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    description: "",
    qty: "1",
    unitPrice: "",
  };
}

const num = (s: string) => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

/** Convert a yyyy-mm-dd date input value to ms (local midnight), or 0. */
function dateToMs(v: string): number {
  if (!v) return 0;
  const t = new Date(`${v}T00:00:00`).getTime();
  return Number.isFinite(t) ? t : 0;
}
/** Convert ms back to a yyyy-mm-dd value for a date input. */
function msToDate(ms?: number): string {
  if (!ms) return "";
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

type FormState = {
  clientName: string;
  projectCode: string;
  issuedAt: string;
  dueAt: string;
  status: InvoiceStatus;
  vatRate: string;
  notes: string;
};

function emptyForm(): FormState {
  return {
    clientName: "",
    projectCode: "",
    issuedAt: msToDate(Date.now()),
    dueAt: "",
    status: "draft",
    vatRate: "15",
    notes: "",
  };
}

export function InvoiceFormModal({
  open,
  onClose,
  invoice,
}: {
  open: boolean;
  onClose: () => void;
  /** Pass to edit an existing invoice; omit to create. */
  invoice?: Invoice | null;
}) {
  const { dict: d, locale, L } = useI18n();
  const editing = !!invoice;
  const [form, setForm] = useState<FormState>(emptyForm);
  const [items, setItems] = useState<ItemRow[]>([newRow()]);
  const [saving, setSaving] = useState(false);
  const [clientErr, setClientErr] = useState(false);

  // Reset whenever the modal (re)opens or the target invoice changes.
  useEffect(() => {
    if (!open) return;
    if (invoice) {
      setForm({
        clientName: invoice.clientName ?? "",
        projectCode: invoice.projectCode ?? "",
        issuedAt: msToDate(invoice.issuedAt),
        dueAt: msToDate(invoice.dueAt),
        status: invoice.status ?? "draft",
        vatRate: String(invoice.vatRate ?? 15),
        notes: invoice.notes ?? "",
      });
      setItems(
        invoice.items?.length
          ? invoice.items.map((it) => ({
              id: it.id || newRow().id,
              description: it.description ?? "",
              qty: String(it.qty ?? 1),
              unitPrice: String(it.unitPrice ?? 0),
            }))
          : [newRow()],
      );
    } else {
      setForm(emptyForm());
      setItems([newRow()]);
    }
    setClientErr(false);
  }, [open, invoice]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setItem = (id: string, patch: Partial<ItemRow>) =>
    setItems((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const addItem = () => setItems((rows) => [...rows, newRow()]);
  const removeItem = (id: string) =>
    setItems((rows) => (rows.length > 1 ? rows.filter((r) => r.id !== id) : rows));

  // Live totals.
  const { subtotal, vatAmount, total } = useMemo(() => {
    const sub = items.reduce((s, r) => s + num(r.qty) * num(r.unitPrice), 0);
    const rate = num(form.vatRate);
    const vat = (sub * rate) / 100;
    return { subtotal: sub, vatAmount: vat, total: sub + vat };
  }, [items, form.vatRate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientName.trim()) {
      setClientErr(true);
      return;
    }
    setSaving(true);
    try {
      const lineItems = items
        .filter((r) => r.description.trim() || num(r.unitPrice) > 0)
        .map((r) => {
          const qty = num(r.qty);
          const unitPrice = num(r.unitPrice);
          return {
            id: r.id,
            description: r.description.trim(),
            qty,
            unitPrice,
            amount: qty * unitPrice,
          };
        });

      const data: Record<string, unknown> = {
        clientName: form.clientName.trim(),
        items: lineItems,
        subtotal,
        vatRate: num(form.vatRate),
        vatAmount,
        total,
        currency: "SAR",
        status: form.status,
      };
      if (form.projectCode.trim()) data.projectCode = form.projectCode.trim();
      if (form.notes.trim()) data.notes = form.notes.trim();
      const issued = dateToMs(form.issuedAt);
      const due = dateToMs(form.dueAt);
      if (issued) data.issuedAt = issued;
      if (due) data.dueAt = due;

      if (editing && invoice) {
        await apiFetch("/api/crm", {
          body: { entity: "invoices", op: "update", id: invoice.id, data },
        });
      } else {
        await apiFetch("/api/crm", {
          body: { entity: "invoices", op: "create", data },
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
      title={editing ? d.common.edit : d.modules.addInvoice}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            {d.common.cancel}
          </Button>
          <Button type="submit" form="invoice-form" size="sm" loading={saving}>
            {editing ? d.common.save : d.common.create}
          </Button>
        </>
      }
    >
      <form
        id="invoice-form"
        onSubmit={submit}
        className="max-h-[68vh] space-y-5 overflow-y-auto pe-1"
      >
        {/* Header fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={L(INVOICE_LABEL.clientName)}
            required
            error={clientErr ? d.common.required : undefined}
            className="sm:col-span-2"
          >
            <Input
              value={form.clientName}
              onChange={(e) => {
                set("clientName", e.target.value);
                if (clientErr) setClientErr(false);
              }}
              autoFocus
            />
          </Field>

          <Field label={L(INVOICE_LABEL.projectCode)}>
            <Input
              dir="ltr"
              value={form.projectCode}
              onChange={(e) => set("projectCode", e.target.value)}
              placeholder="EV-2026-0001"
              style={{ textAlign: "start" }}
            />
          </Field>

          <Field label={L(INVOICE_LABEL.status)}>
            <Select
              value={form.status}
              onChange={(e) => set("status", e.target.value as InvoiceStatus)}
            >
              {INVOICE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {L(INVOICE_STATUS_LABEL[s])}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={L(INVOICE_LABEL.issuedAt)}>
            <Input
              type="date"
              value={form.issuedAt}
              onChange={(e) => set("issuedAt", e.target.value)}
            />
          </Field>

          <Field label={L(INVOICE_LABEL.dueAt)}>
            <Input
              type="date"
              value={form.dueAt}
              onChange={(e) => set("dueAt", e.target.value)}
            />
          </Field>
        </div>

        {/* Line items */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-parch-50">
              {L(INVOICE_LABEL.items)}
            </span>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/40 px-3 py-1 text-xs font-medium text-gold-300 transition-colors hover:bg-gold-500/10"
            >
              <Plus className="h-3.5 w-3.5" />
              {L(INVOICE_LABEL.addItem)}
            </button>
          </div>

          <div className="space-y-2">
            {items.map((row) => {
              const lineAmount = num(row.qty) * num(row.unitPrice);
              return (
                <div
                  key={row.id}
                  className="grid grid-cols-[1fr_auto] items-end gap-2 rounded-xl border border-ink-700/70 bg-ink-850/40 p-2.5 sm:grid-cols-[1fr_5rem_7rem_7rem_auto]"
                >
                  {/* Description */}
                  <div className="col-span-2 flex flex-col gap-1 sm:col-span-1">
                    <label className="text-[0.7rem] font-medium text-ink-500 sm:hidden">
                      {L(INVOICE_LABEL.description)}
                    </label>
                    <Input
                      className="h-10"
                      value={row.description}
                      placeholder={L(INVOICE_LABEL.description)}
                      onChange={(e) =>
                        setItem(row.id, { description: e.target.value })
                      }
                    />
                  </div>

                  {/* Qty */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[0.7rem] font-medium text-ink-500 sm:hidden">
                      {L(INVOICE_LABEL.qty)}
                    </label>
                    <Input
                      className="nums h-10 text-end"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="any"
                      value={row.qty}
                      onChange={(e) => setItem(row.id, { qty: e.target.value })}
                    />
                  </div>

                  {/* Unit price */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[0.7rem] font-medium text-ink-500 sm:hidden">
                      {L(INVOICE_LABEL.unitPrice)}
                    </label>
                    <Input
                      className="nums h-10 text-end"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="any"
                      value={row.unitPrice}
                      placeholder="0"
                      onChange={(e) =>
                        setItem(row.id, { unitPrice: e.target.value })
                      }
                    />
                  </div>

                  {/* Amount (computed) */}
                  <div className="hidden flex-col gap-1 sm:flex">
                    <span className="nums h-10 truncate rounded-xl bg-ink-800/60 px-3 text-end text-sm leading-10 text-parch-100/90">
                      {fmtMoney(lineAmount, locale)}
                    </span>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeItem(row.id)}
                    disabled={items.length <= 1}
                    aria-label={d.common.remove}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-ink-500 transition-colors hover:bg-critical/10 hover:text-critical disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Totals + VAT */}
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
          <Field label={L(INVOICE_LABEL.vatRate)} className="sm:max-w-[10rem]">
            <Input
              className="nums"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={form.vatRate}
              onChange={(e) => set("vatRate", e.target.value)}
            />
          </Field>

          <div className="rounded-xl border border-ink-700/70 bg-ink-850/50 p-4 sm:min-w-[16rem]">
            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink-500">{d.modules.subtotal}</dt>
                <dd className="nums text-parch-100/90">
                  {fmtMoney(subtotal, locale)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-500">
                  {d.modules.vat} ({num(form.vatRate)}%)
                </dt>
                <dd className="nums text-parch-100/90">
                  {fmtMoney(vatAmount, locale)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-ink-700/70 pt-2.5">
                <dt className="font-semibold text-parch-50">
                  {d.modules.total}
                </dt>
                <dd className="nums text-lg font-semibold text-gold-300">
                  {fmtMoney(total, locale)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <Field label={L(INVOICE_LABEL.notes)}>
          <Textarea
            className="min-h-20"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </Field>
      </form>
    </Modal>
  );
}
