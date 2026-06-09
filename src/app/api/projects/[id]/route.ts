import { NextResponse } from "next/server";
import { verifyRequest, jsonError, notConfigured } from "@/lib/auth/verify";
import { adminEnabled } from "@/lib/firebase/admin";
import {
  HttpError,
  changeStatus,
  assignProject,
  updateFields,
  addNote,
  attachDocument,
  attachReport,
  sendMessage,
  saveValuation,
  type Actor,
} from "@/lib/server/projects";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!adminEnabled) return notConfigured();
  const auth = await verifyRequest(req);
  if (!auth) return jsonError("Unauthorized", 401);
  if (!auth.active) return jsonError("Account inactive", 403);

  const { id } = await params;
  const actor: Actor = { uid: auth.uid, name: auth.name, role: auth.role };

  try {
    const body = await req.json();
    switch (body.action) {
      case "status":
        return NextResponse.json(
          await changeStatus(actor, id, body.status, body.note),
        );
      case "assign":
        return NextResponse.json(
          await assignProject(actor, id, body.employeeUid, body.employeeName),
        );
      case "update":
        return NextResponse.json(await updateFields(actor, id, body.fields));
      case "note":
        return NextResponse.json(await addNote(actor, id, body.note));
      case "document":
        return NextResponse.json(await attachDocument(actor, id, body.document));
      case "report":
        return NextResponse.json(await attachReport(actor, id, body.report));
      case "message":
        return NextResponse.json(await sendMessage(actor, id, body.text));
      case "valuation":
        return NextResponse.json(
          await saveValuation(actor, id, body.valuation),
        );
      default:
        return jsonError("Unknown action", 400);
    }
  } catch (e) {
    if (e instanceof HttpError) return jsonError(e.message, e.status);
    // eslint-disable-next-line no-console
    console.error("[projects.action]", e);
    return jsonError("Server error", 500);
  }
}
