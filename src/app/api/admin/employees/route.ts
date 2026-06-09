import { NextResponse } from "next/server";
import { verifyRequest, jsonError, notConfigured } from "@/lib/auth/verify";
import {
  adminEnabled,
  adminAuth,
  adminDb,
  FieldValue,
} from "@/lib/firebase/admin";
import { COL } from "@/lib/firebase/firestore";

/** POST — admin creates a valuer (employee) account. */
export async function POST(req: Request) {
  if (!adminEnabled) return notConfigured();

  const auth = await verifyRequest(req);
  if (!auth) return jsonError("Unauthorized", 401);
  if (auth.role !== "admin") return jsonError("Forbidden", 403);

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body.password ?? "");
  const phone = body.phone ? String(body.phone).trim() : null;
  const title = body.title ? String(body.title).trim() : null;
  const locale = body.locale === "en" ? "en" : "ar";

  // Validation
  if (!name) return jsonError("Name is required", 400);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonError("A valid email is required", 400);
  }
  if (!password || password.length < 8) {
    return jsonError("Password must be at least 8 characters", 400);
  }

  try {
    const u = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });
    await adminDb.collection(COL.users).doc(u.uid).set({
      email,
      name,
      phone,
      title,
      role: "employee",
      active: true,
      locale,
      createdAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ uid: u.uid });
  } catch (e) {
    const code = (e as { code?: string })?.code;
    if (code === "auth/email-already-exists") {
      return jsonError("Email already in use", 409);
    }
    console.error("[admin.employees]", e);
    return jsonError("Server error", 500);
  }
}
