import { NextResponse } from "next/server";
import { verifyRequest, jsonError, notConfigured } from "@/lib/auth/verify";
import { adminEnabled } from "@/lib/firebase/admin";
import {
  crmCreate,
  crmUpdate,
  crmDelete,
  type CrmEntity,
} from "@/lib/server/crud";
import { HttpError, type Actor } from "@/lib/server/projects";

export async function POST(req: Request) {
  if (!adminEnabled) return notConfigured();
  const auth = await verifyRequest(req);
  if (!auth) return jsonError("Unauthorized", 401);
  if (!auth.active) return jsonError("Account inactive", 403);

  const actor: Actor = { uid: auth.uid, name: auth.name, role: auth.role };
  try {
    const { entity, op, id, data } = await req.json();
    const e = entity as CrmEntity;
    switch (op) {
      case "create":
        return NextResponse.json(await crmCreate(actor, e, data || {}));
      case "update":
        if (!id) return jsonError("Missing id", 400);
        return NextResponse.json(await crmUpdate(actor, e, id, data || {}));
      case "delete":
        if (!id) return jsonError("Missing id", 400);
        return NextResponse.json(await crmDelete(actor, e, id));
      default:
        return jsonError("Unknown op", 400);
    }
  } catch (err) {
    if (err instanceof HttpError) return jsonError(err.message, err.status);
    // eslint-disable-next-line no-console
    console.error("[crm]", err);
    return jsonError("Server error", 500);
  }
}
