"use client";

import type { LocalizedText } from "@/i18n/config";
import type { BadgeTone } from "@/components/ui/Badge";
import type {
  LeadStatus,
  LeadSource,
  ContactType,
  TaskStatus,
  CalendarEventType,
} from "@/lib/types";

/* ============================================================
   Bilingual labels for CRM enums that aren't in the shared dict.
   Render with L(map[value]) using L from useI18n().
   ============================================================ */

export const LEAD_STATUS_LABEL: Record<LeadStatus, LocalizedText> = {
  new: { ar: "جديد", en: "New" },
  contacted: { ar: "تم التواصل", en: "Contacted" },
  qualified: { ar: "مؤهل", en: "Qualified" },
  converted: { ar: "تم التحويل", en: "Converted" },
  lost: { ar: "مفقود", en: "Lost" },
};

export const LEAD_SOURCE_LABEL: Record<LeadSource, LocalizedText> = {
  website: { ar: "الموقع الإلكتروني", en: "Website" },
  whatsapp: { ar: "واتساب", en: "WhatsApp" },
  phone: { ar: "هاتف", en: "Phone" },
  referral: { ar: "إحالة", en: "Referral" },
  campaign: { ar: "حملة إعلانية", en: "Campaign" },
  manual: { ar: "إدخال يدوي", en: "Manual" },
};

export const CONTACT_TYPE_LABEL: Record<ContactType, LocalizedText> = {
  client: { ar: "عميل", en: "Client" },
  partner: { ar: "شريك", en: "Partner" },
  lead: { ar: "عميل محتمل", en: "Lead" },
  vendor: { ar: "مورّد", en: "Vendor" },
  other: { ar: "أخرى", en: "Other" },
};

export const CONTACT_TYPE_TONE: Record<
  ContactType,
  "gold" | "info" | "steel" | "positive" | "neutral"
> = {
  client: "positive",
  partner: "gold",
  lead: "info",
  vendor: "steel",
  other: "neutral",
};

/* ---- Tasks ---- */
export const TASK_STATUS_LABEL: Record<TaskStatus, LocalizedText> = {
  todo: { ar: "قيد الانتظار", en: "To do" },
  in_progress: { ar: "قيد التنفيذ", en: "In progress" },
  done: { ar: "مكتملة", en: "Done" },
  cancelled: { ar: "ملغاة", en: "Cancelled" },
};

/* ---- Calendar events ---- */
export const CALENDAR_EVENT_TYPE_LABEL: Record<
  CalendarEventType,
  LocalizedText
> = {
  site_visit: { ar: "زيارة ميدانية", en: "Site visit" },
  meeting: { ar: "اجتماع", en: "Meeting" },
  deadline: { ar: "موعد نهائي", en: "Deadline" },
  call: { ar: "مكالمة", en: "Call" },
  other: { ar: "أخرى", en: "Other" },
};

export const CALENDAR_EVENT_TYPE_TONE: Record<CalendarEventType, BadgeTone> = {
  site_visit: "gold",
  meeting: "info",
  deadline: "critical",
  call: "steel",
  other: "neutral",
};

/* Tailwind classes for the small calendar chips, keyed by event type. */
export const CALENDAR_EVENT_CHIP: Record<CalendarEventType, string> = {
  site_visit: "bg-gold-500/15 text-gold-200 ring-gold-500/30",
  meeting: "bg-info/15 text-info ring-info/30",
  deadline: "bg-critical/15 text-critical ring-critical/30",
  call: "bg-steel-500/15 text-steel-200 ring-steel-500/30",
  other: "bg-ink-700/70 text-parch-100/80 ring-ink-600/60",
};

/* Field labels shared by the lead/contact forms + detail drawers. */
export const FIELD_LABEL = {
  name: { ar: "الاسم", en: "Name" },
  phone: { ar: "رقم الهاتف", en: "Phone" },
  email: { ar: "البريد الإلكتروني", en: "Email" },
  company: { ar: "الشركة / الجهة", en: "Company" },
  jobTitle: { ar: "المسمى الوظيفي", en: "Job title" },
  source: { ar: "المصدر", en: "Source" },
  status: { ar: "الحالة", en: "Status" },
  propertyType: { ar: "نوع العقار", en: "Property type" },
  purpose: { ar: "الغرض", en: "Purpose" },
  region: { ar: "المنطقة", en: "Region" },
  message: { ar: "الرسالة", en: "Message" },
  note: { ar: "ملاحظة", en: "Note" },
  notes: { ar: "ملاحظات", en: "Notes" },
  owner: { ar: "المسؤول", en: "Owner" },
  assigned: { ar: "مُسند إلى", en: "Assigned to" },
  created: { ar: "تاريخ الإنشاء", en: "Created" },
  unassigned: { ar: "غير مُسند", en: "Unassigned" },
  title: { ar: "العنوان", en: "Title" },
  description: { ar: "الوصف", en: "Description" },
  priority: { ar: "الأولوية", en: "Priority" },
  dueDate: { ar: "تاريخ الاستحقاق", en: "Due date" },
  project: { ar: "كود المشروع المرتبط", en: "Related project code" },
  type: { ar: "النوع", en: "Type" },
  start: { ar: "البداية", en: "Start" },
  end: { ar: "النهاية", en: "End" },
  location: { ar: "الموقع", en: "Location" },
  clientName: { ar: "اسم العميل", en: "Client" },
  createdBy: { ar: "أنشأها", en: "Created by" },
} satisfies Record<string, LocalizedText>;

/* A small bilingual phrase map for strings these two modules need but
   the shared dict doesn't carry. Render with L(). */
export const CRM_TEXT = {
  editTask: { ar: "تعديل المهمة", en: "Edit task" },
  editEvent: { ar: "تعديل الحدث", en: "Edit event" },
  taskDetails: { ar: "تفاصيل المهمة", en: "Task details" },
  eventDetails: { ar: "تفاصيل الحدث", en: "Event details" },
  assignedToMe: { ar: "المُسندة إليّ", en: "Assigned to me" },
  reopen: { ar: "إعادة فتح", en: "Reopen" },
  deleteTaskQ: { ar: "حذف هذه المهمة؟", en: "Delete this task?" },
  deleteEventQ: { ar: "حذف هذا الحدث؟", en: "Delete this event?" },
  deleteWarn: {
    ar: "لا يمكن التراجع عن هذا الإجراء.",
    en: "This action cannot be undone.",
  },
  titlePlaceholderTask: {
    ar: "مثال: متابعة تقرير التقييم",
    en: "e.g. Follow up on valuation report",
  },
  titlePlaceholderEvent: {
    ar: "مثال: زيارة موقع — حي العليا",
    en: "e.g. Site visit — Al Olaya",
  },
  projectPlaceholder: { ar: "EV-2026-0042", en: "EV-2026-0042" },
  events: { ar: "الأحداث", en: "Events" },
} satisfies Record<string, LocalizedText>;
