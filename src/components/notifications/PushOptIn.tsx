"use client";

import { BellRing } from "lucide-react";
import { useOneSignal } from "@/lib/onesignal/OneSignalProvider";
import { useDict } from "@/i18n";
import { cn } from "@/lib/cn";

/** Inline button prompting the user to enable web-push. Hides once opted in. */
export function PushOptIn({ className }: { className?: string }) {
  const { enabled, optedIn, prompt } = useOneSignal();
  const d = useDict();
  if (!enabled || optedIn) return null;

  return (
    <button
      type="button"
      onClick={prompt}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3.5 py-2 text-xs font-medium text-gold-300 transition-colors hover:bg-gold-500/20",
        className,
      )}
    >
      <BellRing className="h-4 w-4" />
      {d.notif.enablePush}
    </button>
  );
}
