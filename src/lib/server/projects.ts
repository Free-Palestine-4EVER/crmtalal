import "server-only";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COL } from "@/lib/firebase/firestore";
import {
  notifyUsers,
  getAdminUids,
  NOTIF_TITLE,
  locEvent,
} from "./notify";
import { makeProjectCode } from "@/lib/types";
import type {
  Role,
  ProjectStatus,
  ProjectDocument,
  ProjectReport,
  ValuationMethod,
  ValuationData,
  Priority,
  TimelineKind,
  ActivityEntity,
} from "@/lib/types";
import { en } from "@/i18n/dictionaries/en";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export type Actor = { uid: string; name: string; role: Role };

function rid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  ).toUpperCase();
}

function tEntry(
  kind: TimelineKind,
  actor: Actor,
  extra: Record<string, unknown> = {},
) {
  return {
    id: rid(),
    kind,
    at: Date.now(),
    byName: actor.name,
    byRole: actor.role,
    ...extra,
  };
}

async function nextSeq(kind: string, year: number): Promise<number> {
  const ref = adminDb.collection(COL.counters).doc(`${kind}-${year}`);
  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const cur = snap.exists ? (snap.data()?.seq as number) || 0 : 0;
    const next = cur + 1;
    tx.set(ref, { seq: next }, { merge: true });
    return next;
  });
}

export async function logActivity(
  actor: Actor,
  type: string,
  entity: ActivityEntity,
  entityId: string | undefined,
  entityLabel: string | undefined,
  summary: string,
) {
  await adminDb.collection(COL.activities).add({
    type,
    actorId: actor.uid,
    actorName: actor.name,
    actorRole: actor.role,
    entity,
    entityId: entityId ?? null,
    entityLabel: entityLabel ?? null,
    summary,
    at: FieldValue.serverTimestamp(),
  });
}

type ProjectDoc = {
  id: string;
  code: string;
  clientId: string;
  clientName: string;
  assignedTo?: string | null;
  assignedToName?: string | null;
  status: ProjectStatus;
};

async function getProject(id: string): Promise<ProjectDoc> {
  const snap = await adminDb.collection(COL.projects).doc(id).get();
  if (!snap.exists) throw new HttpError(404, "Project not found");
  const d = snap.data() as Record<string, unknown>;
  return {
    id,
    code: (d.code as string) || "",
    clientId: (d.clientId as string) || "",
    clientName: (d.clientName as string) || "",
    assignedTo: (d.assignedTo as string) || null,
    assignedToName: (d.assignedToName as string) || null,
    status: (d.status as ProjectStatus) || "submitted",
  };
}

/** Recipients = the given users + all admins, deduped, minus the actor. */
async function withAdmins(
  base: (string | null | undefined)[],
  actorUid: string,
): Promise<string[]> {
  const admins = await getAdminUids();
  return Array.from(
    new Set([...base, ...admins].filter(Boolean) as string[]),
  ).filter((u) => u !== actorUid);
}

function isAdmin(a: Actor) {
  return a.role === "admin";
}
function canStaffEdit(a: Actor, p: ProjectDoc) {
  return a.role === "admin" || (a.role === "employee" && p.assignedTo === a.uid);
}
function isParticipant(a: Actor, p: ProjectDoc) {
  return canStaffEdit(a, p) || p.clientId === a.uid;
}

/* ============================================================ */

export type IncomingDoc = Omit<
  ProjectDocument,
  "id" | "uploadedAt" | "uploadedBy" | "uploadedByName"
>;

export type CreateProjectInput = {
  title: string;
  propertyType: string;
  purpose: string;
  region?: string;
  city?: string;
  district?: string;
  address?: string;
  area?: number;
  description?: string;
  priority?: Priority;
  documents?: IncomingDoc[];
  clientCompany?: string;
  leadId?: string;
};

