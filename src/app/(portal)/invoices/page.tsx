"use client";

import { useMemo, useState } from "react";
import {
  Receipt,
  Plus,
  Wallet,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Toolbar } from "@/components/ui/Toolbar";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  TableWrap,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "@/components/ui/Table";
import { InvoiceFormModal } from "@/components/portal/crm/InvoiceFormModal";
import { InvoiceDrawer } from "@/components/portal/crm/InvoiceDrawer";
import {
  INVOICE_STATUS_LABEL,
  INVOICE_LABEL,
} from "@/components/portal/crm/invoiceLabels";
import { useInvoices } from "@/lib/hooks/data";
import { useI18n } from "@/i18n";
import { fmtMoney, fmtDate } from "@/lib/format";
import { INVOICE_STATUSES, INVOICE_STATUS_TONE } from "@/lib/types";
import type { Invoice, InvoiceStatus } from "@/lib/types";

type Filter = "all" | InvoiceStatus;

export default function InvoicesPage() {
  const { dict: d, locale, L } = useI18n();
  const { data: invoices, loading } = useInvoices();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Invoice | null>(null);

  // Counts per status for the segmented control.
  const counts = useMemo(() => {
    const c = {} as Record<InvoiceStatus, number>;
    for (const s of INVOICE_STATUSES) c[s] = 0;
    for (const inv of invoices) c[inv.status] = (c[inv.status] ?? 0) + 1;
    return c;
  }, [invoices]);

  // Summary metrics across the whole set (not the active filter).
  const summary = useMemo(() => {
    let outstanding = 0;
    let paid = 0;
    let drafts = 0;
    for (const inv of invoices) {
      if (inv.status === "sent" || inv.status === "overdue")
        outstanding += inv.total || 0;
      else if (inv.status === "paid") paid += inv.total || 0;
      else if (inv.status === "draft") drafts += 1;
    }
    return { outstanding, paid, drafts };
  }, [invoices]);

  const filtered = useMemo(() => {
    let list = invoices;
    if (filter !== "all") list = list.filter((inv) => inv.status === filter);
    const q = search.trim().toLowerCase();
    if (q)
      list = list.filter(
        (inv) =>
          inv.number?.toLowerCase().includes(q) ||
          inv.clientName?.toLowerCase().includes(q),
      );
    return list;
  }, [invoices, filter, search]);

  const openCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };
  const openEdit = (inv: Invoice) => {
    setSelected(null);
    setEditTarget(inv);
    setFormOpen(true);
  };

  const filterOptions = [
    { value: "all" as const, label: d.common.all, count: invoices.length },
    ...INVOICE_STATUSES.map((s) => ({
      value: s,
      label: L(INVOICE_STATUS_LABEL[s]),
      count: counts[s],
    })),
  ];

  return (
    <div>
      <PageHeader
        icon={Receipt}
        title={d.modules.invoices}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {d.modules.addInvoice}
          </Button>
        }
      />

      {/* Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label={L(INVOICE_LABEL.outstanding)}
          value={fmtMoney(summary.outstanding, locale)}
          icon={Wallet}
          tone="maroon"
        />
        <StatCard
          label={L(INVOICE_LABEL.paidTotal)}
          value={fmtMoney(summary.paid, locale)}
          icon={CheckCircle2}
          tone="positive"
        />
        <StatCard
          label={L(INVOICE_LABEL.drafts)}
          value={summary.drafts}
          icon={FileText}
          tone="neutral"
        />
      </div>

      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder={d.common.search}
      >
        <SegmentedControl
          value={filter}
          onChange={(v) => setFilter(v as Filter)}
          options={filterOptions}
        />
      </Toolbar>

      <div className="mt-5">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={d.modules.noInvoices}
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                {d.modules.addInvoice}
              </Button>
            }
          />
        ) : (
          <TableWrap>
            <Table>
              <THead>
                <TR className="hover:bg-transparent">
                  <TH>{L(INVOICE_LABEL.number)}</TH>
                  <TH>{d.project.client}</TH>
                  <TH className="text-end">{d.modules.total}</TH>
                  <TH>{d.common.status}</TH>
                  <TH>{L(INVOICE_LABEL.issuedAt)}</TH>
                  <TH>{L(INVOICE_LABEL.dueAt)}</TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map((inv) => (
                  <TR
                    key={inv.id}
                    onClick={() => setSelected(inv)}
                    className="cursor-pointer"
                  >
                    <TD className="nums font-mono font-medium text-gold-300">
                      {inv.number}
                    </TD>
                    <TD className="text-parch-50">{inv.clientName}</TD>
                    <TD className="nums text-end font-medium text-parch-50">
                      {fmtMoney(inv.total, locale)}
                    </TD>
                    <TD>
                      <Badge tone={INVOICE_STATUS_TONE[inv.status]}>
                        {L(INVOICE_STATUS_LABEL[inv.status])}
                      </Badge>
                    </TD>
                    <TD className="whitespace-nowrap text-ink-500">
                      {inv.issuedAt ? fmtDate(inv.issuedAt, locale) : "—"}
                    </TD>
                    <TD className="whitespace-nowrap text-ink-500">
                      {inv.dueAt ? fmtDate(inv.dueAt, locale) : "—"}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableWrap>
        )}
      </div>

      <InvoiceDrawer
        invoice={selected}
        onClose={() => setSelected(null)}
        onEdit={openEdit}
      />

      <InvoiceFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        invoice={editTarget}
      />
    </div>
  );
}
