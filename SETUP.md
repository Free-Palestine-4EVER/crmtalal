# Edarah CRM — Setup & Go-Live Guide

The app **builds and runs** already. To make it fully functional against your
Firebase project (`talalcrm-9578e`), complete the steps below. Most credentials
are already wired in `.env.local`.

> Node lives at `~/.local/node`. Prefix commands with it if `node`/`pnpm` aren't on your PATH:
> `export PATH="$HOME/.local/node/bin:$PATH"`

---

## 1. Run it locally
```bash
cd ~/dev/edarah
pnpm dev          # http://localhost:3000
```
Production:
```bash
pnpm build && pnpm start
```

## 2. Deploy security rules  ⚠️ required
Firestore/Storage queries are **denied by default** until you publish the rules.
Two ways:

**A. One command (uses the service account already in `.env.local`):**
```bash
node scripts/deploy-rules.mjs
```
This publishes `firestore.rules` and `storage.rules` to the live project.

**B. Firebase CLI (also deploys indexes):**
```bash
npm i -g firebase-tools
firebase login
firebase use talalcrm-9578e
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## 3. Deploy Firestore indexes
The CRM uses a few composite indexes (`firestore.indexes.json`). Either deploy
them with the CLI command above, **or** simply use the app — Firestore prints a
one-click "create index" link in the browser console the first time a query
needs one. Required indexes:
- `projects`: `clientId + updatedAt`, `assignedTo + updatedAt`, `status + updatedAt`
- `notifications`: `userId + createdAt`
- `users`: `role + createdAt`

## 4. Enable Authentication providers
Firebase console → **Authentication → Sign-in method**:
- Enable **Email/Password**
- Enable **Google** (for the "Continue with Google" button)

## 5. Enable Cloud Storage
Firebase console → **Storage → Get started** (bucket `talalcrm-9578e.firebasestorage.app`).
Document/report uploads use it.

## 6. Become the admin
Register in the app with **zzeid.exe@gmail.com** (set in `ADMIN_BOOTSTRAP_EMAILS`)
→ you're auto-promoted to **admin**. Everyone else registers as a **client**.
You can then create **Valuer** accounts from **Team** in the portal. To add more
bootstrap admins, edit `ADMIN_BOOTSTRAP_EMAILS` (comma-separated) in `.env.local`.

## 7. OneSignal push (server-side)
The Web SDK (App ID `5122e60f-dd49-41b1-81e7-66b6117a8383`) is already integrated
— users can subscribe and the external ID is bound to their Firebase UID.
To let the **server send** pushes on events, add your REST API Key to `.env.local`:
```
ONESIGNAL_REST_API_KEY=...        # OneSignal → Settings → Keys & IDs
```
In the OneSignal dashboard, add your site URL(s) (`http://localhost:3000` for
dev, `https://www.crmtalal.website` for prod). The service worker is hosted at
`/OneSignalSDKWorker.js` (default path — no dashboard change needed). In-app
notifications work regardless; push is best-effort.

## 8. Deploy the app
Any Next.js host (Vercel recommended). Set the same env vars in the host's
dashboard, and set `NEXT_PUBLIC_SITE_URL=https://www.crmtalal.website`.
`.env.local` is git-ignored — never commit it (it contains the service account).

---

## Roles at a glance
| Role | Sees |
|------|------|
| **Client** | Own requests, create/track, upload docs, message, download reports, notifications |
| **Valuer (employee)** | Assigned requests, advance stages, upload reports, tasks, calendar, leads/contacts/companies/deals |
| **Admin** | Everything: assign valuers, set fees, all CRM modules, analytics, clients, team, activity log |

## Security model
- **Reads** stream live via the client SDK, gated by `firestore.rules`.
- **All writes** go through authenticated API routes (`/api/*`) using the Admin
  SDK — every mutation is verified, audited, and fires notifications. Direct
  client writes are denied by rules.
