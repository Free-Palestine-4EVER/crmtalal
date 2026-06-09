import "server-only";
import {
  initializeApp,
  getApps,
  getApp,
  cert,
  type App,
  type Credential,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import {
  getFirestore,
  FieldValue,
  Timestamp,
  type Firestore,
} from "firebase-admin/firestore";

function loadCredential(): Credential | null {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (json) {
    try {
      const sa = JSON.parse(json);
      return cert({
        projectId: sa.project_id,
        clientEmail: sa.client_email,
        privateKey: sa.private_key,
      });
    } catch {
      // fall through
    }
  }
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (projectId && clientEmail && privateKey) {
    privateKey = privateKey.replace(/\\n/g, "\n");
    return cert({ projectId, clientEmail, privateKey });
  }
  return null;
}

const credential = loadCredential();
export const adminEnabled = Boolean(credential);

let app: App | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;

if (credential) {
  app = getApps().length
    ? getApp()
    : initializeApp({
        credential,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
  _auth = getAuth(app);
  _db = getFirestore(app);
  try {
    _db.settings({ ignoreUndefinedProperties: true });
  } catch {
    /* already set */
  }
}

export const adminAuth = _auth as Auth;
export const adminDb = _db as Firestore;
export { FieldValue, Timestamp };
