# Ledger

> A calm, considered personal finance journal. Cream and clay, Fraunces and Inter,
> tabular numbers and breathing room. Installs straight to your home screen — no app
> store.

The brand mark is **◐**. Manual entries stay on your device. Linked banks live in
Supabase (access tokens only) and pull through Plaid.

---

## Status

Phase 1 (shell) and Phase 2 (accounts + transactions + dashboard) are shipped.
Phase 2.5 adds optional bank linking via Plaid + Supabase + Netlify Functions.
Calendar, Goals, Bills are still polished empty states (Phase 3+).

---

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173. Vite reloads on save.

The first `npm install` will run a postinstall step that lets `vite-plugin-pwa` set
itself up. The first `npm run build` (or `npm run generate-pwa-assets`) will
generate the PNG icon set from `public/icon.svg`.

> **Note:** the dev server doesn't enable the service worker by default. To verify
> offline behavior locally, run `npm run build && npm run preview`.

### Available scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Generates PWA icons + builds to `dist/` |
| `npm run preview` | Serves the production build (use this to test PWA + offline) |
| `npm run generate-pwa-assets` | Regenerates icons from `public/icon.svg` |

---

## Deploy to Netlify

Ledger is configured to deploy as-is. `netlify.toml` already declares the build
command, publish directory, Node version, and PWA cache headers.

1. Push this repo to GitHub.
2. Go to https://app.netlify.com/start → **Import an existing project** → pick the repo.
3. Netlify reads `netlify.toml`. Leave the build settings alone.
4. Click **Deploy site**. You get an HTTPS URL like `https://ledger-xyz.netlify.app`.

That HTTPS URL is what you install on your phone. The PWA only works over HTTPS.

> **Tip:** under **Site settings → Domain management → Production branch**, set the
> branch you want to deploy from (e.g. `main` or your feature branch).

### Deploy to Vercel (alternative)

`vercel.json` is also included if you prefer Vercel.

1. Push to GitHub.
2. https://vercel.com/new → import the repo.
3. Vercel auto-detects Vite. Click **Deploy**.

---

## Install on iPhone (Add to Home Screen)

1. Open your Vercel URL in **Safari** (not Chrome — only Safari can install PWAs on iOS).
2. Tap the **Share** button (square with up arrow).
3. Scroll down → **Add to Home Screen**.
4. Confirm the name (Ledger) → **Add**.
5. Open from your home screen. It launches full-screen, no Safari chrome.

> **Heads up:** iOS storage for PWAs can be evicted if Safari is starved for space or
> data is cleared. **Use Settings → Export JSON** regularly to back up.

To verify the install worked:

- App launches with no Safari address bar (full-screen, standalone).
- The status bar uses the cream theme color.
- Going to airplane mode after first load still loads the app.
- The icon on your home screen is the ◐ mark on cream.

---

## Project structure

```
src/
  components/
    Dashboard/        Dashboard.jsx
    Calendar/         Calendar.jsx
    Accounts/         Accounts.jsx
    Transactions/     Transactions.jsx
    Goals/            Goals.jsx
    Bills/            Bills.jsx
    Settings/         Settings.jsx, ImportExport.jsx
    layout/           AppShell.jsx, TopNav.jsx, BottomNav.jsx
    common/           PageHeader.jsx, Empty.jsx, ErrorBoundary.jsx
  hooks/
    useStorage.js     localStorage-backed reactive hook with a swappable adapter
  utils/
    exportImport.js   JSON backup + restore + clear-all
  styles/
    theme.js          design tokens (also injected as CSS vars)
    globals.css       base type, resets, tap feedback, safe-area handling
  App.jsx
  main.jsx
public/
  icon.svg            source icon — all PNGs are generated from this
  favicon.svg
```

### Storage

Everything goes through `src/hooks/useStorage.js`. The default adapter is `localStorage`
prefixed with `ledger:`. To swap to IndexedDB later, implement the same `StorageAdapter`
interface (`get / set / remove / keys / clear / subscribe`) and replace the export.

`useStorage(key, initial)` is reactive — multiple components reading the same key stay
in sync (and across tabs, via the native `storage` event).

### Backups

Settings → Export JSON downloads a single `ledger-backup-YYYY-MM-DD.json` containing
every key under the `ledger:` namespace. Importing the same file restores it. There's
also a Danger Zone clear-all.

### PWA assets

`public/icon.svg` is the single source of truth. `pwa-assets.config.js` (using the
`@vite-pwa/assets-generator` minimal-2023 preset) generates:

- `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png` (transparent)
- `maskable-icon-512x512.png` (Android adaptive icon)
- `apple-touch-icon-180x180.png` (iOS home screen)
- `favicon.ico`