export async function createProject(actor: Actor, input: CreateProjectInput) {
  if (!input.title || !input.propertyType || !input.purpose) {
    throw new HttpError(400, "Missing required fields");
  }
  const year = new Date().getFullYear();
  const seq = await nextSeq("EV", year);
  const code = makeProjectCode(seq, year);
  const now = FieldValue.serverTimestamp();
  const ref = adminDb.collection(COL.projects).doc();

  const documents = (input.documents ?? []).map((doc) => ({
    ...doc,
    id: rid(),
    uploadedAt: Date.now(),
    uploadedBy: actor.uid,
    uploadedByName: actor.name,
  }));

  await ref.set({
    code,
    clientId: actor.uid,
    clientName: actor.name,
    clientCompany: input.clientCompany ?? null,
    title: input.title,
    propertyType: input.propertyType,
    purpose: input.purpose,
    region: input.region ?? null,
    city: input.city ?? null,
    district: input.district ?? null,
    address: input.address ?? null,
    area: typeof input.area === "number" ? input.area : null,
    areaUnit: "sqm",
    description: input.description ?? null,
    priority: input.priority ?? "normal",
    status: "submitted",
    assignedTo: null,
    assignedToName: null,
    method: null,
    estimatedValue: null,
    currency: "SAR",
    fee: null,
    documents,
    reports: [],
    timeline: [tEntry("created", actor)],
    createdAt: now,
    updatedAt: now,
  });

  const admins = await getAdminUids();
  await notifyUsers(admins, {
    type: "request_created",
    title: NOTIF_TITLE.request_created,
    body: locEvent((d) => d.events.requestCreatedAdmin, {
      code,
      name: actor.name,
    }),
    projectId: ref.id,
    projectCode: code,
    link: `/requests/${ref.id}`,
  });
  await notifyUsers([actor.uid], {
    type: "request_created",
    title: NOTIF_TITLE.request_created,
    body: locEvent((d) => d.events.requestCreatedClient, { code }),
    projectId: ref.id,
    projectCode: code,
    link: `/requests/${ref.id}`,
  });
  await logActivity(actor, "project_created", "project", ref.id, code, `Created ${code}`);
  return { id: ref.id, code };
}

export async function changeStatus(
  actor: Actor,
  id: string,
  status: ProjectStatus,
  note?: string,
) {
  const p = await getProject(id);
  if (!canStaffEdit(actor, p)) throw new HttpError(403, "Not allowed");
  await adminDb.collection(COL.projects).doc(id).update({
    status,
    updatedAt: FieldValue.serverTimestamp(),
    timeline: FieldValue.arrayUnion(tEntry("status", actor, { status, note: note ?? null })),
  });
  const statusLabel = en.status[status];
  const recipients = await withAdmins([p.clientId], actor.uid);
  if (status === "completed") {
    await notifyUsers(recipients, {
      type: "completed",
      title: NOTIF_TITLE.completed,
      body: locEvent((d) => d.events.completed, { code: p.code }),
      projectId: id,
      projectCode: p.code,
      link: `/requests/${id}`,
    });
  } else {
    await notifyUsers(recipients, {
      type: "status_changed",
      title: NOTIF_TITLE.status_changed,
      body: locEvent((d) => d.events.statusChanged, {
        code: p.code,
        status: statusLabel,
      }),
      projectId: id,
      projectCode: p.code,
      link: `/requests/${id}`,
    });
  }
  await logActivity(actor, "status_changed", "project", id, p.code, `${p.code} → ${statusLabel}`);
  return { ok: true };
}

