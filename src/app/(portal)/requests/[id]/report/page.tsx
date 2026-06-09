"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Printer,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useProject, useOrgSettings } from "@/lib/hooks/data";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/cn";
import { fmtMoney, fmtDate, fmtArea, fmtNumber } from "@/lib/format";
import {
  INSPECTION_CHECKLIST,
  type InspectionStatus,
  type ValuationComparable,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Brand tokens                                                       */
/* ------------------------------------------------------------------ */
const MAROON = "#7f1836";
const GOLD = "#9a7527";
const GOLD_BRIGHT = "#b48a32";
const INK = "#1a1d24";
const MUTED = "#6b7280";
const RULE = "#e7e2da";

/* ------------------------------------------------------------------ */
/*  Inspection status presentation                                     */
/* ------------------------------------------------------------------ */
const INSPECTION_STATUS: Record<
  InspectionStatus,
  { dot: string; ar: string; en: string }
> = {
  ok: { dot: "#1f9d55", ar: "جيد", en: "OK" },
  fair: { dot: "#b48a32", ar: "مقبول", en: "Fair" },
  poor: { dot: "#cf3b3b", ar: "ضعيف", en: "Poor" },
  na: { dot: "#9aa0a6", ar: "لا ينطبق", en: "N/A" },
};

/* ------------------------------------------------------------------ */
/*  Small presentational primitives                                    */
/* ------------------------------------------------------------------ */
function SectionTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-8 flex items-center gap-2.5 text-[15px] font-bold tracking-tight first:mt-0">
      <span
        className="inline-flex h-6 w-6 items-center justify-center rounded-[5px] text-[12px] font-bold text-white"
        style={{ background: MAROON }}
      >
        {n}
      </span>
      <span style={{ color: MAROON }}>{children}</span>
      <span className="ms-2 h-px flex-1" style={{ background: RULE }} />
    </h2>
  );
}

