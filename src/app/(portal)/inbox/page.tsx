"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { RequestMessages } from "@/components/portal/request/RequestMessages";
import { useProjects } from "@/lib/hooks/data";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useI18n } from "@/i18n";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Project } from "@/lib/types";

/* Inline bilingual strings (dict may lack inbox-specific copy). */
const T = {
  selectTitle: { ar: "اختر محادثة", en: "Select a conversation" },
  selectHint: {
    ar: "اختر طلبًا من القائمة لعرض المحادثة.",
    en: "Pick a request from the list to view its conversation.",
  },
  emptyTitle: { ar: "لا توجد محادثات بعد", en: "No conversations yet" },
  emptyHint: {
    ar: "ستظهر محادثات طلباتك هنا.",
    en: "Conversations from your requests will appear here.",
  },
  searchPlaceholder: { ar: "ابحث في المحادثات…", en: "Search conversations…" },
} as const;

/** Counterpart shown for a conversation: client sees the valuer, staff sees the client. */
function counterpartName(p: Project, isClient: boolean): string {
  if (isClient) return p.assignedToName ?? "Edarah";
  return p.clientName;
}

export default function InboxPage() {
  const { dict: d, locale, L, isRTL } = useI18n();
  const { role } = useAuth();
  const { data: projects, loading } = useProjects();
  const isClient = role === "client";

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const Back = isRTL ? ChevronRight : ChevronLeft;
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  // Sorted by most-recently-updated, then filtered by the search query.
  const conversations = useMemo(() => {
    const sorted = [...projects].sort((a, b) => b.updatedAt - a.updatedAt);
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((p) =>
      [p.code, p.title, p.clientName, p.assignedToName]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [projects, search]);

  const selected = useMemo(
    () => projects.find((p) => p.id === selectedId) ?? null,
    [projects, selectedId],
  );

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div>
        <PageHeader icon={MessageSquare} title={d.dash.messages} />
        <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[72px] w-full" />
            ))}
          </div>
          <Skeleton className="hidden h-[28rem] w-full lg:block" />
        </div>
      </div>
    );
  }

  /* ---- Empty (no conversations at all) ---- */
  if (projects.length === 0) {
    return (
      <div>
        <PageHeader icon={MessageSquare} title={d.dash.messages} />
        <EmptyState
          icon={MessageSquare}
          title={L(T.emptyTitle)}
          description={L(T.emptyHint)}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader icon={MessageSquare} title={d.dash.messages} />

      <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
        {/* ---- Conversation list ---- */}
        <aside
          className={cn(
            "glass flex max-h-[calc(100vh-12rem)] min-h-[24rem] flex-col overflow-hidden rounded-2xl",
            // On mobile, hide the list once a conversation is open.
            selected ? "hidden lg:flex" : "flex",
          )}
        >
          {/* Search */}
          <div className="border-b border-ink-700/70 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={L(T.searchPlaceholder)}
                aria-label={d.common.search}
                className="h-10 w-full rounded-xl border border-ink-700 bg-ink-850/70 ps-10 pe-4 text-sm text-cream-50 placeholder:text-ink-500 transition-colors focus:border-gold-500/70 focus:bg-ink-850 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              />
            </div>
          </div>

          {/* Rows */}
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {conversations.length === 0 ? (
              <p className="px-3 py-10 text-center text-sm text-ink-500">
                {d.common.noResults}
              </p>
            ) : (
              <ul className="space-y-1">
                {conversations.map((p) => {
                  const who = counterpartName(p, isClient);
                  const active = p.id === selectedId;
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(p.id)}
                        aria-current={active ? "true" : undefined}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-colors",
                          active
                            ? "bg-maroon-700/15 ring-1 ring-gold-500/40"
                            : "hover:bg-ink-800/60",
                        )}
                      >
                        {isClient ? (
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink-800 text-gold-400">
                            <FileText className="h-[18px] w-[18px]" />
                          </span>
                        ) : (
                          <Avatar name={who} size="md" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs text-gold-400">
                              {p.code}
                            </span>
                            <span className="shrink-0 text-[0.65rem] text-ink-500">
                              {timeAgo(p.updatedAt, locale)}
                            </span>
                          </div>
                          <p className="truncate text-sm font-medium text-cream-50">
                            {p.title}
                          </p>
                          <p className="truncate text-xs text-ink-500">{who}</p>
                        </div>
                        <Chevron
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            active
                              ? "text-gold-400"
                              : "text-ink-600 group-hover:text-gold-400",
                          )}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* ---- Thread pane ---- */}
        <section
          className={cn(
            "min-w-0 flex-1",
            // On mobile, the thread takes over only once a conversation is selected.
            selected ? "block" : "hidden lg:block",
          )}
        >
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col gap-4"
              >
                {/* Thread header */}
                <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    aria-label={d.common.back}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-800/70 hover:text-gold-400 lg:hidden"
                  >
                    <Back className="h-5 w-5" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-xs text-gold-400">
                      {selected.code}
                    </span>
                    <p className="truncate text-sm font-semibold text-cream-50">
                      {selected.title}
                    </p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>

                {/* Live thread + composer */}
                <RequestMessages projectId={selected.id} />
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hidden lg:block"
              >
                <EmptyState
                  icon={MessageSquare}
                  title={L(T.selectTitle)}
                  description={L(T.selectHint)}
                  className="h-full min-h-[24rem]"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
