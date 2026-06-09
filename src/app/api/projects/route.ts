import { NextResponse } from "next/server";
import { verifyRequest, jsonError, notConfigured } from "@/lib/auth/verify";
import { adminEnabled } from "@/lib/firebase/admin";
import { createProject, HttpError } from "@/lib/server/projects";

export async function POST(req: Request) {
  if (!adminEnabled) return notConfigured();
  const actor = await verifyRequest(req);
  if (!actor) return jsonError("Unauthorized", 401);
  if (!actor.active) return jsonError("Account inactive", 403);

  try {
    const body = await req.json();
    const result = await createProject(
      { uid: actor.uid, name: actor.name, role: actor.role },
      body,
    );
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof HttpError) return jsonError(e.message, e.status);
    // eslint-disable-next-line no-console
    console.error("[projects.create]", e);
    return jsonError("Server error", 500);
  }
}
