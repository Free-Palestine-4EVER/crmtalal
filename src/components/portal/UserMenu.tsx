"use client";

import { useRouter } from "next/navigation";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Dropdown } from "@/components/ui/Dropdown";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useDict } from "@/i18n";

export function UserMenu() {
  const { profile, signOut } = useAuth();
  const d = useDict();
  const router = useRouter();
  if (!profile) return null;

  const roleLabel = d.roles[profile.role];

  return (
    <Dropdown
      align="end"
      items={[
        {
          key: "profile",
          label: d.dash.profile,
          icon: User,
          onClick: () => router.push("/profile"),
        },
        {
          key: "settings",
          label: d.dash.settings,
          icon: Settings,
          onClick: () => router.push("/settings"),
        },
        {
          key: "logout",
          label: d.nav.logout,
          icon: LogOut,
          danger: true,
          onClick: async () => {
            await signOut();
            router.replace("/login");
          },
        },
      ]}
      trigger={
        <button className="flex items-center gap-2.5 rounded-full border border-ink-700 bg-ink-850/60 py-1 pe-2.5 ps-1 transition-colors hover:border-gold-500/40">
          <Avatar name={profile.name} src={profile.photoURL} size="sm" ring />
          <span className="hidden text-start sm:block">
            <span className="block text-xs font-semibold leading-tight text-cream-50">
              {profile.name}
            </span>
            <span className="block text-[0.65rem] leading-tight text-gold-400">
              {roleLabel}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 text-ink-500" />
        </button>
      }
    />
  );
}
