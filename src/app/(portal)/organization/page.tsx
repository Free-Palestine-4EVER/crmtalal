"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Lock,
  Contact as ContactIcon,
  Receipt,
  FileText,
  ImageIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/portal/PageHeader";
import { FileUpload, type UploadedFile } from "@/components/portal/FileUpload";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Input, Textarea } from "@/components/ui/form";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useOrgSettings } from "@/lib/hooks/data";
import { useI18n } from "@/i18n";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { OrgSettings } from "@/lib/types";

const cardEnter = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};
const easeOut = [0.22, 1, 0.36, 1] as const;

export default function OrganizationPage() {
  const { role } = useAuth();
  const { L } = useI18n();
  const { org, loading } = useOrgSettings();

  // Admin-only guard.
  if (role !== "admin") {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <EmptyState
          icon={Lock}
          title={L({ ar: "غير مصرّح", en: "Not authorized" })}
          description={L({
            ar: "هذه الصفحة متاحة لمسؤولي النظام فقط.",
            en: "This page is available to administrators only.",
          })}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Spinner className="h-7 w-7 text-gold-500" />
      </div>
    );
  }

  // Remount the editor once the merged settings have loaded so local state
  // seeds cleanly from `org` (avoids setState-in-effect).
  return <OrgEditor key={loading ? "l" : "r"} initial={org} />;
}

