import type { Dictionary } from "@/i18n/dictionaries/en";
import { ApiError } from "@/lib/api";

/**
 * Map a Firebase Auth error code to a localized, human-friendly message.
 */
export function authErrorMessage(code: string, d: Dictionary): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return d.auth.invalidCredentials;
    case "auth/email-already-in-use":
      return d.auth.emailInUse;
    case "auth/weak-password":
      return d.auth.weakPassword;
    case "auth/operation-not-allowed":
      return d.auth.methodDisabled;
    case "auth/network-request-failed":
      return d.auth.networkError;
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
    case "auth/user-cancelled":
      return d.auth.popupClosed;
    case "auth/too-many-requests":
    default:
      return d.auth.genericError;
  }
}

/**
 * Best-effort message for any sign-in / registration failure — including
 * server-side errors from our own API routes (e.g. Admin SDK not configured),
 * so the real cause surfaces instead of a generic "can't authenticate".
 */
export function describeAuthError(err: unknown, d: Dictionary): string {
  if (err instanceof ApiError) {
    if (err.status === 503) return d.auth.serverNotConfigured;
    return err.message || d.auth.genericError;
  }
  const code = (err as { code?: string })?.code ?? "";
  return authErrorMessage(code, d);
}
