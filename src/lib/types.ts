import type { BadgeTone } from "@/components/ui/Badge";
import type { Locale } from "@/i18n/config";

/* ============================================================
   Roles & Users
   ============================================================ */
export type Role = "client" | "employee" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  company?: string;
  title?: string; // e.g. "Certified Valuer" (employees)
  role: Role;
  active: boolean;
  locale?: Locale;
  photoURL?: string;
  createdAt: number;
}

/* ============================================================
   Valuation projects (requests)
   ============================================================ */
export type ProjectStatus =
  | "submitted"
  | "under_review"
  | "assigned"
  | "in_progress"
  | "site_visit"
  | "analysis"
  | "report_ready"
  | "completed"
  | "rejected"
  | "cancelled";

export type Stage = "pre" | "execution" | "post";

export type PropertyType =
  | "land"
  | "villa"
  | "palace"
  | "apartment"
  | "building"
  | "tower"
  | "hotel"
  | "compound"
  | "warehouse"
  | "industrial"
  | "mixedUse"
  | "project"
  | "commercial"
  | "reit";

export type Purpose =
  | "financing"
  | "insurance"
  | "litigation"
  | "inheritance"
  | "taxation"
  | "arbitration"
  | "sale"
  | "purchase"
  | "development"
  | "investment"
  | "internal";

export type ValuationMethod = "market" | "cost" | "income";
export type Priority = "normal" | "high" | "urgent";

export interface ProjectDocument {
  id: string;
  name: string;
  url: string;
  path: string;
  size: number;
  contentType: string;
  uploadedAt: number;
  uploadedBy: string;
  uploadedByName: string;
}

export type ReportType = "draft" | "final" | "certificate";

export interface ProjectReport {
  id: string;
  name: string;
  url: string;
  path: string;
  type: ReportType;
  uploadedAt: number;
  uploadedByName: string;
}

export type TimelineKind =
  | "created"
  | "status"
  | "assign"
  | "note"
  | "document"
  | "report"
  | "fee"
  | "value"
  | "method";

export interface TimelineEntry {
  id: string;
  kind: TimelineKind;
  at: number;
  byName: string;
  byRole: Role | "system";
  status?: ProjectStatus;
  note?: string;
}

export interface Project {
  id: string;
  code: string;
  clientId: string;
  clientName: string;
  clientCompany?: string;
  title: string;
  propertyType: PropertyType;
  purpose: Purpose;
  region?: string;
  city?: string;
  district?: string;
  address?: string;
  area?: number;
  areaUnit: "sqm";
  description?: string;
  priority: Priority;
  status: ProjectStatus;
  assignedTo?: string;
  assignedToName?: string;
  method?: ValuationMethod;
  estimatedValue?: number;
  currency: "SAR";
  fee?: number;
  documents: ProjectDocument[];
  reports: ProjectReport[];
  timeline: TimelineEntry[];
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  at: number;
}

/* ============================================================
   Notifications
   ============================================================ */
export type NotificationType =
  | "request_created"
  | "assigned"
  | "status_changed"
  | "report_ready"
  | "completed"
  | "message"
  | "document"
  | "new_client"
  | "fee_set";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: { ar: string; en: string };
  body: { ar: string; en: string };
  projectId?: string;
  projectCode?: string;
  link?: string;
  read: boolean;
  createdAt: number;
}

/* ============================================================
   Status helpers
   ============================================================ */
export const STATUS_FLOW: ProjectStatus[] = [
  "submitted",
  "under_review",
  "assigned",
  "in_progress",
  "site_visit",
  "analysis",
  "report_ready",
  "completed",
];

export const TERMINAL_STATUSES: ProjectStatus[] = ["rejected", "cancelled"];

export function statusIndex(status: ProjectStatus): number {
  return STATUS_FLOW.indexOf(status);
}

export function statusStage(status: ProjectStatus): Stage | "closed" {
  if (status === "rejected" || status === "cancelled") return "closed";
  if (["submitted", "under_review", "assigned"].includes(status)) return "pre";
  if (status === "completed") return "post";
  return "execution";
}

