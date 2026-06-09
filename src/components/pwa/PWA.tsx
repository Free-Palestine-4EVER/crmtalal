"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, X } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { useDict } from "@/i18n";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "edarah_pwa_dismissed";

export function PWA() {
  const d = useDict();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Register the (combined OneSignal + offline) service worker.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/OneSignalSDKWorker.js", { scope: "/" })
        .catch(() => {});
    }

    let delay: ReturnType<typeof setTimeout> | null = null;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      let dismissed = false;
      try {
        dismissed = localStorage.getItem(DISMISS_KEY) === "1";
      } catch {
        /* ignore */
      }
      if (dismissed) return;
      setDeferred(e as BeforeInstallPromptEvent);
      // let the visitor experience the site first — offer the app later
      delay = setTimeout(() => setShow(true), 25_000);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      if (delay) clearTimeout(delay);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setShow(false);
    setDeferred(null);
  };

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className="fixed inset-x-4 bottom-4 z-[90] mx-auto max-w-sm rounded-2xl border border-gold-500/30 bg-ink-850/95 p-4 shadow-elevated backdrop-blur-xl sm:bottom-6"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-maroon-600">
              <LogoMark tone="official" className="h-8" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-cream-50">
                {d.pwa.installTitle}
              </p>
              <p className="mt-0.5 text-xs text-cream-100/60">
                {d.pwa.installBody}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={install}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-gold-400 to-gold-600 px-4 py-2 text-xs font-semibold text-ink-950"
                >
                  <Download className="h-3.5 w-3.5" />
                  {d.pwa.installAction}
                </button>
                <button
                  onClick={dismiss}
                  className="rounded-full px-3 py-2 text-xs text-cream-100/60 hover:text-white"
                >
                  {d.pwa.dismiss}
                </button>
              </div>
            </div>
            <button
              onClick={dismiss}
              aria-label="Close"
              className="text-ink-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