function MetaCell({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div
        className="text-[10px] font-semibold uppercase tracking-[0.08em]"
        style={{ color: MUTED }}
      >
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 truncate text-[13px] font-semibold",
          mono && "font-mono tracking-tight",
        )}
        style={{ color: INK }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

/** Definition row used in the property table. */
function DefRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr style={{ borderTop: `1px solid ${RULE}` }}>
      <th
        scope="row"
        className="w-[34%] py-2.5 pe-4 text-start align-top text-[12px] font-semibold"
        style={{ color: MUTED }}
      >
        {label}
      </th>
      <td className="py-2.5 text-start align-top text-[13px] font-medium" style={{ color: INK }}>
        {value || "—"}
      </td>
    </tr>
  );
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */
export default function ValuationReportPage() {
  const params = useParams();
  const id = (params?.id as string) ?? "";
  const { data: p, loading } = useProject(id);
  const { org } = useOrgSettings();
  const { dict: d, locale, L, isRTL } = useI18n();

  const Back = isRTL ? ChevronRight : ChevronLeft;

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8 text-gold-400" />
      </div>
    );
  }

  /* ---- Missing project ---- */
  if (!p) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <FileText className="h-10 w-10 text-ink-500" />
        <p className="text-ink-400">{d.common.noResults}</p>
        <Button href="/requests" variant="subtle" size="sm">
          {d.project.requests}
        </Button>
      </div>
    );
  }

  const v = p.valuation;

  /* ---- Derived display values ---- */
  const orgName = locale === "ar" ? org.nameAr : org.nameEn;
  const orgLegal = locale === "ar" ? org.legalNameAr : org.legalNameEn;
  const orgAddress = locale === "ar" ? org.addressAr : org.addressEn;
  const logoSrc = org.logoUrl || "/brand/logo-maroon.png";

  const sep = locale === "ar" ? "، " : ", ";
  const locationParts = [p.district, p.city, p.region, p.address].filter(Boolean);
  const locationStr = locationParts.join(sep);

  const finalValue = v?.finalValue ?? p.estimatedValue ?? null;
  const finalWords =
    finalValue != null ? amountInWords(finalValue, locale) : null;

  const comps = v?.comparables?.filter(Boolean) ?? [];
  const inspectionItems = v?.inspection?.filter(Boolean) ?? [];

  const pricePerSqm = (c: ValuationComparable): number | null =>
    c.price != null && c.area ? c.price / c.area : null;

  const avgPpsqm = (() => {
    const vals = comps.map(pricePerSqm).filter((n): n is number => n != null);
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  })();

  const approaches: { label: string; value: number | undefined }[] = [
    { label: d.methods.market, value: v?.marketValue },
    { label: d.methods.cost, value: v?.costValue },
    { label: d.methods.income, value: v?.incomeValue },
  ].filter((a) => a.value != null);

  const checklistLabel = (key: string) => {
    const item = INSPECTION_CHECKLIST.find((i) => i.key === key);
    return item ? L({ ar: item.ar, en: item.en }) : key;
  };

  /* ================================================================ */
  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      {/* Print isolation: only the .report-print sheet prints. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `@media print { body * { visibility: hidden !important; } .report-print, .report-print * { visibility: visible !important; } .report-print { position: absolute; inset: 0; margin: 0; box-shadow: none; } @page { size: A4; margin: 14mm; } }`,
        }}
      />

      {/* ---- Action bar (screen only) ---- */}
      <div className="mb-6 flex items-center justify-between gap-3 print:hidden">
        <Link
          href={`/requests/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-ink-400 transition-colors hover:text-gold-300"
        >
          <Back className="h-4 w-4" />
          {L({ ar: "العودة إلى الطلب", en: "Back to request" })}
        </Link>
        <Button onClick={() => window.print()} variant="gold" size="sm">
          <Printer className="h-4 w-4" />
          {L({ ar: "طباعة / حفظ PDF", en: "Print / Save as PDF" })}
        </Button>
      </div>

      {/* ============================================================ */}
      {/*  THE REPORT SHEET (white A4)                                  */}
      {/* ============================================================ */}
      <article
        className="report-print mx-auto w-full max-w-[820px] rounded-[10px] bg-white px-8 py-10 text-[#1a1d24] shadow-[0_24px_80px_-32px_rgba(0,0,0,0.7)] sm:px-12 sm:py-12 print:max-w-none print:rounded-none print:px-0 print:py-0 print:shadow-none"
        style={{ fontFeatureSettings: '"tnum" 1' }}
      >
        {/* ---------------- Letterhead ---------------- */}
        <header className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt={orgName ?? "logo"}
              className="h-14 w-14 shrink-0 object-contain"
            />
            <div className="min-w-0">
              <div className="text-[18px] font-extrabold leading-tight tracking-tight" style={{ color: MAROON }}>
                {orgName}
              </div>
              {orgLegal && (
                <div className="text-[11px] font-medium" style={{ color: MUTED }}>
                  {orgLegal}
                </div>
              )}
              {org.tagline && (
                <div className="mt-0.5 text-[11px] italic" style={{ color: GOLD }}>
                  {org.tagline}
                </div>
              )}
              {org.licenseNo && (
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide" style={{ color: MUTED }}>
                  {L({ ar: "ترخيص رقم", en: "License No." })} {org.licenseNo}
                </div>
              )}
            </div>
          </div>

          {/* Contact column */}
          <div className="shrink-0 space-y-1 text-end text-[11px]" style={{ color: INK }}>
            {org.phone && (
              <div className="flex items-center justify-end gap-1.5">
                <span dir="ltr">{org.phone}</span>
                <Phone className="h-3 w-3" style={{ color: GOLD }} />
              </div>
            )}
            {org.email && (
              <div className="flex items-center justify-end gap-1.5">
                <span dir="ltr">{org.email}</span>
                <Mail className="h-3 w-3" style={{ color: GOLD }} />
              </div>
            )}
            {org.website && (
              <div className="flex items-center justify-end gap-1.5">
                <span dir="ltr">{org.website}</span>
                <Globe className="h-3 w-3" style={{ color: GOLD }} />
              </div>
            )}
            {orgAddress && (
              <div className="flex max-w-[200px] items-start justify-end gap-1.5" style={{ color: MUTED }}>
                <span>{orgAddress}</span>
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" style={{ color: GOLD }} />
              </div>
            )}
          </div>
        </header>

        {/* Gold rule */}
        <div
          className="mt-5 h-[3px] w-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${MAROON}, ${GOLD_BRIGHT} 55%, ${GOLD})` }}
        />

        {/* ---------------- Title block ---------------- */}
        <section className="mt-7">
          <div className="text-center">
            <h1 className="text-[24px] font-black leading-tight tracking-tight" style={{ color: INK }}>
              {L({ ar: "تقرير تقييم عقاري", en: "Real Estate Valuation Report" })}
            </h1>
            <p className="mt-1 text-[12px] font-medium" style={{ color: GOLD }}>
              {L({ ar: "Real Estate Valuation Report", en: "تقرير تقييم عقاري" })}
            </p>
          </div>

          {/* Meta grid */}
          <div
            className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 rounded-lg px-5 py-4 sm:grid-cols-3"
            style={{ background: "#faf8f4", border: `1px solid ${RULE}` }}
          >
            <MetaCell label={L({ ar: "المرجع", en: "Reference" })} value={p.code} mono />
            <MetaCell
              label={L({ ar: "تاريخ التقرير", en: "Report date" })}
              value={fmtDate(Date.now(), locale)}
            />
            <MetaCell
              label={L({ ar: "أعدّ بواسطة", en: "Prepared by" })}
              value={p.assignedToName}
            />
            <MetaCell label={d.project.client} value={p.clientName} />
            <MetaCell
              label={d.project.purpose}
              value={d.purposes[p.purpose] ?? p.purpose}
            />
            <MetaCell
              label={d.common.status}
              value={d.status[p.status] ?? p.status}
            />
          </div>
        </section>

        {/* ---------------- 1. Property ---------------- */}
        <section>
          <SectionTitle n={1}>
            {L({ ar: "العقار", en: "The Property" })}
          </SectionTitle>
          <table className="w-full border-collapse">
            <tbody>
              <DefRow
                label={d.project.propertyType}
                value={d.propertyTypes[p.propertyType] ?? p.propertyType}
              />
              <DefRow
                label={d.project.purpose}
                value={d.purposes[p.purpose] ?? p.purpose}
              />
              <DefRow
                label={d.project.address}
                value={
                  locationStr ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: GOLD }} />
                      {locationStr}
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
              <DefRow
                label={d.project.area}
                value={p.area != null ? fmtArea(p.area, locale) : "—"}
              />
            </tbody>
          </table>
        </section>

        {/* ---------------- 2. Inspection ---------------- */}
        <section>
          <SectionTitle n={2}>
            {L({ ar: "المعاينة الميدانية", en: "Site Inspection" })}
          </SectionTitle>
          {inspectionItems.length > 0 ? (
            <>
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ borderBottom: `1.5px solid ${MAROON}` }}>
                    <th className="py-2 pe-3 text-start text-[11px] font-bold uppercase tracking-wide" style={{ color: MAROON }}>
                      {L({ ar: "البند", en: "Item" })}
                    </th>
                    <th className="w-[110px] py-2 pe-3 text-start text-[11px] font-bold uppercase tracking-wide" style={{ color: MAROON }}>
                      {L({ ar: "الحالة", en: "Condition" })}
                    </th>
                    <th className="py-2 text-start text-[11px] font-bold uppercase tracking-wide" style={{ color: MAROON }}>
                      {L({ ar: "ملاحظات", en: "Notes" })}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inspectionItems.map((it, i) => {
                    const meta = INSPECTION_STATUS[it.status];
                    return (
                      <tr key={`${it.key}-${i}`} style={{ borderBottom: `1px solid ${RULE}` }}>
                        <td className="py-2 pe-3 text-[12.5px] font-medium" style={{ color: INK }}>
                          {checklistLabel(it.key)}
                        </td>
                        <td className="py-2 pe-3">
                          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: INK }}>
                            <span
                              className="inline-block h-2 w-2 rounded-full"
                              style={{ background: meta.dot }}
                            />
                            {L({ ar: meta.ar, en: meta.en })}
                          </span>
                        </td>
                        <td className="py-2 text-[12px]" style={{ color: MUTED }}>
                          {it.note || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {v?.inspectionNotes && (
                <p className="mt-3 text-[12.5px] leading-relaxed" style={{ color: INK }}>
                  {v.inspectionNotes}
                </p>
              )}
              {v?.inspectedAt != null && (
                <p className="mt-2 text-[11px]" style={{ color: MUTED }}>
                  {L({ ar: "تمت المعاينة في", en: "Inspected on" })}{" "}
                  {fmtDate(v.inspectedAt, locale)}
                </p>
              )}
            </>
          ) : (
            <p className="text-[12.5px] italic" style={{ color: MUTED }}>
              {L({ ar: "لم تُسجّل معاينة.", en: "Not recorded." })}
            </p>
          )}
        </section>

        {/* ---------------- 3. Comparables ---------------- */}
        <section>
          <SectionTitle n={3}>
            {L({ ar: "الشواهد السوقية", en: "Market Evidence (Comparables)" })}
          </SectionTitle>
          {comps.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: `1.5px solid ${MAROON}` }}>
                  <th className="w-8 py-2 pe-3 text-start text-[11px] font-bold uppercase" style={{ color: MAROON }}>
                    #
                  </th>
                  <th className="py-2 pe-3 text-start text-[11px] font-bold uppercase tracking-wide" style={{ color: MAROON }}>
                    {d.project.address}
                  </th>
                  <th className="py-2 pe-3 text-end text-[11px] font-bold uppercase tracking-wide" style={{ color: MAROON }}>
                    {d.project.area}
                  </th>
                  <th className="py-2 pe-3 text-end text-[11px] font-bold uppercase tracking-wide" style={{ color: MAROON }}>
                    {L({ ar: "السعر", en: "Price" })}
                  </th>
                  <th className="py-2 text-end text-[11px] font-bold uppercase tracking-wide" style={{ color: MAROON }}>
                    {L({ ar: "السعر/م²", en: "Price / m²" })}
                  </th>
                </tr>
              </thead>
              <tbody>
                {comps.map((c, i) => {
                  const pps = pricePerSqm(c);
                  return (
                    <tr key={c.id ?? i} style={{ borderBottom: `1px solid ${RULE}` }}>
                      <td className="py-2 pe-3 text-[12px] font-semibold" style={{ color: GOLD }}>
                        {i + 1}
                      </td>
                      <td className="py-2 pe-3 text-[12.5px]" style={{ color: INK }}>
                        {c.address || "—"}
                      </td>
                      <td className="py-2 pe-3 text-end text-[12.5px] tabular-nums" style={{ color: INK }}>
                        {c.area != null ? fmtArea(c.area, locale) : "—"}
                      </td>
                      <td className="py-2 pe-3 text-end text-[12.5px] font-medium tabular-nums" style={{ color: INK }}>
                        {fmtMoney(c.price ?? null, locale)}
                      </td>
                      <td className="py-2 text-end text-[12.5px] tabular-nums" style={{ color: INK }}>
                        {pps != null ? fmtMoney(Math.round(pps), locale) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {avgPpsqm != null && (
                <tfoot>
                  <tr style={{ borderTop: `1.5px solid ${MAROON}` }}>
                    <td colSpan={4} className="py-2.5 pe-3 text-end text-[12px] font-bold" style={{ color: MAROON }}>
                      {L({ ar: "متوسط السعر / م²", en: "Average price / m²" })}
                    </td>
                    <td className="py-2.5 text-end text-[13px] font-bold tabular-nums" style={{ color: MAROON }}>
                      {fmtMoney(Math.round(avgPpsqm), locale)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          ) : (
            <p className="text-[12.5px] italic" style={{ color: MUTED }}>
              {L({ ar: "لا توجد شواهد مسجّلة.", en: "Not recorded." })}
            </p>
          )}
        </section>

        {/* ---------------- 4. Valuation approaches ---------------- */}
        <section>
          <SectionTitle n={4}>
            {L({ ar: "مناهج التقييم", en: "Valuation Approaches" })}
          </SectionTitle>
          {approaches.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {approaches.map((a) => (
                <div
                  key={a.label}
                  className="rounded-lg px-4 py-3.5"
                  style={{ background: "#faf8f4", border: `1px solid ${RULE}` }}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: MUTED }}>
                    {a.label}
                  </div>
                  <div className="mt-1 text-[16px] font-bold tabular-nums" style={{ color: INK }}>
                    {fmtMoney(a.value ?? null, locale)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12.5px] italic" style={{ color: MUTED }}>
              {L({ ar: "لم تُحتسب قيم بعد.", en: "Not recorded." })}
            </p>
          )}
        </section>

        {/* ---------------- 5. Reconciliation & Final value ---------------- */}
        <section>
          <SectionTitle n={5}>
            {L({ ar: "التسوية والقيمة النهائية", en: "Reconciliation & Final Value" })}
          </SectionTitle>

          {v?.reconciliation && (
            <p className="mb-4 text-[12.5px] leading-relaxed" style={{ color: INK }}>
              {v.reconciliation}
            </p>
          )}

          {/* Prominent final-value box */}
          <div
            className="overflow-hidden rounded-xl"
            style={{ border: `2px solid ${MAROON}` }}
          >
            <div
              className="px-5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white"
              style={{ background: MAROON }}
            >
              {L({ ar: "القيمة النهائية المعتمدة", en: "Final Assessed Value" })}
            </div>
            <div className="px-5 py-5 text-center">
              <div
                className="text-[30px] font-black leading-none tabular-nums sm:text-[36px]"
                style={{ color: MAROON }}
              >
                {fmtMoney(finalValue, locale)}
              </div>
              {finalWords && (
                <div className="mt-2 text-[12px] font-medium" style={{ color: GOLD }}>
                  {finalWords}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ---------------- Footer ---------------- */}
        <footer className="mt-10 border-t pt-5" style={{ borderColor: RULE }}>
          {org.reportNote && (
            <p className="text-[10.5px] leading-relaxed" style={{ color: MUTED }}>
              {org.reportNote}
            </p>
          )}

          {/* Signature line */}
          <div className="mt-8 flex items-end justify-between gap-8">
            <div className="w-1/2 max-w-[260px]">
              <div className="h-10" />
              <div className="border-t pt-1.5" style={{ borderColor: INK }}>
                <div className="text-[11px] font-semibold" style={{ color: INK }}>
                  {p.assignedToName ||
                    L({ ar: "المُقيّم المعتمد", en: "Accredited Valuer" })}
                </div>
                <div className="text-[10px]" style={{ color: MUTED }}>
                  {L({ ar: "توقيع المُقيّم", en: "Valuer signature" })}
                  {org.licenseNo
                    ? ` · ${L({ ar: "ترخيص", en: "License" })} ${org.licenseNo}`
                    : ""}
                </div>
              </div>
            </div>

            <div className="text-end text-[10px]" style={{ color: MUTED }}>
              <div className="font-mono">{p.code}</div>
              <div>{fmtDate(Date.now(), locale)}</div>
            </div>
          </div>

          <p className="mt-6 text-center text-[9.5px]" style={{ color: MUTED }}>
            {L({
              ar: `هذا التقرير صادر عن ${orgName ?? ""} ولا يجوز استخدامه إلا للغرض المذكور أعلاه.`,
              en: `This report is issued by ${orgName ?? ""} and may be used solely for the purpose stated above.`,
            })}
          </p>
        </footer>
      </article>
    </div>
  );
}

/* ================================================================== */
/*  Amount-in-words helper (SAR)                                       */
/* ================================================================== */
function amountInWords(n: number, locale: "ar" | "en"): string {
  const amount = Math.round(Math.abs(n));
  if (locale === "ar") {
    return `${fmtNumber(amount, "ar")} ريال سعودي فقط لا غير`;
  }
  return `${enWords(amount)} Saudi Riyals only`;
}

/** English number-to-words (handles up to billions; falls back to digits). */
function enWords(num: number): string {
  if (num === 0) return "Zero";
  if (num > 999_999_999_999) return num.toLocaleString("en-US");

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const underThousand = (x: number): string => {
    let out = "";
    if (x >= 100) {
      out += `${ones[Math.floor(x / 100)]} Hundred`;
      x %= 100;
      if (x) out += " ";
    }
    if (x >= 20) {
      out += tens[Math.floor(x / 10)];
      if (x % 10) out += `-${ones[x % 10]}`;
    } else if (x > 0) {
      out += ones[x];
    }
    return out;
  };

  const scales = [
    { v: 1_000_000_000, name: "Billion" },
    { v: 1_000_000, name: "Million" },
    { v: 1_000, name: "Thousand" },
  ];

  let remainder = num;
  const parts: string[] = [];
  for (const s of scales) {
    if (remainder >= s.v) {
      const chunk = Math.floor(remainder / s.v);
      parts.push(`${underThousand(chunk)} ${s.name}`);
      remainder %= s.v;
    }
  }
  if (remainder > 0) parts.push(underThousand(remainder));
  return parts.join(" ").trim();
}
