import { formatDistanceToNow, format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import type { Locale } from "@/i18n/config";

const dfLocale = (l: Locale) => (l === "ar" ? ar : enUS);

export function timeAgo(ms: number, locale: Locale): string {
  if (!ms) return "";
  return formatDistanceToNow(ms, { addSuffix: true, locale: dfLocale(locale) });
}

export function fmtDate(ms: number, locale: Locale): string {
  if (!ms) return "—";
  return format(ms, "d MMM yyyy", { locale: dfLocale(locale) });
}

export function fmtDateTime(ms: number, locale: Locale): string {
  if (!ms) return "—";
  return format(ms, "d MMM yyyy · HH:mm", { locale: dfLocale(locale) });
}

export function fmtMoney(n: number | null | undefined, locale: Locale): string {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtNumber(n: number | null | undefined, locale: Locale): string {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US").format(n);
}

export function fmtArea(n: number | null | undefined, locale: Locale): string {
  if (n === null || n === undefined) return "—";
  return `${fmtNumber(n, locale)} ${locale === "ar" ? "م²" : "m²"}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
