import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  type Firestore,
} from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** True only when the Firebase web config is present. */
export const firebaseEnabled = Boolean(config.apiKey && config.projectId);

let app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;
let _storage: FirebaseStorage | undefined;

if (firebaseEnabled) {
  app = getApps().length ? getApp() : initializeApp(config);
  _auth = getAuth(app);
  try {
    _db = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    });
  } catch {
    _db = getFirestore(app);
  }
  _storage = getStorage(app);
} else if (typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.warn(
    "[Edarah] Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* to .env.local to enable the portal.",
  );
}

// These are valid whenever `firebaseEnabled` is true. The portal/auth layer
// gates all usage behind that flag, so consumers can treat them as defined.
export const auth = _auth as Auth;
export const db = _db as Firestore;
export const storage = _storage as FirebaseStorage;
