// Creates ready-to-use demo accounts (admin + employee) via the Admin SDK,
// so you can sign in immediately. Uses the service account in .env.local.
//
//   node scripts/seed-users.mjs
//
// Credentials created (email === password):
//   admin@zeid.com     / admin@zeid.com      (admin)
//   employee@zeid.com  / employee@zeid.com   (valuer)
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

const USERS = [
  { email: "admin@zeid.com", password: "admin@zeid.com", name: "Admin", role: "admin" },
  { email: "employee@zeid.com", password: "employee@zeid.com", name: "Valuer", role: "employee" },
];

for (const u of USERS) {
  let uid;
  try {
    const rec = await auth.createUser({
      email: u.email,
      password: u.password,
      displayName: u.name,
    });
    uid = rec.uid;
  } catch (e) {
    if (e.code === "auth/email-already-exists") {
      const rec = await auth.getUserByEmail(u.email);
      uid = rec.uid;
      await auth.updateUser(uid, { password: u.password, displayName: u.name });
    } else {
      throw e;
    }
  }
  await db.collection("users").doc(uid).set(
    {
      email: u.email,
      name: u.name,
      role: u.role,
      active: true,
      locale: "ar",
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  console.log(`✓ ${u.email}  (${u.role})  password: ${u.password}`);
}

console.log("\nDone. You can now sign in with the credentials above.");
process.exit(0);
