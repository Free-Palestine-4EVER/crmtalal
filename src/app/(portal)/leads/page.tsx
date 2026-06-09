"use client";

import { useMemo, useState } from "react";
import {
  UserPlus,
  Plus,
  ChevronDown,
  Pencil,
  Trash2,
  UserCheck,
  Phone,
  Mail,
  Tag,
} from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Toolbar } from "@/components/ui/Toolbar";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Drawer } from "@/components/ui/Drawer";
import { Dropdown } from "@/components/ui/Dropdown";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  TableWrap,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "@/components/ui/Table";
import { LeadFormModal } from "@/components/portal/crm/LeadFormModal";
import { DetailRow, orDash } from "@/components/portal/crm/DetailRow";
import {
  LEAD_STATUS_LABEL,
  LEAD_SOURCE_LABEL,
  FIELD_LABEL,
} from "@/components/portal/crm/labels";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLeads } from "@/lib/hooks/data";
import { apiFetch } from "@/lib/api";
import { useI18n } from "@/i18n";
import { timeAgo, fmtDate } from "@/lib/format";
import { toast } from "sonner";
import {
  LEAD_STATUSES,
  LEAD_STATUS_TONE,
  type Lead,
  type LeadStatus,
} from "@/lib/types";

type StatusFilter = LeadStatus | "all";