export async function assignProject(
  actor: Actor,
  id: string,
  employeeUid: string,
  employeeName: string,
) {
  if (!isAdmin(actor)) throw new HttpError(403, "Only admins can assign");
  const p = await getProject(id);
  const newStatus: ProjectStatus =
    p.status === "submitted" || p.status === "under_review" ? "assigned" : p.status;
  await adminDb.collection(COL.projects).doc(id).update({
    assignedTo: employeeUid,
    assignedToName: employeeName,
    status: newStatus,
    updatedAt: FieldValue.serverTimestamp(),
    timeline: FieldValue.arrayUnion(
      tEntry("assign", actor, { note: employeeName }),
    ),
  });
  await notifyUsers([employeeUid], {
    type: "assigned",
    title: NOTIF_TITLE.assigned,
    body: locEvent((d) => d.events.assignedEmployee, { code: p.code }),
    projectId: id,
    projectCode: p.code,
    link: `/requests/${id}`,
  });
  await notifyUsers(await withAdmins([p.clientId], actor.uid), {
    type: "assigned",
    title: NOTIF_TITLE.assigned,
    body: locEvent((d) => d.events.assignedClient, { code: p.code }),
    projectId: id,
    projectCode: p.code,
    link: `/requests/${id}`,
  });
  await logActivity(actor, "assigned", "project", id, p.code, `${p.code} → ${employeeName}`);
  return { ok: true };
}

export async function updateFields(
  actor: Actor,
  id: string,
  fields: {
    fee?: number;
    estimatedValue?: number;
    method?: ValuationMethod;
    priority?: Priority;
  },
) {
  const p = await getProject(id);
  if (!canStaffEdit(actor, p)) throw new HttpError(403, "Not allowed");
  if (fields.fee !== undefined && !isAdmin(actor))
    throw new HttpError(403, "Only admins can set fees");

  const update: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };
  const entries = [];
  if (fields.fee !== undefined) {
    update.fee = fields.fee;
    entries.push(tEntry("fee", actor, { note: String(fields.fee) }));
  }
  if (fields.estimatedValue !== undefined) {
    update.estimatedValue = fields.estimatedValue;
    entries.push(tEntry("value", actor, { note: String(fields.estimatedValue) }));
  }
  if (fields.method !== undefined) {
    update.method = fields.method;
    entries.push(tEntry("method", actor, { note: fields.method }));
  }
  if (fields.priority !== undefined) update.priority = fields.priority;
  if (entries.length) update.timeline = FieldValue.arrayUnion(...entries);
  await adminDb.collection(COL.projects).doc(id).update(update);

  if (fields.fee !== undefined) {
    await notifyUsers(await withAdmins([p.clientId], actor.uid), {
      type: "fee_set",
      title: NOTIF_TITLE.fee_set,
      body: locEvent((d) => d.events.feeSet, { code: p.code }),
      projectId: id,
      projectCode: p.code,
      link: `/requests/${id}`,
    });
  }
  await logActivity(actor, "updated", "project", id, p.code, `Updated ${p.code}`);
  return { ok: true };
}

export async function addNote(actor: Actor, id: string, note: string) {
  const p = await getProject(id);
  if (!canStaffEdit(actor, p)) throw new HttpError(403, "Not allowed");
  if (!note.trim()) throw new HttpError(400, "Empty note");
  await adminDb.collection(COL.projects).doc(id).update({
    updatedAt: FieldValue.serverTimestamp(),
    timeline: FieldValue.arrayUnion(tEntry("note", actor, { note })),
  });
  return { ok: true };
}

export async function attachDocument(
  actor: Actor,
  id: string,
  doc: Omit<ProjectDocument, "id" | "uploadedAt" | "uploadedBy" | "uploadedByName">,
) {
  const p = await getProject(id);
  if (!isParticipant(actor, p)) throw new HttpError(403, "Not allowed");
  const full: ProjectDocument = {
    ...doc,
    id: rid(),
    uploadedAt: Date.now(),
    uploadedBy: actor.uid,
    uploadedByName: actor.name,
  };
  await adminDb.collection(COL.projects).doc(id).update({
    updatedAt: FieldValue.serverTimestamp(),
    documents: FieldValue.arrayUnion(full),
    timeline: FieldValue.arrayUnion(tEntry("document", actor, { note: doc.name })),
  });
  // Notify the "other side"
  const recipients = await withAdmins([p.clientId, p.assignedTo], actor.uid);
  await notifyUsers(recipients, {
    type: "document",
    title: NOTIF_TITLE.document,
    body: locEvent((d) => d.events.documentUploaded, { code: p.code }),
    projectId: id,
    projectCode: p.code,
    link: `/requests/${id}`,
  });
  return { ok: true, document: full };
}

