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
  Timer,
  Trophy,
  Filter,
} from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  TableWrap,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "@/components/ui/Table";
import {
  useProjects,
  useLeads,
  useDeals,
  useInvoices,
  useUsersByRole,
} from "@/lib/hooks/data";
import { useI18n } from "@/i18n";
import {
  STATUS_FLOW,
  DEAL_STAGES,
  LEAD_STATUSES,
  isActive,
  type ProjectStatus,
  type DealStage,
  type LeadStatus,
} from "@/lib/types";
import { fmtMoney, fmtNumber } from "@/lib/format";
import { LEAD_STATUS_LABEL } from "@/components/portal/crm/labels";
import { CHART, ChartEmpty } from "@/components/portal/charts/primitives";
import {
  TrendArea,
  CategoryBars,
  RankedBars,
  DonutChart,
} from "@/components/portal/charts";

const MONTHS_BACK = 8;
const TOP_VALUERS = 6;
const DAY_MS = 86_400_000;

/** Stages shown in the lead funnel (drops the terminal "lost"). */
const FUNNEL_STAGES = LEAD_STATUSES.filter(
  (s): s is Exclude<LeadStatus, "lost"> => s !== "lost",
);

/** Palette walk for the funnel — warms toward gold as leads convert. */
const FUNNEL_COLORS = [CHART.info, CHART.steel, CHART.caution, CHART.gold];

