import { NextResponse } from "next/server";
import {
  adminAuth,
  adminDb,
  adminEnabled,
  FieldValue,
} from "@/lib/firebase/admin";
import { COL } from "@/lib/firebase/firestore";
import { jsonError, notConfigured } from "@/lib/auth/verify";
import {
  notifyUsers,
  getAdminUids,
  NOTIF_TITLE,
  locEvent,
} from "@/lib/server/notify";
import { sendWelcomeEmail } from "@/lib/server/email";

export async function POST(req: Request) {
  if (!adminEnabled) return notConfigured();

  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return jsonError("Unauthorized", 401);

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch {
    return jsonError("Invalid session", 401);
  }

  const uid = decoded.uid;
  const email = (decoded.email || "").toLowerCase();
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name =
    String(body.name || decoded.name || "").trim() ||
    email.split("@")[0] ||
    "Client";
  const phone = body.phone ? String(body.phone).trim() : null;
  const company = body.company ? String(body.company).trim() : null;
  const locale = body.locale === "en" ? "en" : "ar";

  const ref = adminDb.collection(COL.users).doc(uid);
  const existing = await ref.get();
  if (existing.exists) {
    return NextResponse.json({ profile: { uid, ...existing.data() } });
  }

  const adminList = (process.env.ADMIN_BOOTSTRAP_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const employeeList = (process.env.EMPLOYEE_BOOTSTRAP_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const role: "admin" | "employee" | "client" =
    email && adminList.includes(email)
      ? "admin"
      : email && employeeList.includes(email)
        ? "employee"
        : "client";

  await ref.set({
    email,
    name,
    phone,
    company,
    role,
    active: true,
    locale,
    createdAt: FieldValue.serverTimestamp(),
  });

  if (role === "client") {
    const admins = await getAdminUids();
    await notifyUsers(admins, {
      type: "new_client",
      title: NOTIF_TITLE.new_client,
      body: locEvent((d) => d.events.newClient, { name }),
      link: "/clients",
    });
  }

  if (email) {
    await sendWelcomeEmail(email, name, locale);
  }

  return NextResponse.json({
    profile: { uid, email, name, phone, company, role, active: true, locale },
  });
}
