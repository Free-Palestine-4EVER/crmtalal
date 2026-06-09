import { cookies } from "next/headers";
import { defaultLocale, isLocale, type Locale, LOCALE_COOKIE } from "./config";

/** Read the persisted locale on the server (root layout / metadata). */
export async function getInitialLocale(): Promise<Locale> {
  try {
    const store = await cookies();
    const v = store.get(LOCALE_COOKIE)?.value;
    if (isLocale(v)) return v;
  } catch {
    /* ignore */
  }
  return defaultLocale;
}
