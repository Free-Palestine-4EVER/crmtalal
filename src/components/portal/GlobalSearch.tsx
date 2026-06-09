"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useDict } from "@/i18n";
import { cn } from "@/lib/cn";

export function GlobalSearch({ className }: { className?: string }) {
  const d = useDict();
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <form
      className={cn("relative max-w-md", className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) router.push(`/requests?q=${encodeURIComponent(q.trim())}`);
      }}
    >
      <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={d.common.search}
        className="h-11 w-full rounded-xl border border-ink-700 bg-ink-850/60 pe-4 ps-10 text-sm text-cream-50 placeholder:text-ink-500 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/15"
      />
    </form>
  );
}