export default function AnalyticsPage() {
  const { dict: d, locale, L } = useI18n();
  const { data: projects, loading } = useProjects();
  const { data: leads } = useLeads();
  const { data: deals } = useDeals();
  const { data: invoices } = useInvoices();
  const { data: valuers } = useUsersByRole("employee");

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

    // Avg turnaround across completed projects (createdAt → updatedAt proxy).
    let turnaroundSum = 0;
    let turnaroundCount = 0;
    for (const p of projects) {
      if (p.status !== "completed" || !p.createdAt || !p.updatedAt) continue;
      const days = (p.updatedAt - p.createdAt) / DAY_MS;
      if (days < 0) continue;
      turnaroundSum += days;
      turnaroundCount += 1;
    }
    const avgTurnaround = turnaroundCount ? turnaroundSum / turnaroundCount : 0;

    return {
      total,
      completed,
      inProgress,
      portfolio,
      revenue,
      conversion,
      converted,
      totalLeads,
      avgTurnaround,
      turnaroundCount,
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

  /* ---- a2) Revenue over time — paid-invoice totals per month ---- */
  const revenueOverTime = useMemo(() => {
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
    for (const inv of invoices) {
      if (inv.status !== "paid") continue;
      // Prefer the actual payment date; fall back to creation.
      const ms = inv.paidAt ?? inv.createdAt;
      if (!ms) continue;
      const dt = new Date(ms);
      const key = `${dt.getFullYear()}-${dt.getMonth()}`;
      const at = index.get(key);
      if (at !== undefined) buckets[at].value += inv.total ?? 0;
    }
    return buckets.map(({ label, value }) => ({ label, value }));
  }, [invoices, locale]);

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
        label: (d.propertyTypes as Record<string, string>)[type] ?? type,
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

  /* ---- f) Valuer leaderboard — completed / active / avg turnaround ---- */
  const leaderboard = useMemo(() => {
    type Row = {
      uid: string;
      name: string;
      photoURL?: string;
      completed: number;
      active: number;
      turnaroundSum: number;
      turnaroundCount: number;
    };
    const rows = new Map<string, Row>();
    const ensure = (uid: string, name: string, photoURL?: string): Row => {
      let row = rows.get(uid);
      if (!row) {
        row = {
          uid,
          name,
          photoURL,
          completed: 0,
          active: 0,
          turnaroundSum: 0,
          turnaroundCount: 0,
        };
        rows.set(uid, row);
      }
      return row;
    };

    // Seed from the staff roster so valuers with no work still appear.
    for (const v of valuers) ensure(v.uid, v.name, v.photoURL);

    for (const p of projects) {
      const uid = p.assignedTo;
      if (!uid) continue;
      const row = ensure(uid, p.assignedToName ?? uid);
      if (p.status === "completed") {
        row.completed += 1;
        if (p.createdAt && p.updatedAt) {
          const days = (p.updatedAt - p.createdAt) / DAY_MS;
          if (days >= 0) {
            row.turnaroundSum += days;
            row.turnaroundCount += 1;
          }
        }
      } else if (isActive(p.status)) {
        row.active += 1;
      }
    }

    return [...rows.values()]
      .map((r) => ({
        uid: r.uid,
        name: r.name,
        photoURL: r.photoURL,
        completed: r.completed,
        active: r.active,
        avgTurnaround: r.turnaroundCount
          ? r.turnaroundSum / r.turnaroundCount
          : null,
      }))
      .sort(
        (a, b) =>
          b.completed - a.completed ||
          b.active - a.active ||
          a.name.localeCompare(b.name),
      );
  }, [projects, valuers]);

  /* ---- g) Lead conversion funnel ---- */
  const funnel = useMemo(() => {
    const counts = new Map<LeadStatus, number>();
    for (const l of leads) counts.set(l.status, (counts.get(l.status) ?? 0) + 1);
    // Funnel semantics: a lead that reached a later stage also passed earlier
    // ones, so each step counts itself + everything downstream.
    const order = LEAD_STATUSES; // new → contacted → qualified → converted → lost
    const reached = (stage: LeadStatus) => {
      const from = order.indexOf(stage);
      let n = 0;
      for (let i = from; i < order.length; i++) {
        const s = order[i];
        if (s === "lost") continue; // lost leads aren't "in" the funnel
        n += counts.get(s) ?? 0;
      }
      return n;
    };
    const top = reached("new");
    const rows = FUNNEL_STAGES.map((stage, i) => {
      const value = reached(stage);
      return {
        stage,
        label: L(LEAD_STATUS_LABEL[stage]),
        value,
        pct: top ? (value / top) * 100 : 0,
        color: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
      };
    });
    const converted = counts.get("converted") ?? 0;
    const convRate = top ? (converted / top) * 100 : 0;
    return { rows, top, converted, convRate };
  }, [leads, L]);

  const emptyLabel = d.dash.noActivity;
  const fmtCount = (n: number) => fmtNumber(n, locale);
  const fmtSar = (n: number) => fmtMoney(n, locale);
  const fmtDays = (n: number) =>
    `${fmtNumber(Math.round(n), locale)} ${d.kpi.days}`;
  // Labels not present in the shared dictionary.
  const ar = locale === "ar";
  const revenueLabel = ar ? "الإيرادات" : "Revenue";
  const conversionLabel = ar ? "نسبة التحويل" : "Conversion";
  const revenueTrendLabel = ar ? "الإيرادات عبر الزمن" : "Revenue over time";
  const leaderboardLabel = ar ? "لوحة صدارة المُقيّمين" : "Valuer leaderboard";
  const funnelLabel = ar ? "مسار تحويل العملاء" : "Lead conversion funnel";
  const conversionRateLabel = ar ? "نسبة التحويل النهائية" : "Conversion rate";
  const colCompleted = ar ? "المكتملة" : "Completed";
  const colActive = ar ? "النشطة" : "Active";
  const dashIfNone = "—";

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

        {/* a2) Revenue over time — full width */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{revenueTrendLabel}</CardTitle>
            <span className="nums text-sm font-semibold text-positive">
              {fmtSar(kpis.revenue)}
            </span>
          </CardHeader>
          <CardBody>
            <TrendArea
              data={revenueOverTime}
              emptyLabel={emptyLabel}
              color={CHART.positive}
              format={fmtSar}
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

        {/* g) Lead conversion funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gold-400" />
              {funnelLabel}
            </CardTitle>
            <span className="nums text-sm font-semibold text-positive">
              {funnel.convRate.toFixed(0)}%
            </span>
          </CardHeader>
          <CardBody>
            <FunnelBars
              rows={funnel.rows}
              top={funnel.top}
              emptyLabel={emptyLabel}
              fmtCount={fmtCount}
              convertedLabel={L(LEAD_STATUS_LABEL.converted)}
              convRate={funnel.convRate}
              convRateLabel={conversionRateLabel}
            />
          </CardBody>
        </Card>
      </div>

      {/* Turnaround + leaderboard */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Avg turnaround KPI */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-gold-400" />
              {d.kpi.avgTurnaround}
            </CardTitle>
          </CardHeader>
          <CardBody>
            {kpis.turnaroundCount > 0 ? (
              <div className="flex flex-col items-start gap-1">
                <span className="nums text-5xl font-semibold tracking-tight text-parch-50">
                  {fmtNumber(Math.round(kpis.avgTurnaround), locale)}
                </span>
                <span className="text-sm text-ink-500">{d.kpi.days}</span>
                <p className="mt-3 text-xs text-ink-500">
                  {ar
                    ? `متوسط ${fmtCount(kpis.turnaroundCount)} مشروع مكتمل`
                    : `Across ${fmtCount(kpis.turnaroundCount)} completed projects`}
                </p>
              </div>
            ) : (
              <ChartEmpty message={emptyLabel} className="h-[160px]" />
            )}
          </CardBody>
        </Card>

        {/* Valuer leaderboard */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-gold-400" />
              {leaderboardLabel}
            </CardTitle>
          </CardHeader>
          {leaderboard.length === 0 ? (
            <CardBody>
              <ChartEmpty message={d.admin.noEmployees} className="h-[160px]" />
            </CardBody>
          ) : (
            <CardBody className="p-0">
              <TableWrap className="rounded-none border-0 bg-transparent shadow-none">
                <Table>
                  <THead>
                    <TR className="hover:bg-transparent">
                      <TH>{d.dash.employees}</TH>
                      <TH className="text-end">{colCompleted}</TH>
                      <TH className="text-end">{colActive}</TH>
                      <TH className="text-end">{d.kpi.avgTurnaround}</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {leaderboard.map((row, i) => (
                      <TR key={row.uid}>
                        <TD>
                          <div className="flex items-center gap-3">
                            <span className="nums w-4 shrink-0 text-xs font-semibold text-ink-500">
                              {fmtNumber(i + 1, locale)}
                            </span>
                            <Avatar
                              name={row.name}
                              src={row.photoURL}
                              size="sm"
                              ring={i === 0 && row.completed > 0}
                            />
                            <span className="truncate font-medium text-cream-50">
                              {row.name}
                            </span>
                          </div>
                        </TD>
                        <TD className="text-end">
                          <Badge
                            tone={row.completed > 0 ? "positive" : "neutral"}
                          >
                            <span className="nums">
                              {fmtCount(row.completed)}
                            </span>
                          </Badge>
                        </TD>
                        <TD className="nums text-end text-parch-100/85">
                          {fmtCount(row.active)}
                        </TD>
                        <TD className="nums text-end text-parch-100/85">
                          {row.avgTurnaround != null
                            ? fmtDays(row.avgTurnaround)
                            : dashIfNone}
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </TableWrap>
            </CardBody>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   Lead conversion funnel — horizontal tapering bars.
   Bespoke visual (recharts wrappers don't cover funnels), styled
   to match the dark chart palette + tooltip language.
   ============================================================ */
type FunnelRow = {
  stage: LeadStatus;
  label: string;
  value: number;
  pct: number;
  color: string;
};

function FunnelBars({
  rows,
  top,
  emptyLabel,
  fmtCount,
  convertedLabel,
  convRate,
  convRateLabel,
}: {
  rows: FunnelRow[];
  top: number;
  emptyLabel: string;
  fmtCount: (n: number) => string;
  convertedLabel: string;
  convRate: number;
  convRateLabel: string;
}) {
  if (top === 0) return <ChartEmpty message={emptyLabel} />;
  return (
    <div className="flex h-[260px] flex-col justify-center gap-3">
      {rows.map((row, i) => {
        // Step-over-step retention (vs. the previous stage).
        const prev = i === 0 ? row.value : rows[i - 1].value;
        const step = prev ? (row.value / prev) * 100 : 0;
        return (
          <div key={row.stage} className="group">
            <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 font-medium text-cream-100/90">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: row.color }}
                />
                {row.label}
              </span>
              <span className="flex items-baseline gap-2">
                <span className="nums font-semibold text-cream-50">
                  {fmtCount(row.value)}
                </span>
                {i > 0 && (
                  <span className="nums text-xs text-ink-500">
                    {step.toFixed(0)}%
                  </span>
                )}
              </span>
            </div>
            <div className="h-7 w-full overflow-hidden rounded-lg bg-ink-800/70 ring-1 ring-ink-700/60">
              <div
                className="h-full rounded-lg transition-[width] duration-500 ease-out"
                style={{
                  width: `${Math.max(row.pct, row.value > 0 ? 4 : 0)}%`,
                  backgroundColor: row.color,
                }}
              />
            </div>
          </div>
        );
      })}
      <div className="mt-1 flex items-center justify-between border-t border-ink-700/60 pt-3 text-sm">
        <span className="text-ink-500">{convRateLabel}</span>
        <span className="nums font-semibold text-positive">
          {convRate.toFixed(1)}% <span className="text-ink-500">·</span>{" "}
          <span className="text-cream-100/80">{convertedLabel}</span>
        </span>
      </div>
    </div>
  );
}