export default function LeadsPage() {
  const { dict: d, locale, L, isRTL } = useI18n();
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const { data: leads, loading } = useLeads();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");

  // Modals / drawer state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Lead | null>(null);
  const [busy, setBusy] = useState(false);

  // Keep the selected lead live as the realtime list refreshes.
  const selected = useMemo(
    () => leads.find((l) => l.id === selectedId) ?? null,
    [leads, selectedId],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length };
    for (const s of LEAD_STATUSES) c[s] = 0;
    for (const l of leads) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [leads]);

  const filtered = useMemo(() => {
    let list = leads;
    if (filter !== "all") list = list.filter((l) => l.status === filter);
    const q = search.trim().toLowerCase();
    if (q)
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          (l.email ?? "").toLowerCase().includes(q) ||
          (l.region ?? "").toLowerCase().includes(q),
      );
    return list;
  }, [leads, filter, search]);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(lead: Lead) {
    setEditing(lead);
    setFormOpen(true);
  }

  async function changeStatus(lead: Lead, status: LeadStatus) {
    if (lead.status === status) return;
    try {
      await apiFetch("/api/crm", {
        body: { entity: "leads", op: "update", id: lead.id, data: { status } },
      });
      toast.success(d.common.saved);
    } catch {
      toast.error(d.common.error);
    }
  }

  async function convert(lead: Lead) {
    setBusy(true);
    try {
      // 1) Flip the lead to converted.
      await apiFetch("/api/crm", {
        body: {
          entity: "leads",
          op: "update",
          id: lead.id,
          data: { status: "converted" },
        },
      });
      // 2) Spin up a client contact from the lead's details.
      const contactData: Record<string, unknown> = {
        name: lead.name,
        phone: lead.phone,
        type: "client",
      };
      if (lead.email) contactData.email = lead.email;
      await apiFetch("/api/crm", {
        body: { entity: "contacts", op: "create", data: contactData },
      });
      toast.success(d.modules.convertLead);
    } catch {
      toast.error(d.common.error);
    } finally {
      setBusy(false);
    }
  }

  async function doDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await apiFetch("/api/crm", {
        body: { entity: "leads", op: "delete", id: deleting.id },
      });
      toast.success(d.common.saved);
      if (selectedId === deleting.id) setSelectedId(null);
      setDeleting(null);
    } catch {
      toast.error(d.common.error);
    } finally {
      setBusy(false);
    }
  }

  const statusOptions = [
    { value: "all" as const, label: d.common.all, count: counts.all },
    ...LEAD_STATUSES.map((s) => ({
      value: s,
      label: L(LEAD_STATUS_LABEL[s]),
      count: counts[s] ?? 0,
    })),
  ];

  return (
    <div>
      <PageHeader
        icon={UserPlus}
        title={d.modules.leads}
        actions={
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            {d.modules.addLead}
          </Button>
        }
      />

      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder={d.common.search}
      >
        <SegmentedControl
          value={filter}
          onChange={(v) => setFilter(v as StatusFilter)}
          options={statusOptions}
          className="max-w-full overflow-x-auto"
        />
      </Toolbar>

      {/* List */}
      <div className="mt-5">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[64px] w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title={d.modules.noLeads}
            action={
              <Button size="sm" onClick={openAdd}>
                <Plus className="h-4 w-4" />
                {d.modules.addLead}
              </Button>
            }
          />
        ) : (
          <>
            {/* Table on md+ */}
            <div className="hidden md:block">
              <TableWrap>
                <Table>
                  <THead>
                    <TR>
                      <TH>{L(FIELD_LABEL.name)}</TH>
                      <TH>{L(FIELD_LABEL.phone)}</TH>
                      <TH>{L(FIELD_LABEL.source)}</TH>
                      <TH>{d.common.status}</TH>
                      <TH>{L(FIELD_LABEL.assigned)}</TH>
                      <TH className="text-end">{L(FIELD_LABEL.created)}</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {filtered.map((lead) => (
                      <TR
                        key={lead.id}
                        onClick={() => setSelectedId(lead.id)}
                        className="cursor-pointer"
                      >
                        <TD>
                          <div className="font-medium text-cream-50">
                            {lead.name}
                          </div>
                          {lead.email && (
                            <div
                              className="truncate text-xs text-ink-500"
                              dir="ltr"
                              style={{ textAlign: "start" }}
                            >
                              {lead.email}
                            </div>
                          )}
                        </TD>
                        <TD>
                          <span dir="ltr" className="nums" style={{ textAlign: "start" }}>
                            {lead.phone}
                          </span>
                        </TD>
                        <TD>
                          <Badge tone="neutral">
                            {L(LEAD_SOURCE_LABEL[lead.source])}
                          </Badge>
                        </TD>
                        <TD>
                          <Badge tone={LEAD_STATUS_TONE[lead.status]} dot>
                            {L(LEAD_STATUS_LABEL[lead.status])}
                          </Badge>
                        </TD>
                        <TD className="text-parch-100/70">
                          {lead.assignedToName ?? L(FIELD_LABEL.unassigned)}
                        </TD>
                        <TD className="text-end text-xs text-ink-500">
                          {timeAgo(lead.createdAt, locale)}
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </TableWrap>
            </div>

            {/* Cards on small screens */}
            <div className="space-y-2 md:hidden">
              {filtered.map((lead) => (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() => setSelectedId(lead.id)}
                  className="flex w-full flex-col gap-2 rounded-xl border border-ink-800 bg-ink-850/40 p-4 text-start transition-colors hover:border-gold-500/30 hover:bg-ink-800/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium text-cream-50">
                      {lead.name}
                    </span>
                    <Badge tone={LEAD_STATUS_TONE[lead.status]} dot>
                      {L(LEAD_STATUS_LABEL[lead.status])}
                    </Badge>
                  </div>
                  <div
                    className="nums text-sm text-parch-100/80"
                    dir="ltr"
                    style={{ textAlign: "start" }}
                  >
                    {lead.phone}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink-500">
                    <Badge tone="neutral">
                      {L(LEAD_SOURCE_LABEL[lead.source])}
                    </Badge>
                    <span>·</span>
                    <span>{timeAgo(lead.createdAt, locale)}</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add / edit form */}
      <LeadFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        lead={editing}
      />

      {/* Detail drawer */}
      <Drawer
        open={!!selected}
        onClose={() => setSelectedId(null)}
        width="28rem"
        title={selected?.name}
      >
        {selected && (
          <div className="flex h-full flex-col">
            {/* Status + source chips */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={LEAD_STATUS_TONE[selected.status]} dot>
                {L(LEAD_STATUS_LABEL[selected.status])}
              </Badge>
              <Badge tone="neutral">
                <Tag className="h-3 w-3" />
                {L(LEAD_SOURCE_LABEL[selected.source])}
              </Badge>
            </div>

            {/* Quick contact actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                href={`tel:${selected.phone}`}
                variant="subtle"
                size="sm"
              >
                <Phone className="h-4 w-4" />
                <span dir="ltr">{selected.phone}</span>
              </Button>
              {selected.email && (
                <Button
                  href={`mailto:${selected.email}`}
                  variant="subtle"
                  size="sm"
                >
                  <Mail className="h-4 w-4" />
                  {L(FIELD_LABEL.email)}
                </Button>
              )}
            </div>

            {/* Details */}
            <div className="mt-4 divide-y divide-ink-700/50">
              <DetailRow label={L(FIELD_LABEL.phone)} ltr>
                {selected.phone}
              </DetailRow>
              <DetailRow label={L(FIELD_LABEL.email)} ltr>
                {orDash(selected.email)}
              </DetailRow>
              <DetailRow label={L(FIELD_LABEL.propertyType)}>
                {orDash(selected.propertyType)}
              </DetailRow>
              <DetailRow label={L(FIELD_LABEL.purpose)}>
                {orDash(selected.purpose)}
              </DetailRow>
              <DetailRow label={L(FIELD_LABEL.region)}>
                {orDash(selected.region)}
              </DetailRow>
              <DetailRow label={L(FIELD_LABEL.assigned)}>
                {selected.assignedToName ?? L(FIELD_LABEL.unassigned)}
              </DetailRow>
              <DetailRow label={L(FIELD_LABEL.created)}>
                {fmtDate(selected.createdAt, locale)}
              </DetailRow>
              {selected.message && (
                <DetailRow label={L(FIELD_LABEL.message)}>
                  <span className="whitespace-pre-wrap">{selected.message}</span>
                </DetailRow>
              )}
              {selected.note && (
                <DetailRow label={L(FIELD_LABEL.note)}>
                  <span className="whitespace-pre-wrap">{selected.note}</span>
                </DetailRow>
              )}
            </div>

            {/* Actions */}
            <div className="mt-auto space-y-2 pt-6">
              {/* Change status */}
              <Dropdown
                align={isRTL ? "end" : "start"}
                className="w-full"
                triggerClassName="w-full"
                trigger={
                  <span className="inline-flex h-11 w-full items-center justify-between gap-2 rounded-full border border-ink-700 bg-ink-750 px-5 text-sm font-medium text-parch-100 transition-colors hover:bg-ink-700">
                    <span>
                      {d.common.status}:{" "}
                      {L(LEAD_STATUS_LABEL[selected.status])}
                    </span>
                    <ChevronDown className="h-4 w-4 text-ink-500" />
                  </span>
                }
                items={LEAD_STATUSES.map((s) => ({
                  key: s,
                  label: L(LEAD_STATUS_LABEL[s]),
                  onClick: () => changeStatus(selected, s),
                }))}
              />

              {/* Convert to client */}
              {selected.status !== "converted" && (
                <Button
                  className="w-full"
                  size="md"
                  loading={busy}
                  onClick={() => convert(selected)}
                >
                  <UserCheck className="h-4 w-4" />
                  {d.modules.convertLead}
                </Button>
              )}

              <div className="flex gap-2">
                <Button
                  variant="subtle"
                  size="md"
                  className="flex-1"
                  onClick={() => openEdit(selected)}
                >
                  <Pencil className="h-4 w-4" />
                  {d.common.edit}
                </Button>
                {isAdmin && (
                  <Button
                    variant="danger"
                    size="md"
                    className="flex-1"
                    onClick={() => setDeleting(selected)}
                  >
                    <Trash2 className="h-4 w-4" />
                    {d.common.delete}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Delete confirm (admin) */}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={doDelete}
        loading={busy}
        danger
        title={d.common.delete}
        message={deleting?.name}
        confirmLabel={d.common.delete}
      />
    </div>
  );
}
