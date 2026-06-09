"use client";

import { useState } from "react";
import {
  Send,
  CheckCircle2,
  Pencil,
  Trash2,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { DetailRow, orDash } from "./DetailRow";
import { apiFetch } from "@/lib/api";
import { useI18n } from "@/i18n";
import { useAuth } from "@/lib/auth/AuthProvider";
import { fmtMoney, fmtDate } from "@/lib/format";
import { INVOICE_STATUS_TONE } from "@/lib/types";
import type { Invoice, InvoiceStatus } from "@/lib/types";
import { INVOICE_LABEL, INVOICE_STATUS_LABEL } from "./invoiceLabels";

export function InvoiceDrawer({
  invoice,
  onClose,
  onEdit,
}: {
  /** The selected invoice, or null when the drawer is closed. */
  invoice: Invoice | null;
  onClose: () => void;
  onEdit: (inv: Invoice) => void;
}) {
  const { dict: d, locale, L } = useI18n();
  const { role } = useAuth();
  const [busy, setBusy] = useState<null | "sent" | "paid" | "delete">(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isAdmin = role === "admin";

  async function update(
    inv: Invoice,
    kind: "sent" | "paid",
    data: Record<string, unknown>,
  ) {
    setBusy(kind);
    try {
      await apiFetch("/api/crm", {
        body: { entity: "invoices", op: "update", id: inv.id, data },
      });
      toast.success(d.common.saved);
      onClose();
    } catch {
      toast.error(d.common.error);
    } finally {
      setBusy(null);
    }
  }

  async function remove(inv: Invoice) {
    setBusy("delete");
    try {
      await apiFetch("/api/crm", {
        body: { entity: "invoices", op: "delete", id: inv.id },
      });
      toast.success(d.common.saved);
      setConfirmDelete(false);
      onClose();
    } catch {
      toast.error(d.common.error);
    } finally {
      setBusy(null);
    }
  }

  const inv = invoice;
  const canSend = inv && (inv.status === "draft" || inv.status === "overdue");
  const canPay = inv && inv.status !== "paid" && inv.status !== "cancelled";

  return (
    <>
      <Drawer
        open={!!inv}
        onClose={onClose}
        width="34rem"
        title={
          inv ? (
            <span className="flex items-center gap-2.5">
              <span className="nums font-mono text-gold-300">{inv.number}</span>
              <Badge tone={INVOICE_STATUS_TONE[inv.status as InvoiceStatus]}>
                {L(INVOICE_STATUS_LABEL[inv.status as InvoiceStatus])}
              </Badge>
            </span>
          ) : (
            L(INVOICE_LABEL.detailsTitle)
          )
        }
      >
        {inv && (
          <div className="print-invoice space-y-5">
            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-x-5 divide-ink-700/50">
              <DetailRow label={L(INVOICE_LABEL.clientName)}>
                {orDash(inv.clientName)}
              </DetailRow>
              <DetailRow label={L(INVOICE_LABEL.projectCode)} ltr>
                {orDash(inv.projectCode)}
              </DetailRow>
              <DetailRow label={L(INVOICE_LABEL.issuedAt)}>
                {inv.issuedAt ? fmtDate(inv.issuedAt, locale) : "—"}
              </DetailRow>
              <DetailRow label={L(INVOICE_LABEL.dueAt)}>
                {inv.dueAt ? fmtDate(inv.dueAt, locale) : "—"}
              </DetailRow>
              {inv.paidAt ? (
                <DetailRow label={L(INVOICE_LABEL.paidAt)}>
                  {fmtDate(inv.paidAt, locale)}
                </DetailRow>
              ) : null}
            </div>

            {/* Items table */}
            <div className="overflow-x-auto rounded-xl border border-ink-700/70">
              <Table className="text-sm">
                <THead>
                  <TR className="hover:bg-transparent">
                    <TH className="py-2.5">{L(INVOICE_LABEL.description)}</TH>
                    <TH className="py-2.5 text-end">{L(INVOICE_LABEL.qty)}</TH>
                    <TH className="py-2.5 text-end">
                      {L(INVOICE_LABEL.unitPrice)}
                    </TH>
                    <TH className="py-2.5 text-end">
                      {L(INVOICE_LABEL.amount)}
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {inv.items?.length ? (
                    inv.items.map((it) => (
                      <TR key={it.id} className="hover:bg-transparent">
                        <TD className="py-2.5">{orDash(it.description)}</TD>
                        <TD className="nums py-2.5 text-end">{it.qty}</TD>
                        <TD className="nums py-2.5 text-end">
                          {fmtMoney(it.unitPrice, locale)}
                        </TD>
                        <TD className="nums py-2.5 text-end text-parch-50">
                          {fmtMoney(it.amount, locale)}
                        </TD>
                      </TR>
                    ))
                  ) : (
                    <TR className="hover:bg-transparent">
                      <TD
                        colSpan={4}
                        className="py-5 text-center text-ink-500"
                      >
                        {L(INVOICE_LABEL.noItems)}
                      </TD>
                    </TR>
                  )}
                </TBody>
              </Table>
            </div>

            {/* Totals */}
            <div className="ms-auto w-full max-w-xs rounded-xl border border-ink-700/70 bg-ink-850/50 p-4">
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-ink-500">{d.modules.subtotal}</dt>
                  <dd className="nums text-parch-100/90">
                    {fmtMoney(inv.subtotal, locale)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-500">
                    {d.modules.vat} ({inv.vatRate}%)
                  </dt>
                  <dd className="nums text-parch-100/90">
                    {fmtMoney(inv.vatAmount, locale)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-ink-700/70 pt-2.5">
                  <dt className="font-semibold text-parch-50">
                    {d.modules.total}
                  </dt>
                  <dd className="nums text-lg font-semibold text-gold-300">
                    {fmtMoney(inv.total, locale)}
                  </dd>
                </div>
              </dl>
            </div>

            {inv.notes ? (
              <DetailRow label={L(INVOICE_LABEL.notes)}>{inv.notes}</DetailRow>
            ) : null}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 border-t border-ink-700/70 pt-4 print:hidden">
              {canSend && (
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => update(inv, "sent", { status: "sent" })}
                  loading={busy === "sent"}
                  disabled={!!busy}
                >
                  <Send className="h-4 w-4" />
                  {L(INVOICE_LABEL.markSent)}
                </Button>
              )}
              {canPay && (
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() =>
                    update(inv, "paid", {
                      status: "paid",
                      paidAt: Date.now(),
                    })
                  }
                  loading={busy === "paid"}
                  disabled={!!busy}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {d.modules.markPaid}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(inv)}
                disabled={!!busy}
              >
                <Pencil className="h-4 w-4" />
                {d.common.edit}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.print()}
                disabled={!!busy}
              >
                <Printer className="h-4 w-4" />
                {L(INVOICE_LABEL.print)}
              </Button>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-critical hover:bg-critical/10 hover:text-critical ms-auto"
                  onClick={() => setConfirmDelete(true)}
                  disabled={!!busy}
                >
                  <Trash2 className="h-4 w-4" />
                  {d.common.delete}
                </Button>
              )}
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => inv && remove(inv)}
        title={L(INVOICE_LABEL.deleteInvoice)}
        message={L(INVOICE_LABEL.deleteConfirm)}
        confirmLabel={d.common.delete}
        danger
        loading={busy === "delete"}
      />
    </>
  );
}
