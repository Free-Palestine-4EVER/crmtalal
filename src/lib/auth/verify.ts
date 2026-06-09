import "server-only";
import { NextResponse } from "next/server";
import { adminAuth, adminDb, adminEnabled } from "@/lib/firebase/admin";
import { COL } from "@/lib/firebase/firestore";
import type { Role } from "@/lib/types";

export type AuthedUser = {
  uid: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
};

/** Verify the Firebase ID token from an API request and load the role. */
export async function verifyRequest(req: Request): Promise<AuthedUser | null> {
  if (!adminEnabled) return null;
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const snap = await adminDb.collection(COL.users).doc(decoded.uid).get();
    if (!snap.exists) return null;
    const d = snap.data() as Record<string, unknown>;
    return {
      uid: decoded.uid,
      email: (decoded.email as string) || (d.email as string) || "",
      name: (d.name as string) || "",
      role: (d.role as Role) || "client",
      active: (d.active as boolean) ?? true,
    };
  } catch {
    return null;
  }
}

/** Standard JSON error helper. */
export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function notConfigured() {
  return NextResponse.json(
    { error: "Server is not configured. Add Firebase Admin credentials." },
    { status: 503 },
  );
}
