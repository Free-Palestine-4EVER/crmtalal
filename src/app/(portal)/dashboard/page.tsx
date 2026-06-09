"use client";

import { useMemo } from "react";
import {
  Plus,
  FileText,
  Clock,
  CheckSquare,
  Users,
  UserPlus,
  TrendingUp,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  useProjects,
  useLeads,
  useUsersByRole,
  useTasks,
} from "@/lib/hooks/data";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { RequestRow } from "@/components/portal/RequestRow";
import { ClientDashboard } from "@/components/portal/ClientDashboard";
import { useI18n } from "@/i18n";
import { isActive, TERMINAL_STATUSES } from "@/lib/types";
import type { Dictionary as Dict } from "@/i18n/dictionaries/en";

function greeting(d: Dict): string {
  const h = new Date().getHours();
  if (h < 12) return d.dash.greetingMorning;
  if (h < 18) return d.dash.greetingAfternoon;
  return d.dash.greetingEvening;
}

export default function DashboardPage() {
  const { profile, role } = useAuth();
  const { dict: d } = useI18n();
  const { data: projects, loading } = useProjects();

  const isAdmin = role === "admin";
  const isClient = role === "client";

  // Staff-only datasets (hooks no-op for clients)
  const { data: leads } = useLeads();
  const { data: clients } = useUsersByRole("client");
  const { data: valuers } = useUsersByRole("employee");
  const { data: tasks } = useTasks();

  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => isActive(p.status)).length;
    const completed = projects.filter((p) => p.status === "completed").length;
    const unassigned = projects.filter(
      (p) =>
        !p.assignedTo &&
        p.status !== "completed" &&
        !TERMINAL_STATUSES.includes(p.status),
    ).length;
    const pending = projects.filter(
      (p) => p.status === "submitted" || p.status === "under_review",
    ).length;
    return { total, active, completed, unassigned, pending };
  }, [projects]);

  const myOpenTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.assignedTo === profile?.uid &&
          (t.status === "todo" || t.status === "in_progress"),
      ).length,
    [tasks, profile],
  );

  const welcome = isAdmin
    ? d.dash.welcomeBackAdmin
    : isClient
      ? d.dash.welcomeBack
      : d.dash.welcomeBackEmployee;

  // Clients get a dedicated, richer home.
  if (isClient) {
    return <ClientDashboard projects={projects} loading={loading} />;
  }

  return (
    <div>
      {/* Greeting */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-gold-400">
            {greeting(d)},{" "}
            <span className="font-medium text-cream-100">
              {profile?.name?.split(" ")[0]}
            </span>
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-cream-50 sm:text-3xl">
            {d.dash.overview}
          </h1>
          <p className="mt-1 text-sm text-ink-500">{welcome}</p>
        </div>
        {(isClient || isAdmin) && (
          <Button href="/requests/new">
            <Plus className="h-4 w-4" />
            {d.dash.newRequest}
          </Button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label={d.kpi.total}
          value={stats.total}
          icon={FileText}
          tone="gold"
        />
        <StatCard
          label={d.kpi.inProgress}
          value={stats.active}
          icon={Clock}
          tone="maroon"
        />
        <StatCard
          label={d.kpi.completed}
          value={stats.completed}
          icon={CheckSquare}
          tone="positive"
        />
        {isAdmin ? (
          <StatCard
            label={d.kpi.awaitingAssignment}
            value={stats.unassigned}
            icon={UserPlus}
            tone="neutral"
          />
        ) : isClient ? (
          <StatCard
            label={d.kpi.pending}
            value={stats.pending}
            icon={ClipboardList}
            tone="neutral"
          />
        ) : (
          <StatCard
            label={d.kpi.awaitingYou}
            value={myOpenTasks}
            icon={ClipboardList}
            tone="neutral"
          />
        )}
      </div>

      {/* Admin second row */}
      {isAdmin && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard label={d.kpi.totalClients} value={clients.length} icon={Users} />
          <StatCard label={d.kpi.totalValuers} value={valuers.length} icon={Users} />
          <StatCard label={d.modules.leads} value={leads.length} icon={UserPlus} tone="gold" />
          <StatCard
            label={d.modules.tasks}
            value={tasks.filter((t) => t.status !== "done").length}
            icon={TrendingUp}
          />
        </div>
      )}

      {/* Recent requests */}
      <Card className="mt-7">
        <CardHeader>
          <CardTitle>{d.project.requests}</CardTitle>
          <Button href="/requests" variant="ghost" size="sm">
            {d.common.viewAll}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardBody className="space-y-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))
          ) : projects.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={d.project.noProjects}
              description={
                isClient ? d.project.noProjectsHint : d.project.noAssigned
              }
              action={
                isClient || isAdmin ? (
                  <Button href="/requests/new" size="sm">
                    <Plus className="h-4 w-4" />
                    {d.dash.newRequest}
                  </Button>
                ) : undefined
              }
            />
          ) : (
            projects
              .slice(0, 6)
              .map((p) => (
                <RequestRow key={p.id} p={p} showClient={!isClient} />
              ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
