import {
  Timestamp,
  collection,
  doc,
  type DocumentData,
  type QueryDocumentSnapshot,
  type DocumentSnapshot,
} from "firebase/firestore";
import { db } from "./client";
import type {
  Project,
  UserProfile,
  AppNotification,
  Message,
} from "@/lib/types";

export const COL = {
  users: "users",
  projects: "projects",
  notifications: "notifications",
  counters: "counters",
  leads: "leads",
  contacts: "contacts",
  companies: "companies",
  deals: "deals",
  tasks: "tasks",
  activities: "activities",
  invoices: "invoices",
  events: "events",
  messages: (projectId: string) => `projects/${projectId}/messages`,
} as const;

/** Coerce Firestore Timestamp | number | null → epoch millis. */
export function ms(v: unknown): number {
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === "number") return v;
  if (v && typeof (v as { toMillis?: () => number }).toMillis === "function") {
    return (v as { toMillis: () => number }).toMillis();
  }
  return Date.now();
}

type Snap = QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>;

export function mapUser(snap: Snap): UserProfile {
  const d = snap.data() ?? {};
  return {
    uid: snap.id,
    email: d.email ?? "",
    name: d.name ?? "",
    phone: d.phone,
    company: d.company,
    title: d.title,
    role: d.role ?? "client",
    active: d.active ?? true,
    locale: d.locale,
    photoURL: d.photoURL,
    createdAt: ms(d.createdAt),
  };
}

export function mapProject(snap: Snap): Project {
  const d = snap.data() ?? {};
  return {
    id: snap.id,
    code: d.code ?? "",
    clientId: d.clientId ?? "",
    clientName: d.clientName ?? "",
    clientCompany: d.clientCompany,
    title: d.title ?? "",
    propertyType: d.propertyType ?? "land",
    purpose: d.purpose ?? "financing",
    region: d.region,
    city: d.city,
    district: d.district,
    address: d.address,
    area: d.area,
    areaUnit: d.areaUnit ?? "sqm",
    description: d.description,
    priority: d.priority ?? "normal",
    status: d.status ?? "submitted",
    assignedTo: d.assignedTo,
    assignedToName: d.assignedToName,
    method: d.method,
    estimatedValue: d.estimatedValue,
    currency: d.currency ?? "SAR",
    fee: d.fee,
    documents: d.documents ?? [],
    reports: d.reports ?? [],
    timeline: d.timeline ?? [],
    valuation: d.valuation ?? undefined,
    createdAt: ms(d.createdAt),
    updatedAt: ms(d.updatedAt),
  };
}

export function mapNotification(snap: Snap): AppNotification {
  const d = snap.data() ?? {};
  return {
    id: snap.id,
    userId: d.userId ?? "",
    type: d.type ?? "status_changed",
    title: d.title ?? { ar: "", en: "" },
    body: d.body ?? { ar: "", en: "" },
    projectId: d.projectId,
    projectCode: d.projectCode,
    link: d.link,
    read: d.read ?? false,
    createdAt: ms(d.createdAt),
  };
}

export function mapMessage(snap: Snap): Message {
  const d = snap.data() ?? {};
  return {
    id: snap.id,
    text: d.text ?? "",
    senderId: d.senderId ?? "",
    senderName: d.senderName ?? "",
    senderRole: d.senderRole ?? "client",
    at: ms(d.at),
  };
}

/* ---- Generic timestamp-aware mapper for CRM entities ---- */
function convertTs(v: unknown): unknown {
  if (v instanceof Timestamp) return v.toMillis();
  if (
    v &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    typeof (v as { toMillis?: () => number }).toMillis === "function"
  ) {
    return (v as { toMillis: () => number }).toMillis();
  }
  if (Array.isArray(v)) return v.map(convertTs);
  if (v && typeof v === "object") {
    const o: Record<string, unknown> = {};
    for (const k in v as Record<string, unknown>) {
      o[k] = convertTs((v as Record<string, unknown>)[k]);
    }
    return o;
  }
  return v;
}

/** Map any document to an app entity, converting Timestamps → millis. */
export function mapDoc<T>(snap: Snap): T {
  const data = (snap.data() ?? {}) as Record<string, unknown>;
  return { id: snap.id, ...(convertTs(data) as Record<string, unknown>) } as T;
}

/* Convenience ref helpers (only call when firebaseEnabled) */
export const usersCol = () => collection(db, COL.users);
export const projectsCol = () => collection(db, COL.projects);
export const notificationsCol = () => collection(db, COL.notifications);
export const userDoc = (uid: string) => doc(db, COL.users, uid);
export const projectDoc = (id: string) => doc(db, COL.projects, id);
export const messagesCol = (projectId: string) =>
  collection(db, COL.messages(projectId));
