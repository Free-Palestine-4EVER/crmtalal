"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  FileCheck,
  FileText,
  Award,
  PenLine,
  Download,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { Toolbar } from "@/components/ui/Toolbar";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
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
import { useProjects } from "@/lib/hooks/data";
import { useI18n } from "@/i18n";
import { fmtDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { ReportType } from "@/lib/types";

/** A report lifted out of its project, carrying the project context it needs. */
type ReportRow = {
  id: string;
  name: string;
  url: string;
  path: string;
  type: ReportType;
  uploadedAt: number;
  uploadedByName: string;
  projectId: string;
  code: string;
  title: string;
  clientName: string;
};

type Filter = "all" | ReportType;

/** Bilingual labels for each report type (not in the shared dictionary). */
const TYPE_LABEL: Record<ReportType, { ar: string; en: string }> = {
  draft: { ar: "مسودة", en: "Draft" },
  final: { ar: "نهائي", en: "Final" },
  certificate: { ar: "خطاب إنجاز", en: "Certificate" },
};

const TYPE_TONE: Record<ReportType, BadgeTone> = {
  draft: "neutral",
  final: "positive",
  certificate: "gold",
};

const TYPE_ICON: Record<ReportType, typeof FileText> = {
  draft: PenLine,
  final: FileCheck,
  certificate: Award,
};

export default function ReportsPage() {
  const { locale, L } = useI18n();
  const { data: projects, loading } = useProjects();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  // Flatten every report across every project into one sorted list.
  const allReports = useMemo<ReportRow[]>(() => {
    const rows: ReportRow[] = [];
    for (const p of projects) {
      for (const r of p.reports ?? []) {
        rows.push({
          ...r,
          projectId: p.id,
          code: p.code,
          title: p.title,
          clientName: p.clientName,
        });
      }
    }
    return rows.sort((a, b) => b.uploadedAt - a.uploadedAt);
  }, [projects]);

  const counts = useMemo(() => {
    let final = 0;
    let certificate = 0;
    let draft = 0;
    for (const r of allReports) {
      if (r.type === "final") final += 1;
      else if (r.type === "certificate") certificate += 1;
      else if (r.type === "draft") draft += 1;
    }
    return { total: allReports.length, final, certificate, draft };
  }, [allReports]);

  const filtered = useMemo(() => {
    let list = allReports;
    if (filter !== "all") list = list.filter((r) => r.type === filter);
    const q = search.trim().toLowerCase();
    if (q)
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.clientName.toLowerCase().includes(q),
      );
    return list;
  }, [allReports, filter, search]);

  const typeOptions = [
    { value: "all" as const, label: L({ ar: "الكل", en: "All" }), count: counts.total },
    { value: "draft" as const, label: L(TYPE_LABEL.draft), count: counts.draft },
    { value: "final" as const, label: L(TYPE_LABEL.final), count: counts.final },
    {
      value: "certificate" as const,
      label: L(TYPE_LABEL.certificate),
      count: counts.certificate,
    },
  ];

  return (
    <div>
      <PageHeader
        icon={FileCheck}
        title={L({ ar: "مكتبة التقارير", en: "Reports library" })}
        subtitle={L({
          ar: "كل تقارير وخطابات التقييم عبر المشاريع في مكان واحد.",
          en: "Every valuation report and certificate across all projects, in one place.",
        })}
      />

      <div className="mb-5 grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label={L({ ar: "إجمالي التقارير", en: "Total reports" })}
          value={counts.total}
          icon={FileText}
          tone="neutral"
        />
        <StatCard
          label={L({ ar: "تقارير نهائية", en: "Final reports" })}
          value={counts.final}
          icon={FileCheck}
          tone="positive"
        />
        <StatCard
          label={L({ ar: "خطابات الإنجاز", en: "Certificates" })}
          value={counts.certificate}
          icon={Award}
          tone="gold"
        />
      </div>

      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder={L({
          ar: "ابحث بالتقرير أو رمز المشروع أو العميل",
          en: "Search by report, project code, or client",
        })}
      >
        <SegmentedControl
          value={filter}
          onChange={(v) => setFilter(v as Filter)}
          options={typeOptions}
        />
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
            icon={FileCheck}
            title={L({ ar: "لا توجد تقارير بعد", en: "No reports yet" })}
            description={
              allReports.length > 0
                ? L({
                    ar: "لا توجد نتائج مطابقة لبحثك أو التصفية الحالية.",
                    en: "No reports match your search or current filter.",
                  })
                : L({
                    ar: "ستظهر التقارير والخطابات هنا بمجرد رفعها على المشاريع.",
                    en: "Reports and certificates will appear here once uploaded to projects.",
                  })
            }
          />
        ) : (
          <>
            {/* Desktop / tablet table */}
            <TableWrap className="hidden md:block">
              <Table>
                <THead>
                  <TR className="hover:bg-transparent">
                    <TH>{L({ ar: "التقرير", en: "Report" })}</TH>
                    <TH>{L({ ar: "النوع", en: "Type" })}</TH>
                    <TH>{L({ ar: "المشروع", en: "Project" })}</TH>
                    <TH>{L({ ar: "العميل", en: "Client" })}</TH>
                    <TH>{L({ ar: "رفعه", en: "Uploaded by" })}</TH>
                    <TH>{L({ ar: "التاريخ", en: "Date" })}</TH>
                    <TH className="text-end">{L({ ar: "تنزيل", en: "Download" })}</TH>
                  </TR>
                </THead>
                <TBody>
                  {filtered.map((r) => {
                    const Icon = TYPE_ICON[r.type];
                    return (
                      <TR key={`${r.projectId}-${r.id}`}>
                        <TD>
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                                r.type === "certificate"
                                  ? "bg-gold-500/12 text-gold-300"
                                  : r.type === "final"
                                    ? "bg-positive/12 text-positive"
                                    : "bg-ink-800 text-ink-400",
                              )}
                            >
                              <Icon className="h-[18px] w-[18px]" />
                            </span>
                            <span className="min-w-0 truncate font-medium text-cream-50">
                              {r.name}
                            </span>
                          </div>
                        </TD>
                        <TD>
                          <Badge tone={TYPE_TONE[r.type]}>
                            {L(TYPE_LABEL[r.type])}
                          </Badge>
                        </TD>
                        <TD>
                          <Link
                            href={`/requests/${r.projectId}`}
                            className="group inline-flex min-w-0 flex-col"
                          >
                            <span className="font-mono text-[0.7rem] text-gold-400 transition-colors group-hover:text-gold-300">
                              {r.code}
                            </span>
                            <span className="truncate text-parch-100/85 transition-colors group-hover:text-cream-50">
                              {r.title}
                            </span>
                          </Link>
                        </TD>
                        <TD className="text-parch-100/85">{r.clientName}</TD>
                        <TD className="text-parch-100/70">{r.uploadedByName}</TD>
                        <TD className="nums whitespace-nowrap text-parch-100/70">
                          {fmtDate(r.uploadedAt, locale)}
                        </TD>
                        <TD className="text-end">
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            download
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gold-400 transition-colors hover:bg-gold-500/10 hover:text-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                            aria-label={L({ ar: "تنزيل التقرير", en: "Download report" })}
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </TD>
                      </TR>
                    );
                  })}
                </TBody>
              </Table>
            </TableWrap>

            {/* Mobile cards */}
            <div className="space-y-2.5 md:hidden">
              {filtered.map((r) => {
                const Icon = TYPE_ICON[r.type];
                return (
                  <div
                    key={`${r.projectId}-${r.id}`}
                    className="rounded-xl border border-ink-800 bg-ink-850/40 p-3.5"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "grid h-10 w-10 shrink-0 place-items-center rounded-lg",
                          r.type === "certificate"
                            ? "bg-gold-500/12 text-gold-300"
                            : r.type === "final"
                              ? "bg-positive/12 text-positive"
                              : "bg-ink-800 text-ink-400",
                        )}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="min-w-0 truncate font-medium text-cream-50">
                            {r.name}
                          </p>
                          <Badge tone={TYPE_TONE[r.type]} className="shrink-0">
                            {L(TYPE_LABEL[r.type])}
                          </Badge>
                        </div>
                        <Link
                          href={`/requests/${r.projectId}`}
                          className="mt-1 inline-flex max-w-full items-center gap-1.5"
                        >
                          <span className="font-mono text-[0.7rem] text-gold-400">
                            {r.code}
                          </span>
                          <span className="truncate text-xs text-ink-500">
                            {r.title}
                          </span>
                        </Link>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-ink-800 pt-3">
                      <div className="min-w-0 text-xs text-ink-500">
                        <span className="inline-flex items-center gap-1.5">
                          <User className="h-3 w-3 shrink-0 text-ink-400" />
                          <span className="truncate">{r.uploadedByName}</span>
                        </span>
                        <span className="mx-1.5 text-ink-700">·</span>
                        <span className="nums whitespace-nowrap">
                          {fmtDate(r.uploadedAt, locale)}
                        </span>
                      </div>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        download
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gold-500/30 px-3 py-1.5 text-xs font-medium text-gold-300 transition-colors hover:bg-gold-500/10 hover:text-gold-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {L({ ar: "تنزيل", en: "Download" })}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
