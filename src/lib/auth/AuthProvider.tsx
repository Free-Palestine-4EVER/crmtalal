"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
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
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(firebaseEnabled);

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

  // Subscribe to the user's profile document in realtime.
  useEffect(() => {
    if (!firebaseEnabled || !user) return;
    setLoading(true);
    const ref = doc(db, COL.users, user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setProfile(snap.exists() ? mapUser(snap) : null);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsub();
  }, [user]);

  const signOut = useCallback(async () => {
    if (firebaseEnabled) await fbSignOut(auth);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        enabled: firebaseEnabled,
        loading,
        user,
        profile,
        role: profile?.role ?? null,
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
