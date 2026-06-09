import { NextResponse } from "next/server";
import { verifyRequest, jsonError, notConfigured } from "@/lib/auth/verify";
import { adminEnabled, adminDb } from "@/lib/firebase/admin";
import { COL } from "@/lib/firebase/firestore";

type UserAction = "activate" | "deactivate" | "makeAdmin" | "revokeAdmin";

/** POST — admin activates/deactivates a user or grants/revokes admin. */
export async function POST(req: Request) {
  if (!adminEnabled) return notConfigured();

  const auth = await verifyRequest(req);
  if (!auth) return jsonError("Unauthorized", 401);
  if (auth.role !== "admin") return jsonError("Forbidden", 403);

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const uid = String(body.uid ?? "").trim();
  const action = body.action as UserAction;

  if (!uid) return jsonError("Missing uid", 400);

  // Don't let an admin lock themselves out.
  if (uid === auth.uid && (action === "deactivate" || action === "revokeAdmin")) {
    return jsonError("You can't perform this action on yourself", 400);
  }

  let update: Record<string, unknown>;
  switch (action) {
    case "activate":
      update = { active: true };
      break;
    case "deactivate":
      update = { active: false };
      break;
    case "makeAdmin":
      update = { role: "admin" };
      break;
    case "revokeAdmin":
      update = { role: "employee" };
      break;
    default:
      return jsonError("Unknown action", 400);
  }

  try {
    await adminDb.collection(COL.users).doc(uid).set(update, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin.users]", e);
    return jsonError("Server error", 500);
  }
}
