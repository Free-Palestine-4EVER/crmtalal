import { NextResponse } from "next/server";
import { verifyRequest, jsonError, notConfigured } from "@/lib/auth/verify";
import { adminEnabled, adminDb, FieldValue } from "@/lib/firebase/admin";
import { COL } from "@/lib/firebase/firestore";

const FIELDS = [
  "nameEn",
  "nameAr",
  "legalNameEn",
  "legalNameAr",
  "tagline",
  "licenseNo",
  "phone",
  "email",
  "website",
  "addressEn",
  "addressAr",
  "logoUrl",
  "defaultFee",
  "vatRate",
  "reportNote",
];

export async function POST(req: Request) {
  if (!adminEnabled) return notConfigured();
  const auth = await verifyRequest(req);
  if (!auth) return jsonError("Unauthorized", 401);
  if (auth.role !== "admin") return jsonError("Forbidden", 403);

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const update: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };
  for (const k of FIELDS) if (k in body) update[k] = body[k];

  await adminDb.collection(COL.settings).doc("org").set(update, { merge: true });
  return NextResponse.json({ ok: true });
}
