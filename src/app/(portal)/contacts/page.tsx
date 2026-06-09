"use client";

import { useMemo, useState } from "react";
import { Users, Plus, Pencil, Trash2, Phone, Mail, Building2 } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Toolbar } from "@/components/ui/Toolbar";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Drawer } from "@/components/ui/Drawer";
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
import { ContactFormModal } from "@/components/portal/crm/ContactFormModal";
import { DetailRow, orDash } from "@/components/portal/crm/DetailRow";
import {
  CONTACT_TYPE_LABEL,
  CONTACT_TYPE_TONE,
  FIELD_LABEL,
} from "@/components/portal/crm/labels";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useContacts } from "@/lib/hooks/data";
import { apiFetch } from "@/lib/api";
import { useI18n } from "@/i18n";
import { fmtDate } from "@/lib/format";
import { toast } from "sonner";
import { CONTACT_TYPES, type Contact, type ContactType } from "@/lib/types";

type TypeFilter = ContactType | "all";

export default function ContactsPage() {
  const { dict: d, locale, L } = useI18n();
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const { data: contacts, loading } = useContacts();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TypeFilter>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Contact | null>(null);
  const [busy, setBusy] = useState(false);

  const selected = useMemo(
    () => contacts.find((c) => c.id === selectedId) ?? null,
    [contacts, selectedId],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: contacts.length };
    for (const t of CONTACT_TYPES) c[t] = 0;
    for (const ct of contacts) c[ct.type] = (c[ct.type] ?? 0) + 1;
    return c;
  }, [contacts]);

  const filtered = useMemo(() => {
    let list = contacts;
    if (filter !== "all") list = list.filter((c) => c.type === filter);
    const q = search.trim().toLowerCase();
    if (q)
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.company ?? "").toLowerCase().includes(q) ||
          (c.email ?? "").toLowerCase().includes(q) ||
          (c.phone ?? "").toLowerCase().includes(q) ||
          (c.title ?? "").toLowerCase().includes(q),
      );
    return list;
  }, [contacts, filter, search]);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(contact: Contact) {
    setEditing(contact);
    setFormOpen(true);
  }

  async function doDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await apiFetch("/api/crm", {
        body: { entity: "contacts", op: "delete", id: deleting.id },
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

  const typeOptions = [
    { value: "all" as const, label: d.common.all, count: counts.all },
    ...CONTACT_TYPES.map((t) => ({
      value: t,
      label: L(CONTACT_TYPE_LABEL[t]),
      count: counts[t] ?? 0,
    })),
  ];

  return (
    <div>
      <PageHeader
        icon={Users}
        title={d.modules.contacts}
        actions={
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            {d.modules.addContact}
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
          onChange={(v) => setFilter(v as TypeFilter)}
          options={typeOptions}
          className="max-w-full overflow-x-auto"
        />
      </Toolbar>

      <div className="mt-5">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[64px] w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={d.modules.noContacts}
            action={
              <Button size="sm" onClick={openAdd}>
                <Plus className="h-4 w-4" />
                {d.modules.addContact}
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
                      <TH>{L(FIELD_LABEL.company)}</TH>
                      <TH>{L(FIELD_LABEL.email)}</TH>
                      <TH>{L(FIELD_LABEL.phone)}</TH>
                      <TH className="text-end">{L(FIELD_LABEL.type)}</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {filtered.map((contact) => (
                      <TR
                        key={contact.id}
                        onClick={() => setSelectedId(contact.id)}
                        className="cursor-pointer"
                      >
                        <TD>
                          <div className="flex items-center gap-3">
                            <Avatar name={contact.name} size="sm" />
                            <div className="min-w-0">
                              <div className="truncate font-medium text-cream-50">
                                {contact.name}
                              </div>
                              {contact.title && (
                                <div className="truncate text-xs text-ink-500">
                                  {contact.title}
                                </div>
                              )}
                            </div>
                          </div>
                        </TD>
                        <TD className="text-parch-100/80">
                          {orDash(contact.company)}
                        </TD>
                        <TD>
                          {contact.email ? (
                            <span dir="ltr" style={{ textAlign: "start" }}>
                              {contact.email}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TD>
                        <TD>
                          {contact.phone ? (
                            <span
                              dir="ltr"
                              className="nums"
                              style={{ textAlign: "start" }}
                            >
                              {contact.phone}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TD>
                        <TD className="text-end">
                          <Badge tone={CONTACT_TYPE_TONE[contact.type]}>
                            {L(CONTACT_TYPE_LABEL[contact.type])}
                          </Badge>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </TableWrap>
            </div>

            {/* Cards on small screens */}
            <div className="space-y-2 md:hidden">
              {filtered.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => setSelectedId(contact.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-ink-800 bg-ink-850/40 p-4 text-start transition-colors hover:border-gold-500/30 hover:bg-ink-800/60"
                >
                  <Avatar name={contact.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-cream-50">
                      {contact.name}
                    </div>
                    <div className="truncate text-xs text-ink-500">
                      {[contact.title, contact.company]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </div>
                  </div>
                  <Badge tone={CONTACT_TYPE_TONE[contact.type]}>
                    {L(CONTACT_TYPE_LABEL[contact.type])}
                  </Badge>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add / edit form */}
      <ContactFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        contact={editing}
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
            <div className="flex items-center gap-3.5">
              <Avatar name={selected.name} size="lg" ring />
              <div className="min-w-0">
                <div className="truncate text-base font-semibold text-cream-50">
                  {selected.name}
                </div>
                {selected.title && (
                  <div className="truncate text-sm text-ink-500">
                    {selected.title}
                  </div>
                )}
                <div className="mt-1.5">
                  <Badge tone={CONTACT_TYPE_TONE[selected.type]}>
                    {L(CONTACT_TYPE_LABEL[selected.type])}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick contact actions */}
            {(selected.phone || selected.email) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selected.phone && (
                  <Button
                    href={`tel:${selected.phone}`}
                    variant="subtle"
                    size="sm"
                  >
                    <Phone className="h-4 w-4" />
                    <span dir="ltr">{selected.phone}</span>
                  </Button>
                )}
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
            )}

            {/* Details */}
            <div className="mt-4 divide-y divide-ink-700/50">
              <DetailRow label={L(FIELD_LABEL.email)} ltr>
                {orDash(selected.email)}
              </DetailRow>
              <DetailRow label={L(FIELD_LABEL.phone)} ltr>
                {orDash(selected.phone)}
              </DetailRow>
              <DetailRow label={L(FIELD_LABEL.company)}>
                {selected.company ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-ink-500" />
                    {selected.company}
                  </span>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label={L(FIELD_LABEL.jobTitle)}>
                {orDash(selected.title)}
              </DetailRow>
              <DetailRow label={L(FIELD_LABEL.created)}>
                {fmtDate(selected.createdAt, locale)}
              </DetailRow>
              {selected.notes && (
                <DetailRow label={L(FIELD_LABEL.notes)}>
                  <span className="whitespace-pre-wrap">{selected.notes}</span>
                </DetailRow>
              )}
            </div>

            {/* Actions */}
            <div className="mt-auto flex gap-2 pt-6">
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
