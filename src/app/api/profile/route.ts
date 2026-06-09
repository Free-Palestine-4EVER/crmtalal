import { NextResponse } from "next/server";
import { verifyRequest, jsonError, notConfigured } from "@/lib/auth/verify";
import { adminEnabled, adminDb } from "@/lib/firebase/admin";
import { COL } from "@/lib/firebase/firestore";

export async function POST(req: Request) {
  if (!adminEnabled) return notConfigured();
  const auth = await verifyRequest(req);
  if (!auth) return jsonError("Unauthorized", 401);

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim())
    update.name = body.name.trim();
  if (typeof body.phone === "string") update.phone = body.phone.trim() || null;
  if (typeof body.company === "string")
    update.company = body.company.trim() || null;
  if (body.locale === "ar" || body.locale === "en") update.locale = body.locale;
  if (typeof body.photoURL === "string") update.photoURL = body.photoURL;

  if (Object.keys(update).length === 0)
    return jsonError("Nothing to update", 400);

  await adminDb.collection(COL.users).doc(auth.uid).set(update, { merge: true });
  return NextResponse.json({ ok: true });
}
