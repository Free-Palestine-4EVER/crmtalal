"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  type QueryConstraint,
} from "firebase/firestore";
import { db, firebaseEnabled } from "@/lib/firebase/client";
import { mapDoc } from "@/lib/firebase/firestore";

export type QueryState<T> = {
  data: T[];
  loading: boolean;
  error: Error | null;
};

/** Subscribe to a collection query. `deps` controls re-subscription. */
export function useCollection<T>(
  path: string | null,
  constraints: QueryConstraint[],
  deps: unknown[],
): QueryState<T> {
  const [state, setState] = useState<QueryState<T>>({
    data: [],
    loading: Boolean(path) && firebaseEnabled,
    error: null,
  });

  useEffect(() => {
    if (!firebaseEnabled || !path) {
      setState({ data: [], loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    const q = query(collection(db, path), ...constraints);
    const unsub = onSnapshot(
      q,
      (snap) =>
        setState({
          data: snap.docs.map((d) => mapDoc<T>(d)),
          loading: false,
          error: null,
        }),
      (error) => setState({ data: [], loading: false, error }),
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

/** Subscribe to a single document. */
export function useDocument<T>(
  path: string | null,
  deps: unknown[],
): { data: T | null; loading: boolean } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(Boolean(path) && firebaseEnabled);

  useEffect(() => {
    if (!firebaseEnabled || !path) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(
      doc(db, path),
      (snap) => {
        setData(snap.exists() ? mapDoc<T>(snap) : null);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading };
}
