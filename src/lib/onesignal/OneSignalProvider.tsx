"use client";

import OneSignal from "react-onesignal";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@/lib/auth/AuthProvider";

const APP_ID =
  process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID ||
  "5122e60f-dd49-41b1-81e7-66b6117a8383";

type OneSignalContextValue = {
  ready: boolean;
  enabled: boolean;
  permission: boolean;
  optedIn: boolean;
  /** Ask the browser for push permission and opt the user in. */
  prompt: () => Promise<void>;
};

const OneSignalContext = createContext<OneSignalContextValue>({
  ready: false,
  enabled: false,
  permission: false,
  optedIn: false,
  prompt: async () => {},
});

// Module-level guard so init runs exactly once (React strict mode safe).
let initStarted = false;

export function OneSignalProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ready, setReady] = useState(false);
  const [permission, setPermission] = useState(false);
  const [optedIn, setOptedIn] = useState(false);
  const enabled = Boolean(APP_ID);

  useEffect(() => {
    if (!enabled || initStarted || typeof window === "undefined") return;
    initStarted = true;
    OneSignal.init({
      appId: APP_ID,
      allowLocalhostAsSecureOrigin: true,
    })
      .then(() => {
        setReady(true);
        setPermission(OneSignal.Notifications.permission);
        setOptedIn(OneSignal.User.PushSubscription.optedIn ?? false);
        OneSignal.Notifications.addEventListener("permissionChange", (granted) =>
          setPermission(granted),
        );
        OneSignal.User.PushSubscription.addEventListener("change", (change) =>
          setOptedIn(change.current.optedIn),
        );
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error("[Edarah] OneSignal init failed:", e);
      });
  }, [enabled]);

  // Bind the push subscription to the signed-in user via External ID = uid,
  // so the server can target notifications precisely.
  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        if (user) await OneSignal.login(user.uid);
        else await OneSignal.logout();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[Edarah] OneSignal identity error:", e);
      }
    })();
  }, [ready, user]);

  const prompt = useCallback(async () => {
    if (!ready) return;
    try {
      const granted = await OneSignal.Notifications.requestPermission();
      if (granted && OneSignal.User.PushSubscription.optedIn === false) {
        await OneSignal.User.PushSubscription.optIn();
      }
      setPermission(OneSignal.Notifications.permission);
      setOptedIn(OneSignal.User.PushSubscription.optedIn ?? granted);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[Edarah] push prompt error:", e);
    }
  }, [ready]);

  return (
    <OneSignalContext.Provider
      value={{ ready, enabled, permission, optedIn, prompt }}
    >
      {children}
    </OneSignalContext.Provider>
  );
}

export const useOneSignal = () => useContext(OneSignalContext);