These are regenerated on every `npm run build` (via `prebuild`) and are git-ignored.

---

## Bank linking (optional, via Plaid)

Ledger can pull balances and transactions from real banks via Plaid. This is
**opt-in** — the app works fully without it as a manual journal.

### Architecture

- **Netlify Functions** (`netlify/functions/*.mjs`) sit between the client and
  Plaid + Supabase. They never run in the browser, so Plaid secrets stay server-side.
- **Supabase** stores one row per linked bank in `plaid_items` — institution name,
  Plaid `item_id`, the long-lived `access_token`, and a `sync_cursor` for incremental
  fetches. Transactions themselves never live in Supabase; they're synced into the
  client's localStorage on each pull.
- **A shared `LEDGER_API_SECRET`** gates every API call. The client stores it in
  localStorage after a one-time unlock screen; the server validates against the
  env var. Anyone hitting your Netlify URL without the secret gets `401`.

### Required environment variables (Netlify → Site configuration → Environment variables)

| Key | Notes |
| --- | --- |
| `PLAID_CLIENT_ID` | from Plaid dashboard → Team Settings → Keys |
| `PLAID_SECRET` | the Sandbox / Development / Production secret matching `PLAID_ENV` |
| `PLAID_ENV` | `sandbox`, `development`, or `production` |
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `SUPABASE_SERVICE_KEY` | the `service_role` JWT (never the `anon` key) |
| `LEDGER_API_SECRET` | a long random string; generates the Bearer token gate |

### Required Supabase schema

Run once in Supabase → SQL Editor:

```sql
create extension if not exists pgcrypto;

create table if not exists plaid_items (
  id uuid primary key default gen_random_uuid(),
  institution_id text,
  institution_name text,
  access_token text not null,
  item_id text unique not null,
  sync_cursor text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists plaid_items_item_id_idx on plaid_items(item_id);
```

### How linking works (user flow)

1. First open: app shows the **Unlock** screen → paste `LEDGER_API_SECRET` → stored in
   localStorage from then on.
2. Settings → **Linked banks → Link a bank**.
3. Plaid Link UI opens. In Sandbox, log in to any institution with `user_good` /
   `pass_good`.
4. On success, the client posts the public token to `/api/exchange-token`; the
   server exchanges it for an access token, stores it, then `/api/sync` runs.
5. Accounts and transactions appear in the app. Tap **Sync now** later for fresh data.

### Going from Sandbox → real bank

1. In Plaid dashboard, request **Development** access (free, ~1-day review).
2. Once approved, copy your Development secret into `PLAID_SECRET` and change
   `PLAID_ENV` to `development` in Netlify env vars.
3. Trigger a redeploy. Existing Sandbox links won't carry over — re-link.

### API endpoints (all require `Authorization: Bearer <LEDGER_API_SECRET>`)

| Method | Path | Use |
| --- | --- | --- |
| `POST` | `/api/link-token` | mint a Plaid Link token for the client |
| `POST` | `/api/exchange-token` | swap a Plaid public token for a stored access token |
| `GET`  | `/api/items` | list linked banks |
| `DELETE` | `/api/items?item_id=…` | unlink a bank (revokes via Plaid + deletes row) |
| `POST` | `/api/sync` | pull latest accounts + incremental transactions |

---

## Roadmap

- **Phase 1 — shell** ✅ Project setup, storage, PWA install, offline, design system, settings
- **Phase 2 — core data** ✅ Accounts, Transactions, Dashboard with totals + cash flow
- **Phase 2.5 — bank linking** ✅ Plaid + Supabase + Netlify Functions, optional opt-in
- **Phase 3 — calendar & bills** Swipeable months, week view, recurring markers, "next 30 days"
- **Phase 4 — goals & budgets** Target dates, on-track status, per-category budgets
- **Phase 5 — trends & power tools** Recharts views, search/filter, bulk-edit, tags, CSV import
- **Phase 6 — polish** Onboarding, keyboard shortcuts, pull-to-refresh, Lighthouse 95+

---

## Design tokens

Defined in `src/styles/theme.js` and injected as CSS variables. Use these via
`var(--ink)`, `var(--accent)`, etc.

```
bg            #f5f1ea  warm cream
surface       #ffffff
surface-warm  #faf6ed
border        #ebe4d6
ink           #3c3223  primary text
ink-muted     #7a6f5c
accent        #a08968  clay
positive      #7a9b76  sage
negative      #c97064  terracotta

display font  Fraunces (variable)
body font     Inter (variable)
```

Numbers use `font-variant-numeric: tabular-nums` (apply via the `.tnum` utility class).
