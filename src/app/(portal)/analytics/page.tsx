"use client";

import { useMemo } from "react";
import {
  BarChart3,
  FileText,
  CheckSquare,
  Clock,
  Landmark,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  useProjects,
  useLeads,
  useDeals,
  useInvoices,
} from "@/lib/hooks/data";
import { useI18n } from "@/i18n";
import {
  STATUS_FLOW,
  DEAL_STAGES,
  isActive,
  type ProjectStatus,
  type DealStage,
} from "@/lib/types";
import { fmtMoney, fmtNumber } from "@/lib/format";
import { CHART } from "@/components/portal/charts/primitives";
import {
  TrendArea,
  CategoryBars,
  RankedBars,
  DonutChart,
} from "@/components/portal/charts";

const MONTHS_BACK = 8;
const TOP_VALUERS = 6;

export default function AnalyticsPage() {
  const { dict: d, locale } = useI18n();
  const { data: projects, loading } = useProjects();
  const { data: leads } = useLeads();
  const { data: deals } = useDeals();
  const { data: invoices } = useInvoices();

  /* ---- KPI row ---- */
  const kpis = useMemo(() => {
    const total = projects.length;
    const completed = projects.filter((p) => p.status === "completed").length;
    const inProgress = projects.filter((p) => isActive(p.status)).length;
    const portfolio = projects.reduce(
      (sum, p) => sum + (p.estimatedValue ?? 0),
      0,
    );
    const revenue = invoices
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + (i.total ?? 0), 0);
    const totalLeads = leads.length;
    const converted = leads.filter((l) => l.status === "converted").length;
    const conversion = totalLeads ? (converted / totalLeads) * 100 : 0;
    return {
      total,
      completed,
      inProgress,
      portfolio,
      revenue,
      conversion,
      converted,
      totalLeads,
    };
  }, [projects, invoices, leads]);

  /* ---- a) Requests over time (last MONTHS_BACK months) ---- */
  const requestsOverTime = useMemo(() => {
    const now = new Date();
    const buckets: { key: string; label: string; value: number }[] = [];
    const index = new Map<string, number>();
    const fmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
      month: "short",
    });
    for (let i = MONTHS_BACK - 1; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${dt.getFullYear()}-${dt.getMonth()}`;
      index.set(key, buckets.length);
      buckets.push({ key, label: fmt.format(dt), value: 0 });
    }
    for (const p of projects) {
      if (!p.createdAt) continue;
      const dt = new Date(p.createdAt);
      const key = `${dt.getFullYear()}-${dt.getMonth()}`;
      const at = index.get(key);
      if (at !== undefined) buckets[at].value += 1;
    }
    return buckets.map(({ label, value }) => ({ label, value }));
  }, [projects, locale]);

  /* ---- b) By status ---- */
  const byStatus = useMemo(() => {
    const counts = new Map<ProjectStatus, number>();
    for (const p of projects)
      counts.set(p.status, (counts.get(p.status) ?? 0) + 1);
    return STATUS_FLOW.map((s) => ({
      label: d.status[s],
      value: counts.get(s) ?? 0,
    }));
  }, [projects, d]);

  /* ---- c) By property type (donut) ---- */
  const byType = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects)
      counts.set(p.propertyType, (counts.get(p.propertyType) ?? 0) + 1);
    return [...counts.entries()]
      .map(([type, value]) => ({
        label:
          (d.propertyTypes as Record<string, string>)[type] ?? type,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [projects, d]);

  /* ---- d) Pipeline by stage (summed deal value, fallback to count) ---- */
  const pipeline = useMemo(() => {
    const value = new Map<DealStage, number>();
    const count = new Map<DealStage, number>();
    for (const deal of deals) {
      value.set(deal.stage, (value.get(deal.stage) ?? 0) + (deal.value ?? 0));
      count.set(deal.stage, (count.get(deal.stage) ?? 0) + 1);
    }
    const anyValue = [...value.values()].some((v) => v > 0);
    // Deal-stage labels aren't in the dictionary — humanize the enum.
    const rows = DEAL_STAGES.map((s) => ({
      label: s.charAt(0).toUpperCase() + s.slice(1),
      value: anyValue ? value.get(s) ?? 0 : count.get(s) ?? 0,
    }));
    return { rows, byValue: anyValue };
  }, [deals]);

  /* ---- e) Top valuers by completed projects ---- */
  const topValuers = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) {
      if (p.status !== "completed") continue;
      const name = p.assignedToName;
      if (!name) continue;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, TOP_VALUERS);
  }, [projects]);

  const emptyLabel = d.dash.noActivity;
  const fmtCount = (n: number) => fmtNumber(n, locale);
  const fmtSar = (n: number) => fmtMoney(n, locale);
  // Labels not present in the shared dictionary.
  const ar = locale === "ar";
  const revenueLabel = ar ? "الإيرادات" : "Revenue";
  const conversionLabel = ar ? "نسبة التحويل" : "Conversion";

  if (loading) {
    return (
      <div>
        <PageHeader icon={BarChart3} title={d.dash.analytics} />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[104px] w-full" />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[340px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={BarChart3}
        title={d.dash.analytics}
        subtitle={d.dash.welcomeBackAdmin}
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label={d.kpi.total}
          value={fmtCount(kpis.total)}
          icon={FileText}
          tone="gold"
        />
        <StatCard
          label={d.kpi.completed}
          value={fmtCount(kpis.completed)}
          icon={CheckSquare}
          tone="positive"
        />
        <StatCard
          label={d.kpi.inProgress}
          value={fmtCount(kpis.inProgress)}
          icon={Clock}
          tone="maroon"
        />
        <StatCard
          label={d.kpi.portfolioValue}
          value={fmtSar(kpis.portfolio)}
          icon={Landmark}
          tone="gold"
        />
        <StatCard
          label={revenueLabel}
          value={fmtSar(kpis.revenue)}
          icon={Wallet}
          tone="positive"
          hint={d.modules.invoices}
        />
        <StatCard
          label={conversionLabel}
          value={`${kpis.conversion.toFixed(0)}%`}
          icon={TrendingUp}
          tone="neutral"
          hint={`${fmtCount(kpis.converted)} / ${fmtCount(kpis.totalLeads)} ${d.modules.leads}`}
        />
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* a) Requests over time — full width */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{d.admin.monthlyRequests}</CardTitle>
          </CardHeader>
          <CardBody>
            <TrendArea
              data={requestsOverTime}
              emptyLabel={emptyLabel}
              format={fmtCount}
            />
          </CardBody>
        </Card>

        {/* b) By status */}
        <Card>
          <CardHeader>
            <CardTitle>{d.admin.byStatus}</CardTitle>
          </CardHeader>
          <CardBody>
            <CategoryBars
              data={byStatus}
              emptyLabel={emptyLabel}
              color={CHART.maroonLight}
              format={fmtCount}
            />
          </CardBody>
        </Card>

        {/* c) By property type */}
        <Card>
          <CardHeader>
            <CardTitle>{d.admin.byType}</CardTitle>
          </CardHeader>
          <CardBody>
            <DonutChart
              data={byType}
              emptyLabel={emptyLabel}
              centerValue={fmtCount(kpis.total)}
              centerLabel={d.modules.total}
              format={fmtCount}
            />
          </CardBody>
        </Card>

        {/* d) Pipeline by stage */}
        <Card>
          <CardHeader>
            <CardTitle>{d.admin.pipeline}</CardTitle>
          </CardHeader>
          <CardBody>
            <CategoryBars
              data={pipeline.rows}
              emptyLabel={emptyLabel}
              color={CHART.steel}
              format={pipeline.byValue ? fmtSar : fmtCount}
            />
          </CardBody>
        </Card>

        {/* e) Top valuers */}
        <Card>
          <CardHeader>
            <CardTitle>{d.admin.topValuers}</CardTitle>
          </CardHeader>
          <CardBody>
            <RankedBars
              data={topValuers}
              emptyLabel={emptyLabel}
              color={CHART.gold}
              format={fmtCount}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
