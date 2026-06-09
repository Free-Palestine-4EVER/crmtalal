"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  FileText,
  Clock,
  CheckSquare,
  FileCheck,
  ArrowRight,
  Download,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { TopoPattern } from "@/components/brand/TopoPattern";
import { StageProgress } from "@/components/portal/request/StageProgress";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { RequestRow } from "@/components/portal/RequestRow";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useI18n } from "@/i18n";
import { isActive, type Project, type ProjectStatus } from "@/lib/types";
import { fmtDate, fmtMoney } from "@/lib/format";

function nextStep(status: ProjectStatus, ar: boolean): string {
  const m: Record<ProjectStatus, [string, string]> = {
    submitted: ["استلمنا طلبك وسنبدأ مراجعته قريبًا.", "We've received your request and will review it shortly."],
    under_review: ["فريقنا يراجع تفاصيل طلبك الآن.", "Our team is reviewing your request."],
    assigned: ["تم إسناد مقيّم معتمد لطلبك.", "A certified valuer has been assigned to your request."],
    in_progress: ["تقييمك قيد التنفيذ من قبل المقيّم.", "Your valuation is being carried out."],
    site_visit: ["يتم الآن ترتيب الزيارة الميدانية للعقار.", "A site visit is being arranged."],
    analysis: ["نحلّل بيانات العقار والسوق لتحديد القيمة.", "We're analyzing the property and market data."],
    report_ready: ["تقريرك جاهز — يمكنك تنزيله الآن.", "Your report is ready to download."],
    completed: ["اكتمل تقييمك وخطاب الإنجاز متاح.", "Your valuation is complete — certificate available."],
    rejected: ["تعذّر إكمال هذا الطلب. تواصل معنا للمزيد.", "This request couldn't be completed."],
    cancelled: ["تم إلغاء هذا الطلب.", "This request was cancelled."],
  };
  const [a, e] = m[status];
  return ar ? a : e;
}

export function ClientDashboard({
  projects,
  loading,
}: {
  projects: Project[];
  loading: boolean;
}) {
  const { profile } = useAuth();
  const { dict: d, locale } = useI18n();
  const ar = locale === "ar";

  const { stats, spotlight, deliverables } = useMemo(() => {
    const active = projects.filter((p) => isActive(p.status));
    const completed = projects.filter((p) => p.status === "completed");
    const ready = projects.filter((p) =>
      p.reports.some((r) => r.type === "final" || r.type === "certificate"),
    );
    return {
      stats: {
        total: projects.length,
        active: active.length,
        completed: completed.length,
        ready: ready.length,
      },
      spotlight: active[0] ?? projects[0] ?? null,
      deliverables: ready.slice(0, 4),
    };
  }, [projects]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return d.dash.greetingMorning;
    if (h < 18) return d.dash.greetingAfternoon;
    return d.dash.greetingEvening;
  })();

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-maroon-700/40 bg-brand-radial p-6 sm:p-8">
        <TopoPattern className="text-gold-500" opacity={0.12} />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gold-300">
              {greeting},{" "}
              <span className="font-medium text-cream-50">
                {profile?.name?.split(" ")[0]}
              </span>
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold text-cream-50 sm:text-3xl">
              {ar ? "بوابتك للتقييم العقاري" : "Your valuation portal"}
            </h1>
            <p className="mt-1.5 max-w-md text-sm text-cream-100/60">
              {d.dash.welcomeBack}
            </p>
          </div>
          <Button href="/requests/new" size="lg" className="shrink-0">
            <Plus className="h-4.5 w-4.5" />
            {d.dash.newRequest}
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label={d.kpi.total} value={stats.total} icon={FileText} tone="gold" />
        <StatCard label={d.kpi.inProgress} value={stats.active} icon={Clock} tone="maroon" />
        <StatCard label={d.kpi.completed} value={stats.completed} icon={CheckSquare} tone="positive" />
        <StatCard label={d.project.deliverables} value={stats.ready} icon={FileCheck} tone="neutral" />
      </div>

      {loading ? (
        <Skeleton className="h-52 w-full rounded-2xl" />
      ) : !spotlight ? (
        /* Onboarding */
        <Card>
          <CardBody>
            <EmptyState
              icon={Sparkles}
              title={ar ? "ابدأ تقييمك الأول" : "Start your first valuation"}
              description={
                ar
                  ? "أنشئ طلبًا خلال دقائق، وارفع مستنداتك، وتابع كل مرحلة لحظيًا حتى استلام تقريرك المعتمد."
                  : "Create a request in minutes, upload your documents, and track every stage until you receive your accredited report."
              }
              action={
                <Button href="/requests/new">
                  <Plus className="h-4 w-4" />
                  {d.dash.newRequest}
                </Button>
              }
            />
          </CardBody>
        </Card>
      ) : (
        /* Spotlight: current request */
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>{ar ? "طلبك الحالي" : "Your current request"}</CardTitle>
            <StatusBadge status={spotlight.status} />
          </CardHeader>
          <CardBody className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-mono text-xs text-gold-400">
                  {spotlight.code}
                </span>
                <p className="text-lg font-semibold text-cream-50">
                  {spotlight.title}
                </p>
              </div>
              {spotlight.estimatedValue != null && (
                <div className="text-end">
                  <p className="text-xs text-ink-500">
                    {d.project.estimatedValue}
                  </p>
                  <p className="text-lg font-semibold text-gradient-gold nums">
                    {fmtMoney(spotlight.estimatedValue, locale)}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-ink-700/70 bg-ink-900/40 p-4">
              <StageProgress status={spotlight.status} />
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-gold-500/20 bg-gold-500/5 p-3.5">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
              <p className="text-sm text-cream-100/80">
                {nextStep(spotlight.status, ar)}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-500">
                {d.project.createdAt}: {fmtDate(spotlight.createdAt, locale)}
              </span>
              <Button href={`/requests/${spotlight.id}`} variant="subtle" size="sm">
                {d.common.viewDetails}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Deliverables ready to download */}
      {deliverables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{d.project.deliverables}</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2">
            {deliverables.map((p) => {
              const report =
                p.reports.find((r) => r.type === "certificate") ??
                p.reports.find((r) => r.type === "final");
              if (!report) return null;
              return (
                <a
                  key={p.id}
                  href={report.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-gold-500/20 bg-gold-500/5 px-3.5 py-3 transition-colors hover:border-gold-500/40"
                >
                  <FileCheck className="h-4.5 w-4.5 shrink-0 text-gold-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-cream-50">
                      {p.title}
                    </span>
                    <span className="font-mono text-[0.7rem] text-gold-400">
                      {p.code}
                    </span>
                  </span>
                  <Download className="h-4 w-4 text-gold-500" />
                </a>
              );
            })}
          </CardBody>
        </Card>
      )}

      {/* Recent requests */}
      <Card>
        <CardHeader>
          <CardTitle>{d.project.requests}</CardTitle>
          <Button href="/requests" variant="ghost" size="sm">
            {d.common.viewAll}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardBody className="space-y-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[68px] w-full" />
            ))
          ) : projects.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-500">
              {d.project.noProjectsHint}
            </p>
          ) : (
            projects.slice(0, 5).map((p) => <RequestRow key={p.id} p={p} />)
          )}
        </CardBody>
      </Card>
    </div>
  );
}
