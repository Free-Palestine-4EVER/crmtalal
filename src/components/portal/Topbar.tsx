"use client";

import { Menu } from "lucide-react";
import { PushOptIn } from "@/components/notifications/PushOptIn";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { NotificationsBell } from "./NotificationsBell";
import { UserMenu } from "./UserMenu";
import { GlobalSearch } from "./GlobalSearch";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-18 items-center gap-3 border-b border-ink-800 bg-ink-900/85 px-4 backdrop-blur-xl sm:px-6">
      <button
        type="button"
        onClick={onMenu}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-ink-700 text-cream-100 lg:hidden"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <GlobalSearch className="hidden flex-1 md:block" />

      <div className="ms-auto flex items-center gap-2 sm:gap-3">
        <PushOptIn className="hidden sm:inline-flex" />
        <LanguageToggle />
        <NotificationsBell />
        <UserMenu />
      </div>
    </header>
  );
}
