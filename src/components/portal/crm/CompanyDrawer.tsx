"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  Pencil,
  Trash2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Clock,
} from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useI18n } from "@/i18n";
import { useAuth } from "@/lib/auth/AuthProvider";
import { apiFetch } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import type { Company } from "@/lib/types";
import { COMPANY_TYPE_LABEL } from "./dealEnums";
import { COMPANY_TYPE_TONE, websiteHref, websiteLabel } from "./company-helpers";

function Row({
  icon: Icon,
  label,
  children,
  ltr,
}: {
  icon: typeof Globe;
  label: string;
  children: React.ReactNode;
  ltr?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-800 text-gold-400">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.7rem] font-medium uppercase tracking-wide text-ink-500">
          {label}
        </p>
        <div
          className="mt-0.5 truncate text-sm text-parch-50"
          dir={ltr ? "ltr" : undefined}
          style={ltr ? { textAlign: "start" } : undefined}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function CompanyDrawer({
  company,
  onClose,
  onEdit,
}: {
  /** Open when a company is provided; closed when null. */
  company: Company | null;
  onClose: () => void;
  onEdit: (c: Company) => void;
}) {
  const { dict: d, locale, L } = useI18n();
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const c = company;

  const handleDelete = async () => {
    if (!c) return;
    setDeleting(true);
    try {
      await apiFetch("/api/crm", {
        body: { entity: "companies", op: "delete", id: c.id },
      });
      toast.success(d.common.success);
      setConfirmOpen(false);
      onClose();
    } catch {
      toast.error(d.common.error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Drawer
        open={!!c}
        onClose={onClose}
        width="26rem"
        title={d.common.details}
      >
        {c && (
          <div className="flex h-full flex-col">
            {/* Identity */}
            <div className="flex items-start gap-3.5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-maroon-600/15 text-gold-400 ring-1 ring-maroon-600/30">
                <Building2 className="h-5.5 w-5.5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-semibold text-cream-50">
                  {c.name}
                </h3>
                <div className="mt-1.5">
                  <Badge tone={COMPANY_TYPE_TONE[c.type]}>
                    {L(COMPANY_TYPE_LABEL[c.type])}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Detail rows */}
            <div className="mt-5 divide-y divide-ink-800/70 border-y border-ink-800/70">
              {c.sector && (
                <Row icon={Briefcase} label={L({ ar: "القطاع", en: "Sector" })}>
                  {c.sector}
                </Row>
              )}
              {c.city && (
                <Row icon={MapPin} label={L({ ar: "المدينة", en: "City" })}>
                  {c.city}
                </Row>
              )}
              {c.phone && (
                <Row icon={Phone} label={L({ ar: "الهاتف", en: "Phone" })} ltr>
                  <a
                    href={`tel:${c.phone}`}
                    className="nums text-parch-50 transition-colors hover:text-gold-300"
                  >
                    {c.phone}
                  </a>
                </Row>
              )}
              {c.email && (
                <Row icon={Mail} label={L({ ar: "البريد الإلكتروني", en: "Email" })} ltr>
                  <a
                    href={`mailto:${c.email}`}
                    className="text-parch-50 transition-colors hover:text-gold-300"
                  >
                    {c.email}
                  </a>
                </Row>
              )}
              {c.website && (
                <Row icon={Globe} label={L({ ar: "الموقع الإلكتروني", en: "Website" })} ltr>
                  <a
                    href={websiteHref(c.website)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-gold-300 underline-offset-2 transition-colors hover:text-gold-200 hover:underline"
                  >
                    {websiteLabel(c.website)}
                  </a>
                </Row>
              )}
              <Row icon={Clock} label={L({ ar: "آخر تحديث", en: "Updated" })}>
                {timeAgo(c.updatedAt, locale)}
              </Row>
            </div>

            {c.notes && (
              <div className="mt-5">
                <p className="mb-1.5 text-[0.7rem] font-medium uppercase tracking-wide text-ink-500">
                  {L({ ar: "ملاحظات", en: "Notes" })}
                </p>
                <p className="whitespace-pre-wrap rounded-xl border border-ink-800 bg-ink-850/50 p-3.5 text-sm leading-relaxed text-parch-100/85">
                  {c.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-auto flex items-center gap-2 pt-6">
              <Button
                variant="subtle"
                size="sm"
                className="flex-1"
                onClick={() => onEdit(c)}
              >
                <Pencil className="h-4 w-4" />
                {d.common.edit}
              </Button>
              {isAdmin && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setConfirmOpen(true)}
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
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        danger
        loading={deleting}
        title={d.common.delete}
        message={L({
          ar: `سيتم حذف "${c?.name ?? ""}" نهائيًا. لا يمكن التراجع.`,
          en: `"${c?.name ?? ""}" will be permanently deleted. This cannot be undone.`,
        })}
        confirmLabel={d.common.delete}
      />
    </>
  );
}