export async function attachReport(
  actor: Actor,
  id: string,
  report: Omit<ProjectReport, "id" | "uploadedAt" | "uploadedByName">,
) {
  const p = await getProject(id);
  if (!canStaffEdit(actor, p)) throw new HttpError(403, "Not allowed");
  const full: ProjectReport = {
    ...report,
    id: rid(),
    uploadedAt: Date.now(),
    uploadedByName: actor.name,
  };
  const update: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
    reports: FieldValue.arrayUnion(full),
    timeline: FieldValue.arrayUnion(tEntry("report", actor, { note: report.name })),
  };
  if (report.type === "final" || report.type === "certificate") {
    update.status = "report_ready";
  }
  await adminDb.collection(COL.projects).doc(id).update(update);
  await notifyUsers(await withAdmins([p.clientId], actor.uid), {
    type: "report_ready",
    title: NOTIF_TITLE.report_ready,
    body: locEvent((d) => d.events.reportReady, { code: p.code }),
    projectId: id,
    projectCode: p.code,
    link: `/requests/${id}`,
  });
  await logActivity(actor, "report_uploaded", "project", id, p.code, `Report for ${p.code}`);
  return { ok: true, report: full };
}

export async function saveValuation(
  actor: Actor,
  id: string,
  patch: Partial<ValuationData>,
) {
  const p = await getProject(id);
  if (!canStaffEdit(actor, p)) throw new HttpError(403, "Not allowed");
  const update: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
    "valuation.updatedAt": Date.now(),
  };
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) update[`valuation.${k}`] = v;
  }
  if (patch.finalValue !== undefined) update.estimatedValue = patch.finalValue;
  await adminDb.collection(COL.projects).doc(id).update(update);
  await logActivity(
    actor,
    "valuation_saved",
    "project",
    id,
    p.code,
    `Valuation updated · ${p.code}`,
  );
  return { ok: true };
}

export async function sendMessage(actor: Actor, id: string, text: string) {
  const p = await getProject(id);
  if (!isParticipant(actor, p)) throw new HttpError(403, "Not allowed");
  if (!text.trim()) throw new HttpError(400, "Empty message");
  await adminDb.collection(COL.messages(id)).add({
    text: text.trim(),
    senderId: actor.uid,
    senderName: actor.name,
    senderRole: actor.role,
    at: FieldValue.serverTimestamp(),
  });
  await adminDb
    .collection(COL.projects)
    .doc(id)
    .update({ updatedAt: FieldValue.serverTimestamp() });
  // The direct conversation counterpart is emailed (Resend); admins get a
  // silent in-app/push oversight copy (no email-per-message spam).
  const isClientActor = actor.uid === p.clientId;
  const admins = await getAdminUids();
  let direct: string[];
  let oversight: string[];
  if (isClientActor) {
    direct = p.assignedTo ? [p.assignedTo] : admins;
    oversight = p.assignedTo ? admins : [];
  } else {
    direct = [p.clientId];
    oversight = admins;
  }
  direct = Array.from(new Set(direct)).filter((u) => u && u !== actor.uid);
  oversight = Array.from(new Set(oversight)).filter(
    (u) => u && u !== actor.uid && !direct.includes(u),
  );

  const messageBody = locEvent((d) => d.events.newMessage, {
    code: p.code,
    name: actor.name,
  });
  await notifyUsers(direct, {
    type: "message",
    title: NOTIF_TITLE.message,
    body: messageBody,
    projectId: id,
    projectCode: p.code,
    link: `/requests/${id}`,
    email: true,
  });
  if (oversight.length) {
    await notifyUsers(oversight, {
      type: "message",
      title: NOTIF_TITLE.message,
      body: messageBody,
      projectId: id,
      projectCode: p.code,
      link: `/requests/${id}`,
      email: false,
    });
  }
  return { ok: true };
}
