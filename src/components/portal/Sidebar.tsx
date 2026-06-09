"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Settings } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { navForRole, GROUP_LABEL } from "@/lib/nav";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useDict } from "@/i18n";
import { cn } from "@/lib/cn";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { role } = useAuth();
  const d = useDict();
  const pathname = usePathname();
  if (!role) return null;
  const groups = navForRole(role);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const linkClass = (active: boolean) =>
    cn(
      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
      active
        ? "bg-maroon-600/20 text-gold-200 shadow-[inset_0_0_0_1px_rgba(201,162,76,0.18)]"
        : "text-cream-100/65 hover:bg-ink-800/60 hover:text-white",
    );

  return (
    <div className="flex h-full flex-col bg-ink-950/95">
      <div className="flex h-18 items-center px-5">
        <Link href="/dashboard" onClick={onNavigate}>
          <Logo />
        </Link>
      </div>

      <nav className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-3 py-3">
        {groups.map((g) => (
          <div key={g.group}>
            <p className="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ink-500">
              {GROUP_LABEL[g.group](d)}
            </p>
            <ul className="space-y-1">
              {g.items.map((it) => {
                const active = isActive(it.href);
                const Icon = it.icon;
                return (
                  <li key={it.key}>
                    <Link
                      href={it.href}
                      onClick={onNavigate}
                      className={linkClass(active)}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      <span className="truncate">{it.label(d, role)}</span>
                      {active && (
                        <span className="ms-auto h-1.5 w-1.5 rounded-full bg-gold-500" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-ink-800 p-3">
        <Link
          href="/notifications"
          onClick={onNavigate}
          className={linkClass(isActive("/notifications"))}
        >
          <Bell className="h-[18px] w-[18px]" />
          {d.dash.notifications}
        </Link>
        <Link
          href="/settings"
          onClick={onNavigate}
          className={linkClass(isActive("/settings"))}
        >
          <Settings className="h-[18px] w-[18px]" />
          {d.dash.settings}
        </Link>
      </div>
    </div>
  );
}
