"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { PortalShell } from "@/components/portal/PortalShell";
import { Spinner } from "@/components/ui/Spinner";
import { Logo } from "@/components/brand/Logo";
import { useDict } from "@/i18n";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { enabled, loading, user, profile } = useAuth();
  const router = useRouter();
  const d = useDict();

  useEffect(() => {
    if (!enabled || loading) return;
    if (!user) router.replace("/login");
  }, [enabled, loading, user, router]);

  if (!enabled) {
    return (
      <div className="grid min-h-svh place-items-center bg-brand p-6 text-center">
        <div className="max-w-md">
          <Logo className="mx-auto" />
          <p className="mt-6 text-lg font-semibold text-cream-50">
            {d.common.error}
          </p>
          <p className="mt-2 text-sm text-cream-100/60">
            Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* to .env.local.
          </p>
        </div>
      </div>
    );
  }

  if (loading || !user || !profile) {
    return (
      <div className="grid min-h-svh place-items-center bg-ink-900">
        <Spinner className="h-8 w-8 text-gold-500" />
      </div>
    );
  }

  return <PortalShell>{children}</PortalShell>;
}
