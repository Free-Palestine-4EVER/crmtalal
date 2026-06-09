import type { Dictionary } from "@/i18n/dictionaries/en";

/**
 * Map a Firebase Auth error code to a localized, human-friendly message.
 * Falls back to a generic message for anything unrecognized.
 */
export function authErrorMessage(code: string, d: Dictionary): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return d.auth.invalidCredentials;
    case "auth/email-already-in-use":
      return d.auth.emailInUse;
    case "auth/weak-password":
      return d.auth.weakPassword;
    case "auth/too-many-requests":
      return d.auth.genericError;
    default:
      return d.auth.genericError;
  }
}