/* ---------------------------------------------------------------- */
/* Editor — local form state seeded lazily from the loaded settings  */
/* ---------------------------------------------------------------- */
function OrgEditor({ initial }: { initial: OrgSettings }) {
  const { dict, locale, L } = useI18n();
  const ar = locale === "ar";

  // Strings
  const [nameEn, setNameEn] = useState(initial.nameEn ?? "");
  const [nameAr, setNameAr] = useState(initial.nameAr ?? "");
  const [legalNameEn, setLegalNameEn] = useState(initial.legalNameEn ?? "");
  const [legalNameAr, setLegalNameAr] = useState(initial.legalNameAr ?? "");
  const [tagline, setTagline] = useState(initial.tagline ?? "");
  const [licenseNo, setLicenseNo] = useState(initial.licenseNo ?? "");
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [email, setEmail] = useState(initial.email ?? "");
  const [website, setWebsite] = useState(initial.website ?? "");
  const [addressEn, setAddressEn] = useState(initial.addressEn ?? "");
  const [addressAr, setAddressAr] = useState(initial.addressAr ?? "");
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl ?? "");
  const [reportNote, setReportNote] = useState(initial.reportNote ?? "");

  // Numbers kept as strings for clean inputs; coerced on save.
  const [defaultFee, setDefaultFee] = useState(
    initial.defaultFee != null ? String(initial.defaultFee) : "",
  );
  const [vatRate, setVatRate] = useState(
    initial.vatRate != null ? String(initial.vatRate) : "15",
  );

  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await apiFetch("/api/settings", {
        body: {
          nameEn: nameEn.trim(),
          nameAr: nameAr.trim(),
          legalNameEn: legalNameEn.trim(),
          legalNameAr: legalNameAr.trim(),
          tagline: tagline.trim(),
          licenseNo: licenseNo.trim(),
          phone: phone.trim(),
          email: email.trim(),
          website: website.trim(),
          addressEn: addressEn.trim(),
          addressAr: addressAr.trim(),
          logoUrl: logoUrl.trim(),
          reportNote: reportNote.trim(),
          defaultFee: Number(defaultFee) || 0,
          vatRate: Number(vatRate) || 0,
        } satisfies OrgSettings,
      });
      toast.success(dict.common.saved);
    } catch {
      toast.error(dict.common.error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="mx-auto max-w-3xl">
      <PageHeader
        icon={Building2}
        title={L({ ar: "إعدادات المؤسسة", en: "Organization" })}
        subtitle={L({
          ar: "حرّر ملف الشركة، الرسوم، الضريبة، وهوية التقارير.",
          en: "Edit your company profile, fees, VAT and report branding.",
        })}
        actions={
          <Button type="submit" loading={saving}>
            {saving ? dict.common.saving : dict.profile.saveChanges}
          </Button>
        }
      />

      <div className="space-y-5">
        {/* 1) Company ------------------------------------------------- */}
        <Section
          delay={0}
          icon={Building2}
          title={L({ ar: "بيانات الشركة", en: "Company" })}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={L({ ar: "الاسم (عربي)", en: "Name (Arabic)" })}
              htmlFor="nameAr"
            >
              <Input
                id="nameAr"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                dir="rtl"
              />
            </Field>
            <Field
              label={L({ ar: "الاسم (إنجليزي)", en: "Name (English)" })}
              htmlFor="nameEn"
            >
              <Input
                id="nameEn"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                dir="ltr"
                className="text-start"
              />
            </Field>
            <Field
              label={L({ ar: "الاسم القانوني (عربي)", en: "Legal name (Arabic)" })}
              htmlFor="legalNameAr"
            >
              <Input
                id="legalNameAr"
                value={legalNameAr}
                onChange={(e) => setLegalNameAr(e.target.value)}
                dir="rtl"
              />
            </Field>
            <Field
              label={L({
                ar: "الاسم القانوني (إنجليزي)",
                en: "Legal name (English)",
              })}
              htmlFor="legalNameEn"
            >
              <Input
                id="legalNameEn"
                value={legalNameEn}
                onChange={(e) => setLegalNameEn(e.target.value)}
                dir="ltr"
                className="text-start"
              />
            </Field>
          </div>

          <Field
            label={L({ ar: "الشعار النصي", en: "Tagline" })}
            htmlFor="tagline"
            hint={L({
              ar: "عبارة قصيرة تظهر تحت اسم الشركة.",
              en: "A short line shown under the company name.",
            })}
          >
            <Input
              id="tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </Field>

          <Field
            label={L({ ar: "رقم ترخيص تقييم", en: "TAQEEM license #" })}
            htmlFor="licenseNo"
            hint={L({
              ar: "رقم الترخيص الصادر من الهيئة السعودية للمقيمين المعتمدين (تقييم).",
              en: "License number issued by the Saudi Authority for Accredited Valuers (TAQEEM).",
            })}
          >
            <Input
              id="licenseNo"
              value={licenseNo}
              onChange={(e) => setLicenseNo(e.target.value)}
              dir="ltr"
              className="text-start"
              inputMode="numeric"
            />
          </Field>

          {/* Logo */}
          <Field label={L({ ar: "الشعار", en: "Logo" })}>
            {logoUrl ? (
              <div className="flex items-center gap-4 rounded-xl border border-ink-700 bg-ink-850/50 p-3">
                <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-ink-700 bg-ink-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt={L({ ar: "شعار الشركة", en: "Company logo" })}
                    className="h-full w-full object-contain"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-cream-50">
                    {L({ ar: "الشعار الحالي", en: "Current logo" })}
                  </p>
                  <p className="truncate text-xs text-ink-500" dir="ltr">
                    {logoUrl}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setLogoUrl("")}
                  className="shrink-0 text-ink-500 hover:text-critical"
                >
                  <Trash2 className="h-4 w-4" />
                  {dict.common.remove}
                </Button>
              </div>
            ) : (
              <FileUpload
                pathPrefix="avatars/org"
                accept="image/*"
                value={[]}
                onChange={() => {}}
                onUploaded={(f: UploadedFile) => setLogoUrl(f.url)}
              />
            )}
          </Field>
        </Section>

        {/* 2) Contact ------------------------------------------------ */}
        <Section
          delay={0.06}
          icon={ContactIcon}
          title={L({ ar: "بيانات التواصل", en: "Contact" })}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={L({ ar: "الهاتف", en: "Phone" })} htmlFor="phone">
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                dir="ltr"
                className="text-start"
                autoComplete="tel"
              />
            </Field>
            <Field label={dict.profile.email} htmlFor="email">
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                dir="ltr"
                className="text-start"
                autoComplete="email"
              />
            </Field>
          </div>

          <Field
            label={L({ ar: "الموقع الإلكتروني", en: "Website" })}
            htmlFor="website"
          >
            <Input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              dir="ltr"
              className="text-start"
              inputMode="url"
              placeholder="edarah.sa"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={L({ ar: "العنوان (عربي)", en: "Address (Arabic)" })}
              htmlFor="addressAr"
            >
              <Input
                id="addressAr"
                value={addressAr}
                onChange={(e) => setAddressAr(e.target.value)}
                dir="rtl"
              />
            </Field>
            <Field
              label={L({ ar: "العنوان (إنجليزي)", en: "Address (English)" })}
              htmlFor="addressEn"
            >
              <Input
                id="addressEn"
                value={addressEn}
                onChange={(e) => setAddressEn(e.target.value)}
                dir="ltr"
                className="text-start"
              />
            </Field>
          </div>
        </Section>

        {/* 3) Billing ------------------------------------------------ */}
        <Section
          delay={0.12}
          icon={Receipt}
          title={L({ ar: "الرسوم والضريبة", en: "Billing" })}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={L({ ar: "الرسوم الافتراضية", en: "Default fee" })}
              htmlFor="defaultFee"
              hint={L({
                ar: "تُقترح تلقائيًا عند إنشاء فاتورة جديدة.",
                en: "Pre-filled when creating a new invoice.",
              })}
            >
              <div className="relative">
                <Input
                  id="defaultFee"
                  value={defaultFee}
                  onChange={(e) => setDefaultFee(e.target.value)}
                  type="number"
                  min={0}
                  step="any"
                  dir="ltr"
                  className="text-start pe-14"
                />
                <span className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-500">
                  {ar ? "ريال" : "SAR"}
                </span>
              </div>
            </Field>

            <Field
              label={L({ ar: "نسبة الضريبة", en: "VAT rate" })}
              htmlFor="vatRate"
              hint={L({
                ar: "ضريبة القيمة المضافة بالنسبة المئوية.",
                en: "Value-added tax as a percentage.",
              })}
            >
              <div className="relative">
                <Input
                  id="vatRate"
                  value={vatRate}
                  onChange={(e) => setVatRate(e.target.value)}
                  type="number"
                  min={0}
                  max={100}
                  step="any"
                  dir="ltr"
                  className="text-start pe-10"
                />
                <span className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-500">
                  %
                </span>
              </div>
            </Field>
          </div>
        </Section>

        {/* 4) Reports ------------------------------------------------ */}
        <Section
          delay={0.18}
          icon={FileText}
          title={L({ ar: "التقارير", en: "Reports" })}
        >
          <Field
            label={L({ ar: "ملاحظة التقرير", en: "Report note" })}
            htmlFor="reportNote"
            hint={L({
              ar: "نص الاعتماد الذي يُطبع في تذييل تقارير التقييم.",
              en: "The accreditation note printed in the footer of valuation reports.",
            })}
          >
            <Textarea
              id="reportNote"
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
              rows={4}
            />
          </Field>
        </Section>

        {/* Sticky save bar ------------------------------------------- */}
        <div className="sticky bottom-4 z-10 mt-2">
          <div className="glass flex items-center justify-between gap-4 rounded-2xl px-4 py-3 shadow-card">
            <p className="hidden text-sm text-ink-500 sm:flex sm:items-center sm:gap-2">
              <ImageIcon className="h-4 w-4 text-gold-400" />
              {L({
                ar: "تُطبَّق هذه الإعدادات على جميع التقارير والفواتير.",
                en: "These settings apply across all reports and invoices.",
              })}
            </p>
            <Button type="submit" loading={saving} className="ms-auto">
              {saving ? dict.common.saving : dict.profile.saveChanges}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

/* ---------------------------------------------------------------- */
/* Section card                                                      */
/* ---------------------------------------------------------------- */
function Section({
  icon: Icon,
  title,
  delay,
  children,
}: {
  icon: typeof Building2;
  title: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      {...cardEnter}
      transition={{ duration: 0.5, delay, ease: easeOut }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5">
            <span
              className={cn(
                "grid h-7 w-7 place-items-center rounded-lg",
                "bg-maroon-600/15 text-gold-400 ring-1 ring-maroon-600/30",
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            {title}
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">{children}</CardBody>
      </Card>
    </motion.div>
  );
}
