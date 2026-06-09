"use client";

import { useMemo, useState } from "react";
import { Users, Phone, Mail, MessageCircle, FileText } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Toolbar } from "@/components/ui/Toolbar";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import {
  TableWrap,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "@/components/ui/Table";
import { RequestRow } from "@/components/portal/RequestRow";
import { DetailRow, orDash } from "@/components/portal/crm/DetailRow";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useUsersByRole, useProjects } from "@/lib/hooks/data";
import { useI18n } from "@/i18n";
import { fmtDate } from "@/lib/format";
import { CONTACT } from "@/content/site";

/** Build a wa.me link, preferring the client's own number, falling back to the firm's. */
function whatsappHref(phone?: string): string {
  const digits = (phone ?? "").replace(/[^\d]/g, "");
  const number = digits.length >= 8 ? digits : CONTACT.whatsapp;
  return `https://wa.me/${number}`;
}

export default function ClientsPage() {
  const { dict: d, locale, L } = useI18n();
  const { role } = useAuth();
  const { data: clients, loading } = useUsersByRole("client");
  const { data: projects } = useProjects();

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Count requests per client id.
  const requestsByClient = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of projects) {
      m.set(p.clientId, (m.get(p.clientId) ?? 0) + 1);
    }
    return m;
  }, [projects]);

  // Keep the selected client live as the realtime list refreshes.
  const selected = useMemo(
    () => clients.find((c) => c.uid === selectedId) ?? null,
    [clients, selectedId],
  );

  const selectedRequests = useMemo(
    () =>
      selected ? projects.filter((p) => p.clientId === selected.uid) : [],
    [projects, selected],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone ?? "").toLowerCase().includes(q) ||
        (c.company ?? "").toLowerCase().includes(q),
    );
  }, [clients, search]);

  if (role !== "admin") {
    return (
      <EmptyState
        icon={Users}
        title={L({ ar: "غير مصرّح", en: "Not authorized" })}
        description={L({
          ar: "هذه الصفحة متاحة للمديرين فقط.",
          en: "This page is available to administrators only.",
        })}
      />
    );
  }

  return (
    <div>
      <PageHeader icon={Users} title={d.dash.clients} />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label={d.roles.clientPlural}
          value={clients.length}
          icon={Users}
          tone="gold"
        />
      </div>

      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder={d.common.search}
      />

      <div className="mt-5">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title={d.admin.noClients} />
        ) : (
          <>
            {/* Desktop / tablet table */}
            <TableWrap className="hidden md:block">
              <Table>
                <THead>
                  <TR className="hover:bg-transparent">
                    <TH>{d.profile.fullName}</TH>
                    <TH>{d.auth.email}</TH>
                    <TH>{d.auth.phone}</TH>
                    <TH>{d.profile.company}</TH>
                    <TH>{d.profile.memberSince}</TH>
                    <TH className="text-end">{d.project.requests}</TH>
                  </TR>
                </THead>
                <TBody>
                  {filtered.map((c) => {
                    const count = requestsByClient.get(c.uid) ?? 0;
                    return (
                      <TR
                        key={c.uid}
                        className="cursor-pointer"
                        onClick={() => setSelectedId(c.uid)}
                      >
                        <TD>
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={c.name}
                              src={c.photoURL}
                              size="sm"
                            />
                            <span className="font-medium text-cream-50">
                              {c.name}
                            </span>
                          </div>
                        </TD>
                        <TD>
                          <a
                            href={`mailto:${c.email}`}
                            dir="ltr"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-block text-start text-parch-100/85 transition-colors hover:text-gold-300"
                          >
                            {c.email}
                          </a>
                        </TD>
                        <TD>
                          {c.phone ? (
                            <a
                              href={`tel:${c.phone}`}
                              dir="ltr"
                              onClick={(e) => e.stopPropagation()}
                              className="nums inline-block text-start text-parch-100/85 transition-colors hover:text-gold-300"
                            >
                              {c.phone}
                            </a>
                          ) : (
                            <span className="text-ink-600">—</span>
                          )}
                        </TD>
                        <TD>
                          {c.company || <span className="text-ink-600">—</span>}
                        </TD>
                        <TD className="text-parch-100/70">
                          {fmtDate(c.createdAt, locale)}
                        </TD>
                        <TD className="text-end">
                          <span className="nums inline-flex items-center gap-1.5 text-parch-100/85">
                            <FileText className="h-3.5 w-3.5 text-gold-400" />
                            {count}
                          </span>
                        </TD>
                      </TR>
                    );
                  })}
                </TBody>
              </Table>
            </TableWrap>

            {/* Mobile cards */}
            <div className="space-y-2 md:hidden">
              {filtered.map((c) => {
                const count = requestsByClient.get(c.uid) ?? 0;
                return (
                  <button
                    key={c.uid}
                    type="button"
                    onClick={() => setSelectedId(c.uid)}
                    className="flex w-full items-center gap-3 rounded-xl border border-ink-800 bg-ink-850/40 p-3.5 text-start transition-colors hover:border-gold-500/30 hover:bg-ink-800/60"
                  >
                    <Avatar name={c.name} src={c.photoURL} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-cream-50">
                        {c.name}
                      </p>
                      <p
                        className="truncate text-xs text-ink-500"
                        dir="ltr"
                        style={{ textAlign: "start" }}
                      >
                        {c.email}
                      </p>
                    </div>
                    <span className="nums inline-flex shrink-0 items-center gap-1.5 text-xs text-ink-500">
                      <FileText className="h-3.5 w-3.5 text-gold-400" />
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Detail drawer */}
      <Drawer
        open={!!selected}
        onClose={() => setSelectedId(null)}
        width="28rem"
        title={selected?.name}
      >
        {selected && (
          <div className="flex h-full flex-col">
            {/* Identity */}
            <div className="flex items-center gap-3.5">
              <Avatar
                name={selected.name}
                src={selected.photoURL}
                size="lg"
                ring
              />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-semibold text-cream-50">
                  {selected.name}
                </h3>
                <p
                  className="truncate text-sm text-ink-500"
                  dir="ltr"
                  style={{ textAlign: "start" }}
                >
                  {selected.email}
                </p>
              </div>
            </div>

            {/* Quick contact actions */}
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
              <Button
                href={`mailto:${selected.email}`}
                variant="subtle"
                size="sm"
              >
                <Mail className="h-4 w-4" />
                {d.auth.email}
              </Button>
              <Button
                href={whatsappHref(selected.phone)}
                target="_blank"
                rel="noreferrer noopener"
                variant="subtle"
                size="sm"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            </div>

            {/* Details */}
            <div className="mt-4 divide-y divide-ink-700/50">
              <DetailRow label={d.auth.email} ltr>
                {selected.email}
              </DetailRow>
              <DetailRow label={d.auth.phone} ltr>
                {orDash(selected.phone)}
              </DetailRow>
              <DetailRow label={d.profile.company}>
                {orDash(selected.company)}
              </DetailRow>
              <DetailRow label={d.profile.memberSince}>
                {fmtDate(selected.createdAt, locale)}
              </DetailRow>
            </div>

            {/* Client's requests */}
            <div className="mt-6">
              <div className="mb-2.5 flex items-center gap-2">
                <FileText className="h-4 w-4 text-gold-400" />
                <h4 className="text-sm font-semibold text-cream-100">
                  {d.project.requests}
                </h4>
                <span className="nums text-xs text-ink-500">
                  ({selectedRequests.length})
                </span>
              </div>
              {selectedRequests.length === 0 ? (
                <p className="rounded-xl border border-dashed border-ink-800 bg-ink-850/40 px-4 py-6 text-center text-sm text-ink-500">
                  {d.project.noProjects}
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedRequests.map((p) => (
                    <RequestRow key={p.id} p={p} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
