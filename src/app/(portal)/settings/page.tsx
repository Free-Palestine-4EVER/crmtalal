"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  Languages,
  BellRing,
  BellOff,
  ShieldCheck,
  Lock,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { updatePassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { PageHeader } from "@/components/portal/PageHeader";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Field, Input } from "@/components/ui/form";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useOneSignal } from "@/lib/onesignal/OneSignalProvider";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/cn";
import type { Locale } from "@/i18n/config";

const cardEnter = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

export default function SettingsPage() {
  const { dict, locale, setLocale } = useI18n();
  const { signOut } = useAuth();
  const router = useRouter();

  const signOutAndLeave = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <div>
      <PageHeader icon={SettingsIcon} title={dict.dash.settings} />

      <div className="mx-auto max-w-2xl space-y-5">
        {/* a) Language */}
        <motion.div
          {...cardEnter}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{dict.profile.language}</CardTitle>
              <Languages className="h-4.5 w-4.5 text-gold-400" />
            </CardHeader>
            <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-ink-500">
                {locale === "ar"
                  ? "اختر لغة واجهة التطبيق."
                  : "Choose the interface language."}
              </p>
              <SegmentedControl<Locale>
                value={locale}
                onChange={setLocale}
                options={[
                  { value: "ar", label: "العربية" },
                  { value: "en", label: "English" },
                ]}
              />
            </CardBody>
          </Card>
        </motion.div>

        {/* b) Notifications / push */}
        <motion.div
          {...cardEnter}
          transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
          <PushCard />
        </motion.div>

        {/* c) Security */}
        <motion.div
          {...cardEnter}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <SecurityCard />
        </motion.div>

        {/* d) Sign out */}
        <motion.div
          {...cardEnter}
          transition={{ duration: 0.5, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center pt-1"
        >
          <Button variant="danger" onClick={signOutAndLeave}>
            <LogOut className="h-4 w-4" />
            {dict.nav.logout}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Push notifications card                                           */
/* ---------------------------------------------------------------- */
function PushCard() {
  const { dict, locale } = useI18n();
  const { enabled, optedIn, permission, prompt } = useOneSignal();
  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState(false);

  // The OneSignal `permission` boolean is only true when granted; read the
  // native browser permission to distinguish "blocked" from "not yet asked".
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setBlocked(Notification.permission === "denied");
  }, [permission, optedIn]);

  const onEnable = async () => {
    setBusy(true);
    try {
      await prompt();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.profile.notifications}</CardTitle>
        {optedIn ? (
          <BellRing className="h-4.5 w-4.5 text-gold-400" />
        ) : (
          <BellOff className="h-4.5 w-4.5 text-ink-500" />
        )}
      </CardHeader>
      <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-sm text-ink-500">
          {locale === "ar"
            ? "استلم تنبيهات فورية عن طلباتك وتقاريرك على هذا الجهاز."
            : "Get instant alerts about your requests and reports on this device."}
        </p>

        {!enabled ? (
          <p className="text-sm text-ink-500">{dict.common.na}</p>
        ) : optedIn ? (
          <Badge tone="positive" className="shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {dict.notif.pushEnabled}
          </Badge>
        ) : blocked ? (
          <p className="shrink-0 text-sm text-caution">
            {dict.notif.pushBlocked}
          </p>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onEnable}
            loading={busy}
            className="shrink-0"
          >
            <BellRing className="h-4 w-4" />
            {dict.notif.enablePush}
          </Button>
        )}
      </CardBody>
    </Card>
  );
}

/* ---------------------------------------------------------------- */
/* Security / change-password card                                   */
/* ---------------------------------------------------------------- */
function SecurityCard() {
  const { dict, locale } = useI18n();
  const [pw, setPw] = useState("");
  const [saving, setSaving] = useState(false);

  const tooShort = pw.length > 0 && pw.length < 8;
  const canSubmit = pw.length >= 8 && !saving;

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !auth.currentUser) return;
    setSaving(true);
    try {
      await updatePassword(auth.currentUser, pw);
      toast.success(dict.common.success);
      setPw("");
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/requires-recent-login") {
        toast.error(
          locale === "ar"
            ? "لأمانك، يرجى تسجيل الخروج ثم الدخول مرة أخرى قبل تغيير كلمة المرور."
            : "For your security, please sign out and sign back in before changing your password.",
        );
      } else if (code === "auth/weak-password") {
        toast.error(dict.auth.weakPassword);
      } else {
        toast.error(dict.common.error);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.profile.security}</CardTitle>
        <ShieldCheck className="h-4.5 w-4.5 text-gold-400" />
      </CardHeader>
      <CardBody>
        <form onSubmit={changePassword} className="space-y-4">
          <Field
            label={dict.profile.changePassword}
            htmlFor="new-password"
            hint={
              locale === "ar"
                ? "8 أحرف على الأقل."
                : "At least 8 characters."
            }
            error={tooShort ? dict.auth.weakPassword : undefined}
          >
            <div className="relative">
              <Lock
                className={cn(
                  "pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500",
                  "start-3.5",
                )}
              />
              <Input
                id="new-password"
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={8}
                className="ps-10"
              />
            </div>
          </Field>

          <div className="flex justify-end">
            <Button type="submit" loading={saving} disabled={!canSubmit}>
              {dict.profile.changePassword}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
