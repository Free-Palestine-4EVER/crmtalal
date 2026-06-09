import type { BadgeTone } from "@/components/ui/Badge";
import type { CompanyType } from "@/lib/types";

/** Badge tone per company type. */
export const COMPANY_TYPE_TONE: Record<CompanyType, BadgeTone> = {
  client: "gold",
  partner: "positive",
  bank: "info",
  developer: "steel",
  government: "caution",
  fund: "neutral",
  other: "neutral",
};

/** Ensure a website value is a navigable absolute URL. */
export function websiteHref(url: string): string {
  const v = url.trim();
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

/** Strip protocol + trailing slash for a tidy display label. */
export function websiteLabel(url: string): string {
  return url
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");
}
