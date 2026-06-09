import "server-only";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { COL } from "@/lib/firebase/firestore";
import { logActivity, HttpError, type Actor } from "./projects";
import { notifyUsers } from "./notify";
import { makeInvoiceNumber } from "@/lib/types";
import type { ActivityEntity } from "@/lib/types";

export type CrmEntity =
  | "leads"
  | "contacts"
  | "companies"
  | "deals"
  | "tasks"
  | "invoices"
  | "events";

const ENTITY_COL: Record<CrmEntity, string> = {
  leads: COL.leads,
  contacts: COL.contacts,
  companies: COL.companies,
  deals: COL.deals,
  tasks: COL.tasks,
  invoices: COL.invoices,
  events: COL.events,
};

const ENTITY_ACT: Record<CrmEntity, ActivityEntity> = {
  leads: "lead",
  contacts: "contact",
  companies: "company",
  deals: "deal",
  tasks: "task",
  invoices: "invoice",
  events: "task",
};

function assertStaff(a: Actor) {
  if (a.role !== "admin" && a.role !== "employee")
    throw new HttpError(403, "Staff only");
}

function clean(data: Record<string, unknown>) {
  const copy = { ...(data || {}) };
  delete copy.id;
  delete copy.createdAt;
  delete copy.updatedAt;
  return copy;
}

function labelOf(data: Record<string, unknown>): string {
  return String(
    data.name || data.title || data.number || data.clientName || "",
  );
}

async function nextSeq(kind: string, year: number): Promise<number> {
  const ref = adminDb.collection(COL.counters).doc(`${kind}-${year}`);
  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const cur = snap.exists ? (snap.data()?.seq as number) || 0 : 0;
    tx.set(ref, { seq: cur + 1 }, { merge: true });
    return cur + 1;
  });
}

export async function crmCreate(
  actor: Actor,
  entity: CrmEntity,
  data: Record<string, unknown>,
) {
  assertStaff(actor);
  const col = ENTITY_COL[entity];
  if (!col) throw new HttpError(400, "Unknown entity");

  const base: Record<string, unknown> = {
    ...clean(data),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (entity === "invoices") {
    const year = new Date().getFullYear();
    const seq = await nextSeq("INV", year);
    base.number = makeInvoiceNumber(seq, year);
    if (!base.status) base.status = "draft";
    if (!base.currency) base.currency = "SAR";
  }
  if (entity === "tasks") {
    base.createdBy = actor.uid;
    base.createdByName = actor.name;
    if (!base.status) base.status = "todo";
    if (!base.priority) base.priority = "normal";
  }
  if (entity === "deals") {
    if (!base.ownerId) {
      base.ownerId = actor.uid;
      base.ownerName = actor.name;
    }
    if (!base.currency) base.currency = "SAR";
    if (!base.stage) base.stage = "lead";
  }
  if (entity === "leads" && !base.status) base.status = "new";

  const ref = await adminDb.collection(col).add(base);
  await logActivity(
    actor,
    `${entity}_created`,
    ENTITY_ACT[entity],
    ref.id,
    labelOf(data),
    `Created ${entity.slice(0, -1)}: ${labelOf(data)}`,
  );

  // Light cross-notifications
  if (entity === "tasks" && data.assignedTo && data.assignedTo !== actor.uid) {
    await notifyUsers([String(data.assignedTo)], {
      type: "status_changed",
      title: { ar: "مهمة جديدة", en: "New task assigned" },
      body: {
        ar: String(data.title || ""),
        en: String(data.title || ""),
      },
      link: "/tasks",
    });
  }

  return { id: ref.id };
}

export async function crmUpdate(
  actor: Actor,
  entity: CrmEntity,
  id: string,
  data: Record<string, unknown>,
) {
  assertStaff(actor);
  const col = ENTITY_COL[entity];
  if (!col) throw new HttpError(400, "Unknown entity");
  await adminDb
    .collection(col)
    .doc(id)
    .update({ ...clean(data), updatedAt: FieldValue.serverTimestamp() });
  await logActivity(
    actor,
    `${entity}_updated`,
    ENTITY_ACT[entity],
    id,
    labelOf(data),
    `Updated ${entity.slice(0, -1)}`,
  );

  if (entity === "tasks" && data.assignedTo && data.assignedTo !== actor.uid) {
    await notifyUsers([String(data.assignedTo)], {
      type: "status_changed",
      title: { ar: "تحديث مهمة", en: "Task updated" },
      body: { ar: String(data.title || ""), en: String(data.title || "") },
      link: "/tasks",
    });
  }
  return { ok: true };
}

export async function crmDelete(actor: Actor, entity: CrmEntity, id: string) {
  if (actor.role !== "admin") throw new HttpError(403, "Only admins can delete");
  const col = ENTITY_COL[entity];
  if (!col) throw new HttpError(400, "Unknown entity");
  await adminDb.collection(col).doc(id).delete();
  await logActivity(actor, `${entity}_deleted`, ENTITY_ACT[entity], id, "", `Deleted ${entity.slice(0, -1)}`);
  return { ok: true };
}
