import { NextResponse } from "next/server";
import { adminEnabled, adminDb, FieldValue } from "@/lib/firebase/admin";
import { COL } from "@/lib/firebase/firestore";
import { notConfigured, jsonError } from "@/lib/auth/verify";
import { notifyUsers, getAdminUids } from "@/lib/server/notify";

/** Public lead capture — the hero quick form posts here (no auth). */
export async function POST(req: Request) {
  if (!adminEnabled) return notConfigured();
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  if (!name || !phone) return jsonError("Name and phone are required", 400);

  const str = (v: unknown) => (v ? String(v).trim() : null);
  const ref = await adminDb.collection(COL.leads).add({
    name,
    phone,
    email: str(body.email),
    propertyType: str(body.propertyType),
    purpose: str(body.purpose),
    message: str(body.message),
    region: str(body.region),
    source: "website",
    status: "new",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const admins = await getAdminUids();
  await notifyUsers(admins, {
    type: "new_client",
    title: { ar: "عميل محتمل جديد", en: "New website lead" },
    body: {
      ar: `طلب تقييم جديد من ${name}`,
      en: `New valuation inquiry from ${name}`,
    },
    link: "/leads",
  });

  return NextResponse.json({ ok: true, id: ref.id });
}
