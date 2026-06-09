"use client";

import { Toaster } from "sonner";
import { LocaleProvider, useI18n, type Locale } from "@/i18n";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { OneSignalProvider } from "@/lib/onesignal/OneSignalProvider";
import { PWA } from "@/components/pwa/PWA";

function ThemedToaster() {
  const { dir } = useI18n();
  return (
    <Toaster
      dir={dir}
      position={dir === "rtl" ? "bottom-left" : "bottom-right"}
      theme="dark"
      closeButton
      toastOptions={{
        style: {
          background: "var(--color-ink-800)",
          border: "1px solid var(--color-ink-700)",
          color: "#e7e9ee",
          fontFamily: "inherit",
        },
        className: "rounded-xl",
      }}
    />
  );
}

export function Providers({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <AuthProvider>
        <OneSignalProvider>
          {children}
          <ThemedToaster />
          <PWA />
        </OneSignalProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}
