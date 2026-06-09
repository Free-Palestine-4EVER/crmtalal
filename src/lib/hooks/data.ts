"use client";

import { where, orderBy, limit } from "firebase/firestore";
import { useAuth } from "@/lib/auth/AuthProvider";
import { COL } from "@/lib/firebase/firestore";
import { isStaff } from "@/lib/roles";
import { useCollection, useDocument } from "./firestore";
import type {
  Project,
  AppNotification,
  Lead,
  Contact,
  Company,
  Deal,
  Task,
  Invoice,
  CalendarEvent,
  UserProfile,
  Activity,
  Message,
  Role,
  OrgSettings,
} from "@/lib/types";
import { DEFAULT_ORG } from "@/lib/types";

/* ---- Projects (role-scoped) ---- */
export function useProjects() {
  const { user, role } = useAuth();
  const uid = user?.uid;
  const constraints =
    role === "client"
      ? [where("clientId", "==", uid), orderBy("updatedAt", "desc")]
      : role === "employee"
        ? [where("assignedTo", "==", uid), orderBy("updatedAt", "desc")]
        : [orderBy("updatedAt", "desc")];
  return useCollection<Project>(uid && role ? COL.projects : null, constraints, [
    uid,
    role,
  ]);
}

export function useProject(id: string | null | undefined) {
  return useDocument<Project>(id ? `${COL.projects}/${id}` : null, [id]);
}

export function useMessages(projectId: string | null | undefined) {
  return useCollection<Message>(
    projectId ? COL.messages(projectId) : null,
    [orderBy("at", "asc")],
    [projectId],
  );
}

/* ---- Notifications ---- */
export function useNotifications(max = 40) {
  const { user } = useAuth();
  const uid = user?.uid;
  return useCollection<AppNotification>(
    uid ? COL.notifications : null,
    [where("userId", "==", uid), orderBy("createdAt", "desc"), limit(max)],
    [uid, max],
  );
}

/* ---- Staff-only CRM collections ---- */
function staffPath(role: Role | null, path: string) {
  return isStaff(role) ? path : null;
}

export function useLeads() {
  const { role } = useAuth();
  return useCollection<Lead>(
    staffPath(role, COL.leads),
    [orderBy("createdAt", "desc")],
    [role],
  );
}

export function useContacts() {
  const { role } = useAuth();
  return useCollection<Contact>(
    staffPath(role, COL.contacts),
    [orderBy("createdAt", "desc")],
    [role],
  );
}

export function useCompanies() {
  const { role } = useAuth();
  return useCollection<Company>(
    staffPath(role, COL.companies),
    [orderBy("createdAt", "desc")],
    [role],
  );
}

export function useDeals() {
  const { role } = useAuth();
  return useCollection<Deal>(
    staffPath(role, COL.deals),
    [orderBy("updatedAt", "desc")],
    [role],
  );
}

export function useTasks() {
  const { role } = useAuth();
  return useCollection<Task>(
    staffPath(role, COL.tasks),
    [orderBy("createdAt", "desc")],
    [role],
  );
}

export function useInvoices() {
  const { role } = useAuth();
  return useCollection<Invoice>(
    staffPath(role, COL.invoices),
    [orderBy("createdAt", "desc")],
    [role],
  );
}

export function useEvents() {
  const { role } = useAuth();
  return useCollection<CalendarEvent>(
    staffPath(role, COL.events),
    [orderBy("start", "asc")],
    [role],
  );
}

export function useActivities(max = 50) {
  const { role } = useAuth();
  return useCollection<Activity>(
    staffPath(role, COL.activities),
    [orderBy("at", "desc"), limit(max)],
    [role, max],
  );
}

/* ---- Users (admin) ---- */
export function useUsersByRole(targetRole: Role) {
  const { role } = useAuth();
  return useCollection<UserProfile>(
    role === "admin" ? COL.users : null,
    [where("role", "==", targetRole), orderBy("createdAt", "desc")],
    [role, targetRole],
  );
}

/* ---- Organization settings (merged with defaults) ---- */
export function useOrgSettings(): { org: OrgSettings; loading: boolean } {
  const { data, loading } = useDocument<OrgSettings>(
    `${COL.settings}/org`,
    [],
  );
  return { org: { ...DEFAULT_ORG, ...(data ?? {}) }, loading };
}
