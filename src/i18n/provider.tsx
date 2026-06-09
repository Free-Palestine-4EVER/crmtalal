"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { en, type Dictionary } from "./dictionaries/en";
import { ar } from "./dictionaries/ar";
import {
  type Locale,
  type Dir,
  type LocalizedText,
  defaultLocale,
  dirFor,
  isLocale,
  LOCALE_COOKIE,
} from "./config";

const dicts: Record<Locale, Dictionary> = { en, ar };

type I18nContextValue = {
  locale: Locale;
  dir: Dir;
  isRTL: boolean;
  dict: Dictionary;
  setLocale: (l: Locale) => void;
  toggle: () => void;
  /** Pick the right string from a {ar,en} object. */
  L: (text: LocalizedText | string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function LocaleProvider({
  initialLocale = defaultLocale,
  children,
}: {
  initialLocale?: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const applyLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof document !== "undefined") {
      const dir = dirFor(l);
      document.documentElement.lang = l;
      document.documentElement.dir = dir;
      document.cookie = `${LOCALE_COOKIE}=${l};path=/;max-age=31536000;samesite=lax`;
      try {
        localStorage.setItem(LOCALE_COOKIE, l);
      } catch {
        /* ignore */
      }
    }
  }, []);

  // On mount, reconcile with a stored preference (covers static first paint).
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(LOCALE_COOKIE);
    } catch {
      /* ignore */
    }
    if (isLocale(stored) && stored !== locale) applyLocale(stored);
    else applyLocale(locale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const dir = dirFor(locale);
    return {
      locale,
      dir,
      isRTL: locale === "ar",
      dict: dicts[locale],
      setLocale: applyLocale,
      toggle: () => applyLocale(locale === "ar" ? "en" : "ar"),
      L: (text) => (typeof text === "string" ? text : text[locale]),
    };
  }, [locale, applyLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <LocaleProvider>");
  return ctx;
}

export const useDict = () => useI18n().dict;
export const useLocale = () => useI18n().locale;
export const useLocalize = () => useI18n().L;
