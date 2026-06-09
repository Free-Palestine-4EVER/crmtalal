import type { LeadSource } from "@/lib/types";

/** Ordered lead sources for the form Select (types.ts has no list export). */
export const LEAD_SOURCES_PRESENT: LeadSource[] = [
  "website",
  "whatsapp",
  "phone",
  "referral",
  "campaign",
  "manual",
];
