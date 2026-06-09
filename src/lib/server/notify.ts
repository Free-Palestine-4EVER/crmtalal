import "server-only";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COL } from "@/lib/firebase/firestore";
import { en } from "@/i18n/dictionaries/en";
import { ar } from "@/i18n/dictionaries/ar";
import { interpolate } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { NotificationType } from "@/lib/types";
import { sendEventEmail } from "./email";

type Loc = { ar: string; en: string };

const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
const ONESIGNAL_REST = process.env.ONESIGNAL_REST_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function absoluteUrl(path?: string): string | undefined {
  if (!path) return undefined;
  return path.startsWith("http") ? path : `${SITE_URL}${path}`;
}

/** Short bilingual headings per notification type. */
export const NOTIF_TITLE: Record<NotificationType, Loc> = {
  request_created: { ar: "طلب تقييم جديد", en: "New valuation request" },
  assigned: { ar: "تم الإسناد", en: "Request assigned" },
  status_changed: { ar: "تحديث الحالة", en: "Status updated" },
  report_ready: { ar: "التقرير جاهز", en: "Report ready" },
  completed: { ar: "اكتمل الطلب", en: "Request complete" },
  message: { ar: "رسالة جديدة", en: "New message" },
  document: { ar: "مستند جديد", en: "Document uploaded" },
  new_client: { ar: "عميل جديد", en: "New client" },
  fee_set: { ar: "تحديد الأتعاب", en: "Service fee set" },
};

/** Build a bilingual string from the same dictionary key in both locales. */
export function locEvent(
  select: (d: Dictionary) => string,
  vars: Record<string, string | number> = {},
): Loc {
  return {
    en: interpolate(select(en), vars),
    ar: interpolate(select(ar), vars),
  };
}

/** Send a OneSignal web-push to specific users (by external id = uid). */
export async function pushToUsers(
  uids: string[],
  title: Loc,
  body: Loc,
  link?: string,
): Promise<void> {
  const targets = Array.from(new Set(uids)).filter(Boolean);
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST || targets.length === 0) return;
  try {
    await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${ONESIGNAL_REST}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        target_channel: "push",
        include_aliases: { external_id: targets },
        headings: { en: title.en, ar: title.ar },
        contents: { en: body.en, ar: body.ar },
        url: absoluteUrl(link),
        chrome_web_icon: `${SITE_URL}/icons/icon-192.png`,
      }),
    });
  } catch (e) {
    // Push is best-effort; the in-app notification is the source of truth.
    // eslint-disable-next-line no-console
    console.error("[Edarah] OneSignal push failed:", e);
  }
}

type NotifyInput = {
  type: NotificationType;
  title: Loc;
  body: Loc;
  projectId?: string;
  projectCode?: string;
  link?: string;
  /** Set false to skip the email channel (e.g. high-frequency chat). */
  email?: boolean;
};

/** Write an in-app notification document for one user. */
async function writeNotification(userId: string, n: NotifyInput) {
  await adminDb.collection(COL.notifications).add({
    userId,
    type: n.type,
    title: n.title,
    body: n.body,
    projectId: n.projectId ?? null,
    projectCode: n.projectCode ?? null,
    link: n.link ?? null,
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  });
}

/** Persist in-app notifications for each user AND fire a push. */
export async function notifyUsers(
  uids: string[],
  n: NotifyInput,
): Promise<void> {
  const targets = Array.from(new Set(uids)).filter(Boolean);
  if (targets.length === 0) return;
  await Promise.all(targets.map((uid) => writeNotification(uid, n)));
  await pushToUsers(targets, n.title, n.body, n.link);

  // Email channel — look up each recipient's address + language.
  if (n.email !== false) {
    try {
      const snaps = await Promise.all(
        targets.map((uid) => adminDb.collection(COL.users).doc(uid).get()),
      );
      await Promise.all(
        snaps.map((s) => {
          const data = s.data();
          const email = data?.email as string | undefined;
          if (!email) return Promise.resolve();
          const loc = data?.locale === "en" ? "en" : "ar";
          return sendEventEmail(email, loc, n.title[loc], n.body[loc], n.link);
        }),
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[Edarah] event email failed", e);
    }
  }
}

/** All admin user ids — recipients of operational alerts. */
export async function getAdminUids(): Promise<string[]> {
  const snap = await adminDb
    .collection(COL.users)
    .where("role", "==", "admin")
    .get();
  return snap.docs.map((d) => d.id);
}