export function nextStatus(status: ProjectStatus): ProjectStatus | null {
  const i = statusIndex(status);
  if (i < 0 || i >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[i + 1];
}

export function isActive(status: ProjectStatus): boolean {
  return status !== "completed" && !TERMINAL_STATUSES.includes(status);
}

export const STATUS_TONE: Record<ProjectStatus, BadgeTone> = {
  submitted: "info",
  under_review: "info",
  assigned: "gold",
  in_progress: "gold",
  site_visit: "gold",
  analysis: "gold",
  report_ready: "caution",
  completed: "positive",
  rejected: "critical",
  cancelled: "neutral",
};

export const PRIORITY_TONE: Record<Priority, BadgeTone> = {
  normal: "neutral",
  high: "caution",
  urgent: "critical",
};

/* Lists for form selects */
export const PROPERTY_TYPES: PropertyType[] = [
  "land",
  "villa",
  "palace",
  "apartment",
  "building",
  "tower",
  "hotel",
  "compound",
  "warehouse",
  "industrial",
  "mixedUse",
  "project",
  "commercial",
  "reit",
];

export const PURPOSES: Purpose[] = [
  "financing",
  "insurance",
  "litigation",
  "inheritance",
  "taxation",
  "arbitration",
  "sale",
  "purchase",
  "development",
  "investment",
  "internal",
];

export const METHODS: ValuationMethod[] = ["market", "cost", "income"];
export const PRIORITIES: Priority[] = ["normal", "high", "urgent"];

/** Saudi regions for the request form. */
export const SAUDI_REGIONS = [
  { ar: "الرياض", en: "Riyadh" },
  { ar: "مكة المكرمة", en: "Makkah" },
  { ar: "المدينة المنورة", en: "Madinah" },
  { ar: "المنطقة الشرقية", en: "Eastern Province" },
  { ar: "القصيم", en: "Qassim" },
  { ar: "عسير", en: "Asir" },
  { ar: "تبوك", en: "Tabuk" },
  { ar: "حائل", en: "Hail" },
  { ar: "جازان", en: "Jazan" },
  { ar: "نجران", en: "Najran" },
  { ar: "الباحة", en: "Al Bahah" },
  { ar: "الجوف", en: "Al Jouf" },
  { ar: "الحدود الشمالية", en: "Northern Borders" },
  { ar: "خارج المملكة", en: "Outside KSA" },
];

/** Human-friendly reference code, e.g. EV-2026-0042 */
export function makeProjectCode(seq: number, year: number): string {
  return `EV-${year}-${String(seq).padStart(4, "0")}`;
}

/* ============================================================
   CRM ENTITIES — leads, contacts, companies, deals, tasks,
   activities, invoices, calendar events
   ============================================================ */

export type LeadSource =
  | "website"
  | "whatsapp"
  | "phone"
  | "referral"
  | "campaign"
  | "manual";
export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "lost";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  propertyType?: string;
  purpose?: string;
  message?: string;
  region?: string;
  source: LeadSource;
  status: LeadStatus;
  assignedTo?: string;
  assignedToName?: string;
  note?: string;
  convertedClientId?: string;
  createdAt: number;
  updatedAt: number;
}

export type ContactType = "client" | "partner" | "lead" | "vendor" | "other";

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  companyId?: string;
  title?: string;
  type: ContactType;
  tags?: string[];
  ownerId?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type CompanyType =
  | "client"
  | "partner"
  | "bank"
  | "developer"
  | "government"
  | "fund"
  | "other";

export interface Company {
  id: string;
  name: string;
  type: CompanyType;
  sector?: string;
  website?: string;
  phone?: string;
  email?: string;
  city?: string;
  contactsCount?: number;
  dealsValue?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type DealStage =
  | "lead"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export interface Deal {
  id: string;
  title: string;
  clientName: string;
  companyId?: string;
  value?: number;
  currency: "SAR";
  stage: DealStage;
  probability?: number;
  ownerId?: string;
  ownerName?: string;
  expectedCloseAt?: number;
  projectId?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueAt?: number;
  assignedTo?: string;
  assignedToName?: string;
  relatedProjectId?: string;
  relatedProjectCode?: string;
  createdBy: string;
  createdByName: string;
  createdAt: number;
  completedAt?: number;
}

export type ActivityEntity =
  | "project"
  | "lead"
  | "contact"
  | "company"
  | "deal"
  | "task"
  | "invoice"
  | "user";

export interface Activity {
  id: string;
  type: string;
  actorId: string;
  actorName: string;
  actorRole: Role | "system";
  entity: ActivityEntity;
  entityId?: string;
  entityLabel?: string;
  summary: string;
  at: number;
}

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "cancelled";

export interface InvoiceItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  number: string;
  clientId?: string;
  clientName: string;
  projectId?: string;
  projectCode?: string;
  items: InvoiceItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  currency: "SAR";
  status: InvoiceStatus;
  issuedAt?: number;
  dueAt?: number;
  paidAt?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type CalendarEventType =
  | "site_visit"
  | "meeting"
  | "deadline"
  | "call"
  | "other";

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  start: number;
  end?: number;
  allDay?: boolean;
  projectId?: string;
  projectCode?: string;
  clientName?: string;
  assignedTo?: string;
  assignedToName?: string;
  location?: string;
  notes?: string;
  createdBy: string;
  createdAt: number;
}

/* ---- CRM lists + badge tones ---- */
export const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
];
export const LEAD_STATUS_TONE: Record<LeadStatus, BadgeTone> = {
  new: "info",
  contacted: "gold",
  qualified: "steel",
  converted: "positive",
  lost: "critical",
};

export const DEAL_STAGES: DealStage[] = [
  "lead",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
];
export const DEAL_STAGE_TONE: Record<DealStage, BadgeTone> = {
  lead: "info",
  qualified: "steel",
  proposal: "gold",
  negotiation: "caution",
  won: "positive",
  lost: "critical",
};

export const TASK_STATUSES: TaskStatus[] = [
  "todo",
  "in_progress",
  "done",
  "cancelled",
];
export const TASK_STATUS_TONE: Record<TaskStatus, BadgeTone> = {
  todo: "neutral",
  in_progress: "gold",
  done: "positive",
  cancelled: "critical",
};

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
];
export const INVOICE_STATUS_TONE: Record<InvoiceStatus, BadgeTone> = {
  draft: "neutral",
  sent: "info",
  paid: "positive",
  overdue: "critical",
  cancelled: "neutral",
};

export const CONTACT_TYPES: ContactType[] = [
  "client",
  "partner",
  "lead",
  "vendor",
  "other",
];
export const COMPANY_TYPES: CompanyType[] = [
  "client",
  "partner",
  "bank",
  "developer",
  "government",
  "fund",
  "other",
];
export const CALENDAR_EVENT_TYPES: CalendarEventType[] = [
  "site_visit",
  "meeting",
  "deadline",
  "call",
  "other",
];

export function makeInvoiceNumber(seq: number, year: number): string {
  return `INV-${year}-${String(seq).padStart(4, "0")}`;
}
