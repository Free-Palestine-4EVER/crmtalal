// Promote a user to admin by email (creates the account if it doesn't exist).
// Bootstrap emails only apply at signup, so use this to fix existing accounts.
//
//   node scripts/make-admin.mjs [email]      (default: admin@zeid.com)
import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

function loadEnv() {
  const text = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  const env = {};
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return env;
}

const env = loadEnv();
const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({
  credential: cert({
    projectId: sa.project_id,
    clientEmail: sa.client_email,
    privateKey: sa.private_key,
  }),
});
const auth = getAuth();
const db = getFirestore();

const email = (process.argv[2] || "admin@zeid.com").toLowerCase();

let user;
try {
  user = await auth.getUserByEmail(email);
} catch (e) {
  if (e.code === "auth/user-not-found") {
    user = await auth.createUser({
      email,
      password: email,
      displayName: email.split("@")[0],
    });
    console.log(`created auth account (password = ${email})`);
  } else {
    throw e;
  }
}

const ref = db.collection("users").doc(user.uid);
const snap = await ref.get();
const update = { email, role: "admin", active: true };
if (!snap.exists) {
  update.name = email.split("@")[0];
  update.locale = "ar";
  update.createdAt = FieldValue.serverTimestamp();
}
await ref.set(update, { merge: true });

console.log(`✓ ${email} is now ADMIN (uid ${user.uid})`);
process.exit(0);
