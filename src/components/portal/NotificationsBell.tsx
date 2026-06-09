"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";
import { doc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { COL } from "@/lib/firebase/firestore";
import { useNotifications } from "@/lib/hooks/data";
import { useI18n } from "@/i18n";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { AppNotification } from "@/lib/types";

export function NotificationsBell() {
  const { data } = useNotifications(20);
  const { dict, locale } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const unread = data.filter((n) => !n.read).length;

  const markRead = async (id: string) => {
    try {
      await updateDoc(doc(db, COL.notifications, id), { read: true });
    } catch {
      /* ignore */
    }
  };

  const markAll = async () => {
    const batch = writeBatch(db);
    data.filter((n) => !n.read).forEach((n) =>
      batch.update(doc(db, COL.notifications, n.id), { read: true }),
    );
    try {
      await batch.commit();
    } catch {
      /* ignore */
    }
  };

  const onItem = async (n: AppNotification) => {
    await markRead(n.id);
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-10 w-10 place-items-center rounded-full border border-ink-700 bg-ink-850/60 text-cream-100/80 transition-colors hover:border-gold-500/40 hover:text-white"
        aria-label={dict.notif.title}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute -end-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-gold-500 px-1 text-[0.65rem] font-bold text-ink-950">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="absolute end-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-ink-700 bg-ink-850 shadow-elevated"
            >
              <div className="flex items-center justify-between border-b border-ink-700 px-4 py-3">
                <p className="text-sm font-semibold text-cream-50">
                  {dict.notif.title}
                </p>
                {unread > 0 && (
                  <button
                    onClick={markAll}
                    className="inline-flex items-center gap-1 text-xs text-gold-300 hover:text-gold-200"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    {dict.notif.markAllRead}
                  </button>
                )}
              </div>
              <div className="max-h-[24rem] overflow-y-auto">
                {data.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-ink-500">
                    {dict.notif.empty}
                  </div>
                ) : (
                  data.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => onItem(n)}
                      className={cn(
                        "flex w-full gap-3 border-b border-ink-800/70 px-4 py-3 text-start transition-colors hover:bg-ink-800/60",
                        !n.read && "bg-maroon-700/10",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                          n.read ? "bg-ink-600" : "bg-gold-500",
                        )}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-cream-50">
                          {n.title[locale]}
                        </span>
                        <span className="mt-0.5 block text-xs text-cream-100/55">
                          {n.body[locale]}
                        </span>
                        <span className="mt-1 block text-[0.7rem] text-ink-500">
                          {timeAgo(n.createdAt, locale)}
                        </span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
