"use client";

import { useMemo, useState } from "react";
import { Building2, Plus, Globe, Phone } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Toolbar } from "@/components/ui/Toolbar";
import { Select } from "@/components/ui/form";
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
import { CompanyDrawer } from "@/components/portal/crm/CompanyDrawer";
import { CompanyFormModal } from "@/components/portal/crm/CompanyFormModal";
import { COMPANY_TYPE_LABEL } from "@/components/portal/crm/dealEnums";
import {
  COMPANY_TYPE_TONE,
  websiteHref,
  websiteLabel,
} from "@/components/portal/crm/company-helpers";
import { useCompanies } from "@/lib/hooks/data";
import { useI18n } from "@/i18n";
import { COMPANY_TYPES, type Company, type CompanyType } from "@/lib/types";

type TypeFilter = CompanyType | "all";

export default function CompaniesPage() {
  const { dict: d, L } = useI18n();
  const { data: companies, loading } = useCompanies();

  const [search, setSearch] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [selected, setSelected] = useState<Company | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);

  const filtered = useMemo(() => {
    let list = companies;
    if (type !== "all") list = list.filter((c) => c.type === type);
    const q = search.trim().toLowerCase();
    if (q)
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.sector ?? "").toLowerCase().includes(q) ||
          (c.city ?? "").toLowerCase().includes(q) ||
          (c.email ?? "").toLowerCase().includes(q),
      );
    return list;
  }, [companies, type, search]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (c: Company) => {
    setSelected(null);
    setEditing(c);
    setFormOpen(true);
  };

  return (
    <div>
      <PageHeader
        icon={Building2}
        title={d.modules.companies}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {d.modules.addCompany}
          </Button>
        }
      />

      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder={d.common.search}
      >
        <Select
          value={type}
          onChange={(e) => setType(e.target.value as TypeFilter)}
          className="h-11 min-w-44"
          aria-label={d.common.filter}
        >
          <option value="all">{d.common.all}</option>
          {COMPANY_TYPES.map((t) => (
            <option key={t} value={t}>
              {L(COMPANY_TYPE_LABEL[t])}
            </option>
          ))}
        </Select>
      </Toolbar>

      <div className="mt-5">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={d.modules.noCompanies}
            description={L({
              ar: "أضف أول شركة لبدء بناء شبكة عملائك وشركائك.",
              en: "Add your first company to start building your network of clients and partners.",
            })}
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                {d.modules.addCompany}
              </Button>
            }
          />
        ) : (
          <>
            {/* Desktop / tablet table */}
            <TableWrap className="hidden sm:block">
              <Table>
                <THead>
                  <TR className="hover:bg-transparent">
                    <TH>{d.modules.companies}</TH>
                    <TH>{d.common.status}</TH>
                    <TH>{L({ ar: "القطاع", en: "Sector" })}</TH>
                    <TH>{L({ ar: "المدينة", en: "City" })}</TH>
                    <TH>{L({ ar: "الهاتف", en: "Phone" })}</TH>
                    <TH>{L({ ar: "الموقع", en: "Website" })}</TH>
                  </TR>
                </THead>
                <TBody>
                  {filtered.map((c) => (
                    <TR
                      key={c.id}
                      className="cursor-pointer"
                      onClick={() => setSelected(c)}
                    >
                      <TD>
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink-800 text-gold-400">
                            <Building2 className="h-[18px] w-[18px]" />
                          </span>
                          <span className="font-medium text-cream-50">
                            {c.name}
                          </span>
                        </div>
                      </TD>
                      <TD>
                        <Badge tone={COMPANY_TYPE_TONE[c.type]}>
                          {L(COMPANY_TYPE_LABEL[c.type])}
                        </Badge>
                      </TD>
                      <TD>{c.sector || <span className="text-ink-600">—</span>}</TD>
                      <TD>{c.city || <span className="text-ink-600">—</span>}</TD>
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
                        {c.website ? (
                          <a
                            href={websiteHref(c.website)}
                            target="_blank"
                            rel="noreferrer noopener"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex max-w-[12rem] items-center gap-1.5 truncate text-gold-300 transition-colors hover:text-gold-200"
                          >
                            <Globe className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{websiteLabel(c.website)}</span>
                          </a>
                        ) : (
                          <span className="text-ink-600">—</span>
                        )}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </TableWrap>

            {/* Mobile cards */}
            <div className="space-y-2 sm:hidden">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelected(c)}
                  className="flex w-full items-start gap-3 rounded-xl border border-ink-800 bg-ink-850/40 p-3.5 text-start transition-colors hover:border-gold-500/30 hover:bg-ink-800/60"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink-800 text-gold-400">
                    <Building2 className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-cream-50">
                        {c.name}
                      </span>
                      <Badge tone={COMPANY_TYPE_TONE[c.type]}>
                        {L(COMPANY_TYPE_LABEL[c.type])}
                      </Badge>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink-500">
                      {[c.sector, c.city].filter(Boolean).join(" · ") || "—"}
                    </p>
                    {c.phone && (
                      <p
                        dir="ltr"
                        className="nums mt-1 flex items-center gap-1.5 text-start text-xs text-ink-500"
                      >
                        <Phone className="h-3 w-3" />
                        {c.phone}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <CompanyDrawer
        company={selected}
        onClose={() => setSelected(null)}
        onEdit={openEdit}
      />

      <CompanyFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        company={editing}
      />
    </div>
  );
}
