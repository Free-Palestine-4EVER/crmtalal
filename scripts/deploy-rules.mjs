// Deploys firestore.rules + storage.rules to the Firebase project using the
// service account in .env.local. Mints its own OAuth token (no extra deps).
//
//   node scripts/deploy-rules.mjs
import { readFileSync } from "node:fs";
import { createSign } from "node:crypto";

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

function b64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const signature = b64url(signer.sign(sa.private_key));
  const assertion = `${header}.${claims}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error("Token error: " + JSON.stringify(json));
  return json.access_token;
}

async function deploy(token, projectId, releaseName, rulesPath) {
  const source = readFileSync(new URL("../" + rulesPath, import.meta.url), "utf8");
  // 1) create ruleset
  const rsRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ source: { files: [{ name: rulesPath, content: source }] } }),
    },
  );
  const rs = await rsRes.json();
  if (!rsRes.ok) throw new Error(`ruleset (${rulesPath}): ${JSON.stringify(rs)}`);
  const rulesetName = rs.name;

  // 2) update or create the release pointing at the ruleset
  const relUrl = `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases/${encodeURIComponent(releaseName)}`;
  const patch = await fetch(relUrl, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      release: { name: `projects/${projectId}/releases/${releaseName}`, rulesetName },
    }),
  });
  if (!patch.ok) {
    const create = await fetch(
      `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `projects/${projectId}/releases/${releaseName}`,
          rulesetName,
        }),
      },
    );
    const cj = await create.json();
    if (!create.ok) throw new Error(`release (${releaseName}): ${JSON.stringify(cj)}`);
  }
  return rulesetName;
}

const env = loadEnv();
const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
const projectId = sa.project_id;
const bucket = env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

const token = await getAccessToken(sa);
console.log("✓ OAuth token acquired for", projectId);

const fs = await deploy(token, projectId, "cloud.firestore", "firestore.rules");
console.log("✓ Firestore rules deployed:", fs.split("/").pop());

const st = await deploy(token, projectId, `firebase.storage/${bucket}`, "storage.rules");
console.log("✓ Storage rules deployed:", st.split("/").pop());

console.log("\nAll rules live on", projectId);
