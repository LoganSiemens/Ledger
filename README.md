# Ledger

> A calm, considered personal finance journal. Cream and clay, Fraunces and Inter,
> tabular numbers and breathing room. Installs straight to your home screen — no app
> store, no account, no syncing.

The brand mark is **◐**. Your data lives on your device.

---

## Status

This repo is **Phase 1**: a deployable app shell with the design system, storage
abstraction, export/import, PWA install, and offline-after-first-load. The feature
tabs (Dashboard, Calendar, Accounts, Transactions, Goals, Bills) render polished
empty states. Subsequent phases fill them in.

See [Roadmap](#roadmap) below.

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

## Roadmap

- **Phase 1 — shell** ✅ Project setup, storage, PWA install, offline, design system, settings
- **Phase 2 — core data** Accounts, Transactions, Dashboard with totals + cash flow
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
