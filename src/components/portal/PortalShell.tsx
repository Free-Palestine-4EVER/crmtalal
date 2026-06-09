"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useI18n } from "@/i18n";

export function PortalShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { isRTL } = useI18n();
  const offscreen = isRTL ? "100%" : "-100%";

  return (
    <div className="min-h-svh bg-ink-900">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-72 border-e border-ink-800 lg:block">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: offscreen }}
              animate={{ x: 0 }}
              exit={{ x: offscreen }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="fixed inset-y-0 start-0 z-50 w-72 border-e border-ink-800 lg:hidden"
            >
              <Sidebar onNavigate={() => setOpen(false)} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute end-3 top-5 grid h-9 w-9 place-items-center rounded-lg text-cream-100/70 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="lg:ps-72">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
