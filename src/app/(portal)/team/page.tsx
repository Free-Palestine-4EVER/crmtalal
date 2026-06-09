"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  UserCog,
  Plus,
  MoreHorizontal,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  UserX,
  Users,
  Shield,
} from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Toolbar } from "@/components/ui/Toolbar";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { Dropdown, type DropdownItem } from "@/components/ui/Dropdown";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, Input } from "@/components/ui/form";
import {
  TableWrap,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "@/components/ui/Table";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useUsersByRole, useProjects } from "@/lib/hooks/data";
import { apiFetch } from "@/lib/api";
import { useI18n } from "@/i18n";
import { isActive } from "@/lib/types";
import type { UserProfile } from "@/lib/types";

type UserAction = "activate" | "deactivate" | "makeAdmin" | "revokeAdmin";

/* ------------------------------------------------------------------ */
/* Add valuer modal                                                    */
/* ------------------------------------------------------------------ */
type AddForm = {
  name: string;
  email: string;
  phone: string;
  title: string;
  password: string;
};

function emptyForm(): AddForm {
  return { name: "", email: "", phone: "", title: "", password: "" };
}

function AddValuerModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { dict: d, locale } = useI18n();
  const [form, setForm] = useState<AddForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<Partial<Record<keyof AddForm, string>>>({});

  const set = <K extends keyof AddForm>(key: K, value: AddForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function close() {
    setForm(emptyForm());
    setErr({});
    onClose();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Partial<Record<keyof AddForm, string>> = {};
    if (!form.name.trim()) next.name = d.common.required;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = d.common.required;
    if (form.password.length < 8) next.password = d.auth.weakPassword;
    if (Object.keys(next).length) {
      setErr(next);
      return;
    }
    setErr({});
    setSaving(true);
    try {
      await apiFetch("/api/admin/employees", {
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim() || undefined,
          title: form.title.trim() || undefined,
          locale,
        },
      });
      toast.success(d.admin.inviteSent);
      close();
    } catch (e) {
      const msg = (e as { message?: string })?.message;
      toast.error(msg || d.common.error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      size="md"
      title={d.admin.addEmployeeTitle}
      description={d.admin.addEmployeeSubtitle}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={close} disabled={saving}>
            {d.common.cancel}
          </Button>
          <Button type="submit" form="add-valuer-form" size="sm" loading={saving}>
            {d.admin.addEmployee}
          </Button>
        </>
      }
    >
      <form
        id="add-valuer-form"
        onSubmit={submit}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field
          label={d.auth.name}
          required
          error={err.name}
          className="sm:col-span-2"
        >
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            autoFocus
          />
        </Field>

        <Field label={d.auth.email} required error={err.email}>
          <Input
            dir="ltr"
            inputMode="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            style={{ textAlign: "start" }}
          />
        </Field>

        <Field label={d.auth.phone} error={err.phone}>
          <Input
            dir="ltr"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            style={{ textAlign: "start" }}
          />
        </Field>

        <Field label={d.project.assignedTo} error={err.title}>
          <Input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder={d.roles.employee}
          />
        </Field>

        <Field
          label={d.auth.password}
          required
          error={err.password}
          hint={d.auth.weakPassword}
        >
          <Input
            type="password"
            dir="ltr"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            style={{ textAlign: "start" }}
          />
        </Field>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Team page                                                           */
/* ------------------------------------------------------------------ */
export default function TeamPage() {
  const { dict: d, L } = useI18n();
  const { role, user } = useAuth();
  const { data: employees, loading: loadingEmp } = useUsersByRole("employee");
  const { data: admins, loading: loadingAdm } = useUsersByRole("admin");
  const { data: projects } = useProjects();

  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [busyUid, setBusyUid] = useState<string | null>(null);
  // Pending destructive action awaiting confirmation.
  const [confirm, setConfirm] = useState<{
    member: UserProfile;
    action: UserAction;
  } | null>(null);

  const loading = loadingEmp || loadingAdm;

  // Combined staff list, admins first.
  const staff = useMemo(
    () => [...admins, ...employees],
    [admins, employees],
  );

  // Workload per uid: { active, done } from projects assignedTo that uid.
  const workload = useMemo(() => {
    const m = new Map<string, { active: number; done: number }>();
    for (const p of projects) {
      if (!p.assignedTo) continue;
      const w = m.get(p.assignedTo) ?? { active: 0, done: 0 };
      if (isActive(p.status)) w.active += 1;
      else if (p.status === "completed") w.done += 1;
      m.set(p.assignedTo, w);
    }
    return m;
  }, [projects]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone ?? "").toLowerCase().includes(q) ||
        (m.title ?? "").toLowerCase().includes(q),
    );
  }, [staff, search]);

  async function runAction(member: UserProfile, action: UserAction) {
    setBusyUid(member.uid);
    try {
      await apiFetch("/api/admin/users", {
        body: { uid: member.uid, action },
      });
      toast.success(d.common.saved);
    } catch (e) {
      const msg = (e as { message?: string })?.message;
      toast.error(msg || d.common.error);
    } finally {
      setBusyUid(null);
    }
  }

  /** Destructive actions go through the confirm dialog; the rest run directly. */
  function handle(member: UserProfile, action: UserAction) {
    if (action === "deactivate" || action === "revokeAdmin") {
      setConfirm({ member, action });
    } else {
      runAction(member, action);
    }
  }

  function rowActions(member: UserProfile): DropdownItem[] {
    const isSelf = member.uid === user?.uid;
    const items: DropdownItem[] = [];

    // Activate / deactivate
    if (member.active) {
      items.push({
        key: "deactivate",
        label: d.admin.deactivate,
        icon: UserX,
        danger: true,
        disabled: isSelf,
        onClick: () => handle(member, "deactivate"),
      });
    } else {
      items.push({
        key: "activate",
        label: d.admin.activate,
        icon: UserCheck,
        onClick: () => handle(member, "activate"),
      });
    }

    // Grant / revoke admin
    if (member.role === "admin") {
      items.push({
        key: "revokeAdmin",
        label: d.admin.revokeAdmin,
        icon: ShieldOff,
        danger: true,
        disabled: isSelf,
        onClick: () => handle(member, "revokeAdmin"),
      });
    } else {
      items.push({
        key: "makeAdmin",
        label: d.admin.makeAdmin,
        icon: ShieldCheck,
        onClick: () => handle(member, "makeAdmin"),
      });
    }

    return items;
  }

  if (role !== "admin") {
    return (
      <EmptyState
        icon={UserCog}
        title={L({ ar: "غير مصرّح", en: "Not authorized" })}
        description={L({
          ar: "هذه الصفحة متاحة للمديرين فقط.",
          en: "This page is available to administrators only.",
        })}
      />
    );
  }

  const confirmCopy =
    confirm?.action === "deactivate"
      ? {
          title: d.admin.deactivate,
          message: L({
            ar: `سيتم إيقاف حساب "${confirm.member.name}". لن يتمكن من تسجيل الدخول.`,
            en: `"${confirm?.member.name}" will be deactivated and won't be able to sign in.`,
          }),
          label: d.admin.deactivate,
        }
      : {
          title: d.admin.revokeAdmin,
          message: L({
            ar: `سيتم سحب صلاحية المدير من "${confirm?.member.name ?? ""}".`,
            en: `Admin access will be revoked from "${confirm?.member.name ?? ""}".`,
          }),
          label: d.admin.revokeAdmin,
        };

  return (
    <div>
      <PageHeader
        icon={UserCog}
        title={d.modules.team}
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            {d.admin.addEmployee}
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label={d.roles.employeePlural}
          value={employees.length}
          icon={Users}
          tone="gold"
        />
        <StatCard
          label={d.roles.adminPlural}
          value={admins.length}
          icon={Shield}
          tone="maroon"
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
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={UserCog}
            title={d.admin.noEmployees}
            action={
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4" />
                {d.admin.addEmployee}
              </Button>
            }
          />
        ) : (
          <>
            {/* Desktop / tablet table */}
            <TableWrap className="hidden md:block">
              <Table>
                <THead>
                  <TR className="hover:bg-transparent">
                    <TH>{d.profile.fullName}</TH>
                    <TH>{d.admin.role}</TH>
                    <TH>{d.auth.email}</TH>
                    <TH>{d.auth.phone}</TH>
                    <TH>{d.common.status}</TH>
                    <TH>{d.admin.workload}</TH>
                    <TH className="text-end">{d.common.actions}</TH>
                  </TR>
                </THead>
                <TBody>
                  {filtered.map((m) => {
                    const w = workload.get(m.uid) ?? { active: 0, done: 0 };
                    const isSelf = m.uid === user?.uid;
                    return (
                      <TR key={m.uid}>
                        <TD>
                          <div className="flex items-center gap-3">
                            <Avatar name={m.name} src={m.photoURL} size="sm" />
                            <div className="min-w-0">
                              <div className="font-medium text-cream-50">
                                {m.name}
                              </div>
                              {m.title && (
                                <div className="truncate text-xs text-ink-500">
                                  {m.title}
                                </div>
                              )}
                            </div>
                          </div>
                        </TD>
                        <TD>
                          <Badge tone={m.role === "admin" ? "gold" : "steel"}>
                            {m.role === "admin"
                              ? d.roles.admin
                              : d.roles.employee}
                          </Badge>
                        </TD>
                        <TD>
                          <a
                            href={`mailto:${m.email}`}
                            dir="ltr"
                            className="inline-block text-start text-parch-100/85 transition-colors hover:text-gold-300"
                          >
                            {m.email}
                          </a>
                        </TD>
                        <TD>
                          {m.phone ? (
                            <a
                              href={`tel:${m.phone}`}
                              dir="ltr"
                              className="nums inline-block text-start text-parch-100/85 transition-colors hover:text-gold-300"
                            >
                              {m.phone}
                            </a>
                          ) : (
                            <span className="text-ink-600">—</span>
                          )}
                        </TD>
                        <TD>
                          <Badge tone={m.active ? "positive" : "neutral"} dot>
                            {m.active ? d.admin.activate : d.admin.deactivate}
                          </Badge>
                        </TD>
                        <TD>
                          <span className="inline-flex items-center gap-2 text-xs">
                            <span className="nums inline-flex items-center gap-1 text-gold-300">
                              {w.active}
                              <span className="text-ink-500">
                                {d.kpi.active}
                              </span>
                            </span>
                            <span className="text-ink-700">·</span>
                            <span className="nums inline-flex items-center gap-1 text-positive">
                              {w.done}
                              <span className="text-ink-500">
                                {d.kpi.completed}
                              </span>
                            </span>
                          </span>
                        </TD>
                        <TD className="text-end">
                          <div className="flex justify-end">
                            <Dropdown
                              trigger={
                                <span className="grid h-9 w-9 place-items-center rounded-full text-ink-400 transition-colors hover:bg-white/5 hover:text-parch-50">
                                  {busyUid === m.uid ? (
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400" />
                                  ) : (
                                    <MoreHorizontal className="h-4.5 w-4.5" />
                                  )}
                                </span>
                              }
                              items={rowActions(m)}
                            />
                          </div>
                          {isSelf && (
                            <span className="sr-only">
                              {L({ ar: "حسابك", en: "Your account" })}
                            </span>
                          )}
                        </TD>
                      </TR>
                    );
                  })}
                </TBody>
              </Table>
            </TableWrap>

            {/* Mobile cards */}
            <div className="space-y-2 md:hidden">
              {filtered.map((m) => {
                const w = workload.get(m.uid) ?? { active: 0, done: 0 };
                return (
                  <div
                    key={m.uid}
                    className="rounded-xl border border-ink-800 bg-ink-850/40 p-3.5"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar name={m.name} src={m.photoURL} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium text-cream-50">
                            {m.name}
                          </span>
                          <Badge tone={m.role === "admin" ? "gold" : "steel"}>
                            {m.role === "admin"
                              ? d.roles.admin
                              : d.roles.employee}
                          </Badge>
                        </div>
                        <p
                          className="truncate text-xs text-ink-500"
                          dir="ltr"
                          style={{ textAlign: "start" }}
                        >
                          {m.email}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2 text-xs">
                          <Badge
                            tone={m.active ? "positive" : "neutral"}
                            dot
                          >
                            {m.active
                              ? d.admin.activate
                              : d.admin.deactivate}
                          </Badge>
                          <span className="nums text-ink-500">
                            {w.active} {d.kpi.active} · {w.done}{" "}
                            {d.kpi.completed}
                          </span>
                        </div>
                      </div>
                      <Dropdown
                        trigger={
                          <span className="grid h-9 w-9 place-items-center rounded-full text-ink-400 transition-colors hover:bg-white/5 hover:text-parch-50">
                            <MoreHorizontal className="h-4.5 w-4.5" />
                          </span>
                        }
                        items={rowActions(m)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <AddValuerModal open={addOpen} onClose={() => setAddOpen(false)} />

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm) runAction(confirm.member, confirm.action);
          setConfirm(null);
        }}
        danger
        loading={busyUid === confirm?.member.uid}
        title={confirmCopy.title}
        message={confirmCopy.message}
        confirmLabel={confirmCopy.label}
      />
    </div>
  );
}
