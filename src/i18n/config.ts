export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";

export type Dir = "rtl" | "ltr";

export const localeMeta: Record<
  Locale,
  { label: string; native: string; dir: Dir; short: string; flag: string }
> = {
  ar: { label: "Arabic", native: "العربية", dir: "rtl", short: "ع", flag: "🇸🇦" },
  en: { label: "English", native: "English", dir: "ltr", short: "EN", flag: "🇬🇧" },
};

export function dirFor(locale: Locale): Dir {
  return locale === "ar" ? "rtl" : "ltr";
}

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (locales as readonly string[]).includes(v);
}

/** A piece of content available in both languages. */
export type LocalizedText = { ar: string; en: string };

export function pick(text: LocalizedText | string, locale: Locale): string {
  return typeof text === "string" ? text : text[locale];
}

export const LOCALE_COOKIE = "edarah_locale";

/** Interpolate `{token}` placeholders in a template string. */
export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}
