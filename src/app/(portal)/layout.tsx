"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { PortalShell } from "@/components/portal/PortalShell";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";
import { useDict, useI18n } from "@/i18n";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { enabled, loading, user, profile, profileError, signOut } = useAuth();
  const router = useRouter();
  const d = useDict();
  const { locale } = useI18n();

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

  // Signed in, but the profile couldn't be loaded or created.
  if (!loading && user && (!profile || profileError)) {
    return (
      <div className="grid min-h-svh place-items-center bg-brand p-6 text-center">
        <div className="max-w-md">
          <Logo className="mx-auto" />
          <p className="mt-6 text-lg font-semibold text-cream-50">
            {locale === "ar"
              ? "تعذّر تحميل حسابك"
              : "We couldn't load your account"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-cream-100/60">
            {locale === "ar"
              ? "غالبًا لم تُنشر قواعد قاعدة البيانات بعد، أو لم يكتمل إعداد الخادم (مفتاح Firebase Admin). راجع SETUP.md ثم أعد المحاولة."
              : "This usually means the database rules aren't published yet, or the server isn't fully configured (Firebase Admin key). See SETUP.md, then retry."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => window.location.reload()} size="sm">
              <RefreshCw className="h-4 w-4" />
              {locale === "ar" ? "إعادة المحاولة" : "Retry"}
            </Button>
            <Button
              variant="subtle"
              size="sm"
              onClick={async () => {
                await signOut();
                router.replace("/login");
              }}
            >
              <LogOut className="h-4 w-4" />
              {d.nav.logout}
            </Button>
          </div>
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
