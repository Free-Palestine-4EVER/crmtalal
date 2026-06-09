"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, Plus } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { Toolbar } from "@/components/ui/Toolbar";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { RequestRow } from "@/components/portal/RequestRow";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useProjects } from "@/lib/hooks/data";
import { useI18n } from "@/i18n";
import { isActive } from "@/lib/types";

type Filter = "all" | "active" | "completed";

function RequestsInner() {
  const { dict: d } = useI18n();
  const { role } = useAuth();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [filter, setFilter] = useState<Filter>("all");
  const { data: projects, loading } = useProjects();
  const isClient = role === "client";

  const filtered = useMemo(() => {
    let list = projects;
    if (filter === "active") list = list.filter((p) => isActive(p.status));
    else if (filter === "completed")
      list = list.filter((p) => p.status === "completed");
    const q = search.trim().toLowerCase();
    if (q)
      list = list.filter(
        (p) =>
          p.code.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.clientName.toLowerCase().includes(q),
      );
    return list;
  }, [projects, filter, search]);

  return (
    <div>
      <PageHeader
        icon={FileText}
        title={isClient ? d.dash.myRequests : d.project.requests}
        actions={
          (isClient || role === "admin") && (
            <Button href="/requests/new" size="sm">
              <Plus className="h-4 w-4" />
              {d.dash.newRequest}
            </Button>
          )
        }
      />

      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder={d.common.search}
      >
        <SegmentedControl
          value={filter}
          onChange={(v) => setFilter(v as Filter)}
          options={[
            { value: "all", label: d.common.all, count: projects.length },
            {
              value: "active",
              label: d.kpi.active,
              count: projects.filter((p) => isActive(p.status)).length,
            },
            {
              value: "completed",
              label: d.kpi.completed,
              count: projects.filter((p) => p.status === "completed").length,
            },
          ]}
        />
      </Toolbar>

      <div className="mt-5 space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[68px] w-full" />
          ))
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={d.project.noProjects}
            description={isClient ? d.project.noProjectsHint : d.project.noAssigned}
            action={
              isClient || role === "admin" ? (
                <Button href="/requests/new" size="sm">
                  <Plus className="h-4 w-4" />
                  {d.dash.newRequest}
                </Button>
              ) : undefined
            }
          />
        ) : (
          filtered.map((p) => (
            <RequestRow key={p.id} p={p} showClient={!isClient} />
          ))
        )}
      </div>
    </div>
  );
}

export default function RequestsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
      <RequestsInner />
    </Suspense>
  );
}
