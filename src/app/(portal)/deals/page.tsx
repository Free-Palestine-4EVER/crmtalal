"use client";

import { useMemo, useState } from "react";
import { Briefcase, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { DealCard } from "@/components/portal/crm/DealCard";
import { DealFormModal } from "@/components/portal/crm/DealFormModal";
import { DEAL_STAGE_LABEL } from "@/components/portal/crm/dealEnums";
import { useDeals } from "@/lib/hooks/data";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/cn";
import { fmtMoney } from "@/lib/format";
import { DEAL_STAGES, type Deal, type DealStage } from "@/lib/types";

/** Per-stage column accent. won = positive, lost = muted/critical, rest neutral. */
const COLUMN_ACCENT: Record<
  DealStage,
  { wrap: string; dot: string; count: string }
> = {
  lead: { wrap: "", dot: "bg-info", count: "bg-ink-800 text-parch-100/70" },
  qualified: { wrap: "", dot: "bg-steel-400", count: "bg-ink-800 text-parch-100/70" },
  proposal: { wrap: "", dot: "bg-gold-500", count: "bg-ink-800 text-parch-100/70" },
  negotiation: { wrap: "", dot: "bg-caution", count: "bg-ink-800 text-parch-100/70" },
  won: {
    wrap: "border-positive/30 bg-positive/[0.06]",
    dot: "bg-positive",
    count: "bg-positive/15 text-positive",
  },
  lost: {
    wrap: "border-critical/25 bg-critical/[0.04] opacity-90",
    dot: "bg-critical/80",
    count: "bg-critical/12 text-critical",
  },
};

export default function DealsPage() {
  const { dict: d, locale, L } = useI18n();
  const { data: deals, loading } = useDeals();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);

  // Group deals into their stage buckets, preserving the updatedAt order from the hook.
  const columns = useMemo(() => {
    const map: Record<DealStage, Deal[]> = {
      lead: [],
      qualified: [],
      proposal: [],
      negotiation: [],
      won: [],
      lost: [],
    };
    for (const deal of deals) {
      (map[deal.stage] ?? map.lead).push(deal);
    }
    return DEAL_STAGES.map((stage) => {
      const list = map[stage];
      const total = list.reduce((sum, x) => sum + (x.value ?? 0), 0);
      return { stage, list, total };
    });
  }, [deals]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (deal: Deal) => {
    setEditing(deal);
    setFormOpen(true);
  };

  return (
    <div>
      <PageHeader
        icon={Briefcase}
        title={d.modules.pipeline}
        subtitle={L({ ar: "تابع صفقاتك عبر المراحل", en: "Track deals across stages" })}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {d.modules.addDeal}
          </Button>
        }
      />

      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-72 shrink-0 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      ) : deals.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={d.modules.noDeals}
          description={L({
            ar: "أنشئ أول صفقة لبدء متابعة مسار مبيعاتك.",
            en: "Create your first deal to start tracking your pipeline.",
          })}
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              {d.modules.addDeal}
            </Button>
          }
        />
      ) : (
        <div className="no-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 pb-4">
          {columns.map(({ stage, list, total }) => {
            const accent = COLUMN_ACCENT[stage];
            return (
              <section
                key={stage}
                className={cn(
                  "flex w-72 shrink-0 flex-col rounded-2xl border border-ink-800 bg-ink-900/40",
                  accent.wrap,
                )}
              >
                {/* Column header */}
                <header className="flex items-center justify-between gap-2 border-b border-ink-800/70 px-3.5 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", accent.dot)} />
                    <h2 className="truncate text-sm font-semibold text-cream-50">
                      {L(DEAL_STAGE_LABEL[stage])}
                    </h2>
                    <span
                      className={cn(
                        "nums rounded-full px-1.5 py-0.5 text-[0.7rem] font-semibold",
                        accent.count,
                      )}
                    >
                      {list.length}
                    </span>
                  </div>
                  <span className="nums shrink-0 text-[0.7rem] font-medium text-ink-500">
                    {fmtMoney(total, locale)}
                  </span>
                </header>

                {/* Cards */}
                <div className="flex max-h-[calc(100vh-16rem)] min-h-24 flex-1 flex-col gap-2.5 overflow-y-auto p-2.5">
                  <AnimatePresence initial={false}>
                    {list.length === 0 ? (
                      <p className="px-1 py-6 text-center text-xs text-ink-600">
                        {L({ ar: "لا صفقات", en: "No deals" })}
                      </p>
                    ) : (
                      list.map((deal) => (
                        <DealCard key={deal.id} deal={deal} onEdit={openEdit} />
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </section>
            );
          })}
        </div>
      )}

      <DealFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        deal={editing}
      />
    </div>
  );
}
