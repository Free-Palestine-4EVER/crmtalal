"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bell, CheckCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { doc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { COL } from "@/lib/firebase/firestore";
import { PageHeader } from "@/components/portal/PageHeader";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useNotifications } from "@/lib/hooks/data";
import { useI18n } from "@/i18n";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { AppNotification } from "@/lib/types";

type Filter = "all" | "unread";

export default function NotificationsPage() {
  const { dict, locale, isRTL } = useI18n();
  const router = useRouter();
  const reduce = useReducedMotion();
  const { data, loading } = useNotifications(60);
  const [filter, setFilter] = useState<Filter>("all");

  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  const unreadCount = useMemo(() => data.filter((n) => !n.read).length, [data]);
  const list = useMemo(
    () => (filter === "unread" ? data.filter((n) => !n.read) : data),
    [data, filter],
  );

  const markRead = async (id: string) => {
    try {
      await updateDoc(doc(db, COL.notifications, id), { read: true });
    } catch {
      /* realtime listener keeps UI consistent */
    }
  };

  const markAll = async () => {
    const unread = data.filter((n) => !n.read);
    if (unread.length === 0) return;
    const batch = writeBatch(db);
    unread.forEach((n) =>
      batch.update(doc(db, COL.notifications, n.id), { read: true }),
    );
    try {
      await batch.commit();
    } catch {
      /* ignore */
    }
  };

  const onItem = async (n: AppNotification) => {
    if (!n.read) await markRead(n.id);
    if (n.link) router.push(n.link);
  };

  return (
    <div>
      <PageHeader
        icon={Bell}
        title={dict.notif.title}
        subtitle={
          unreadCount > 0
            ? `${unreadCount} ${dict.notif.new}`
            : undefined
        }
        actions={
          unreadCount > 0 && (
            <Button variant="subtle" size="sm" onClick={markAll}>
              <CheckCheck className="h-4 w-4" />
              {dict.notif.markAllRead}
            </Button>
          )
        }
      />

      <SegmentedControl
        value={filter}
        onChange={(v) => setFilter(v as Filter)}
        options={[
          { value: "all", label: dict.common.all, count: data.length },
          { value: "unread", label: dict.notif.new, count: unreadCount },
        ]}
      />

      <div className="mt-5 space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[74px] w-full rounded-xl" />
          ))
        ) : list.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={dict.notif.empty}
            description={dict.notif.emptyHint}
          />
        ) : (
          <AnimatePresence initial={false} mode="popLayout">
            {list.map((n, i) => (
              <motion.button
                key={n.id}
                type="button"
                layout
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{
                  duration: 0.4,
                  delay: Math.min(i * 0.035, 0.3),
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={() => onItem(n)}
                className={cn(
                  "group flex w-full items-start gap-3.5 rounded-xl border px-4 py-3.5 text-start transition-colors",
                  n.read
                    ? "border-ink-800 bg-ink-850/40 hover:border-ink-700 hover:bg-ink-800/60"
                    : "border-maroon-700/40 bg-maroon-700/10 hover:border-gold-500/40 hover:bg-maroon-700/15",
                )}
              >
                <span
                  className={cn(
                    "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                    n.read
                      ? "bg-ink-600"
                      : "bg-gold-500 shadow-[0_0_0_4px_rgba(201,162,76,0.15)]",
                  )}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate text-sm font-medium",
                      n.read ? "text-cream-100/85" : "text-cream-50",
                    )}
                  >
                    {n.title[locale]}
                  </span>
                  <span className="mt-0.5 block text-sm text-ink-500">
                    {n.body[locale]}
                  </span>
                  <span className="mt-1.5 flex items-center gap-2 text-[0.72rem] text-ink-500">
                    {n.projectCode && (
                      <span className="font-mono text-gold-400">
                        {n.projectCode}
                      </span>
                    )}
                    <span>{timeAgo(n.createdAt, locale)}</span>
                    {n.link && (
                      <span className="ms-auto inline-flex items-center gap-0.5 text-gold-400/70 opacity-0 transition-opacity group-hover:opacity-100">
                        {dict.notif.viewRequest}
                        <Chevron className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </span>
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
