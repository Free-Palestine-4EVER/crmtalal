"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  onAuthStateChanged,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db, firebaseEnabled } from "@/lib/firebase/client";
import { COL, mapUser } from "@/lib/firebase/firestore";
import type { UserProfile, Role } from "@/lib/types";

type AuthContextValue = {
  enabled: boolean;
  loading: boolean;
  user: User | null;
  profile: UserProfile | null;
  role: Role | null;
  /** True when signed in but the Firestore profile couldn't be loaded/created. */
  profileError: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(firebaseEnabled);
  const [profileError, setProfileError] = useState(false);
  const healedRef = useRef(false);

  useEffect(() => {
    if (!firebaseEnabled) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // Subscribe to the user's profile document in realtime (with self-heal).
  useEffect(() => {
    if (!firebaseEnabled || !user) return;
    setLoading(true);
    setProfileError(false);
    healedRef.current = false;
    const currentUser = user;
    const ref = doc(db, COL.users, currentUser.uid);
    const unsub = onSnapshot(
      ref,
      async (snap) => {
        if (snap.exists()) {
          const mapped = mapUser(snap);
          setProfile(mapped);
          setProfileError(false);
          if (typeof document !== "undefined") {
            document.cookie =
              "edarah_role=" +
              mapped.role +
              ";path=/;max-age=31536000;samesite=lax";
          }
          setLoading(false);
          return;
        }
        // Profile doc missing — ask the server to create it once (self-heal
        // for accounts whose profile failed to create at registration).
        if (!healedRef.current) {
          healedRef.current = true;
          try {
            const token = await currentUser.getIdToken();
            const res = await fetch("/api/auth/register", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: "{}",
            });
            if (res.ok) return; // onSnapshot re-fires with the new document
          } catch {
            /* fall through to error state */
          }
          setProfileError(true);
        }
        setProfile(null);
        setLoading(false);
      },
      () => {
        // Read denied (rules not published) or offline — stop the spinner.
        setProfileError(true);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [user]);

  const signOut = useCallback(async () => {
    if (firebaseEnabled) await fbSignOut(auth);
    setProfile(null);
    if (typeof document !== "undefined") {
      document.cookie = "edarah_role=;path=/;max-age=0";
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        enabled: firebaseEnabled,
        loading,
        user,
        profile,
        role: profile?.role ?? null,
        profileError,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

/** Get a fresh Firebase ID token for authorized API calls. */
export async function getIdToken(): Promise<string | null> {
  if (!firebaseEnabled || !auth.currentUser) return null;
  return auth.currentUser.getIdToken();
}
