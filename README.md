# Edarah — Real Estate Valuation Platform · منصة إدارة للتقييم العقاري

A complete **bilingual (Arabic RTL / English LTR)** platform for **Edarah Real
Estate Valuation Co.** — a public marketing website, a full role-based **CRM**,
and an installable **PWA**, built on **Next.js 16 + Firebase + OneSignal**.

🌐 Deploys to `www.crmtalal.website` · Firebase project `talalcrm-9578e`

---

## What's inside

- **Public website** — animated, premium, all company content (services,
  standards, 6-step process, reach, FAQ, contact) with WhatsApp/Call CTAs.
- **Client / Valuer / Admin portals** — each role gets a distinct dashboard,
  navigation, and permissions.
- **Valuation workflow** — mirrors the firm's real process: request →
  assignment → site visit → analysis → report → completion certificate, with a
  full audit timeline, document/report exchange, and per-request messaging.
- **CRM modules** — Leads, Contacts, Companies, Deals (kanban pipeline), Tasks,
  Calendar, Invoices (with VAT builder), Analytics, Activity log, Clients, Team.
- **Notifications** — in-app (Firestore) + OneSignal web-push on every key event.
- **PWA** — installable, offline-capable, combined service worker.

See **[FEATURES.md](./FEATURES.md)** for the full 300-feature list and
**[SETUP.md](./SETUP.md)** to go live.

## Tech stack
Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 ·
Framer Motion · Firebase (Auth / Firestore / Storage) · firebase-admin ·
OneSignal Web SDK v16 · Recharts · date-fns · Zod · Sonner.

## Quick start
```bash
export PATH="$HOME/.local/node/bin:$PATH"
cd ~/dev/edarah
pnpm dev            # → http://localhost:3000
```
Then follow **[SETUP.md](./SETUP.md)** (deploy rules, enable auth, register as admin).

## Architecture

- **Reads** stream live via `onSnapshot`, scoped by role and protected by
  `firestore.rules`.
- **Writes** are funnelled through authenticated API routes using the Admin SDK,
  so every change is validated, written to an **audit timeline / activity log**,
  and triggers **notifications** — direct client writes are denied.

```
Client SDK (realtime reads)  ──►  Firestore  ◄──  Admin SDK (all writes)
   React hooks ─► role-aware UI         Next.js API routes ─► notifications + push
```

## Project layout
```
src/
  app/
    (auth)/            login · register · forgot
    (portal)/          dashboard · requests · leads · contacts · companies ·
                       deals · tasks · calendar · invoices · analytics ·
                       activity · clients · team · notifications · profile · settings
    api/               auth · projects · crm · admin · profile
    page.tsx           public landing
  components/          ui/ (20+ primitives) · portal/ · site/ · brand/ · motion/ · pwa/
  lib/                 firebase/ · hooks/ · server/ · auth/ · types · format · nav · roles
  i18n/                ar + en dictionaries, provider, config
  content/             bilingual marketing content
firestore.rules · storage.rules · firestore.indexes.json · scripts/deploy-rules.mjs
```

## Brand
Antique gold `#C9A24C` + deep maroon `#72142F` + cream on a premium dark theme —
extracted from the company's calligraphic logo. Fully tokenised in
`src/app/globals.css`.
