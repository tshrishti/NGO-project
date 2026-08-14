# ReliefLink — Complete Project Overview & Codebase Guide

> **Purpose of this document:** This is the single source of truth for the ReliefLink codebase.
> It is written so that a brand-new AI coding session (or a new developer) can read *only this file*
> and understand the entire architecture, every file's responsibility, the data model, the runtime
> data flow, and how to run, extend, and debug the app — without having to reverse-engineer the code.
>
> Repo: `https://github.com/tshrishti/NGO-project`
> Local path: `smart-allocation/`

---

## 1. What this project is

**ReliefLink** is a full-stack web app for **Smart Resource & Volunteer Allocation** for NGOs / a
"Code for Good"-style scenario. NGOs (and community members) post **urgent local needs**
(medical, food, shelter, education) onto a **live map**; a **smart matching algorithm** connects
each **volunteer** to the closest, best-fit needs by **skill + proximity + urgency**. Everything
updates in **real time** and runs **100% locally** (no cloud accounts, no paid APIs, no billing).

### One-line pitch
> "NGOs post urgent needs on a live map; volunteers get matched to the closest, best-fit tasks by
> skill and urgency, instantly."

---

## 2. Technology stack (and why)

| Layer | Choice | Why this choice |
|---|---|---|
| Frontend | **React 18 + Vite 4** | Fast dev/HMR. Vite **4** (not 5) because the dev machine runs **Node 16**. |
| Backend | **Node.js + Express 4** | Simple REST API + a Server-Sent Events (SSE) stream. |
| Database | **SQLite** via `better-sqlite3` | Real relational DB, **zero-config**, file-based — no Postgres install. Swappable for PostgreSQL later. |
| Real-time | **Server-Sent Events** (`/api/stream`) | Server pushes changed collections; the UI updates live across tabs/devices. Simpler than websockets for one-way push. |
| Map | **Leaflet + OpenStreetMap** | Free, no Google Maps billing. |
| Charts | **Recharts** | Impact dashboard bar + donut charts. |
| Routing | **react-router-dom 6** | Client-side routing. |
| Styling | **Plain CSS** (`src/index.css`, ~800 lines) with CSS variables | Theming (dark/light) + animated aurora; no Tailwind/CSS-in-JS. |
| Dev runner | **concurrently v7** | `npm start` runs API + web together. v7 is pinned because the latest needs Node 20. |

> ⚠️ **Node version matters.** The machine is on **Node 16**. Pinned versions: Vite 4.5, `@vitejs/plugin-react` 4.3, `concurrency@7.6`, `better-sqlite3@9`. Do NOT bump to versions that require Node 18/20.

---

## 3. High-level architecture

```
┌──────────────────────────── Browser (React SPA, :5173) ────────────────────────────┐
│  main.jsx → Providers → App.jsx (routes) → Pages/Components                          │
│                                                                                      │
│  Data layer:  src/data/store.js                                                      │
│    • getAll/getById/add/update  → fetch() to /api/*                                  │
│    • subscribe(collection, cb)  → ONE EventSource(/api/stream) + in-memory cache     │
│    • apiSignup/apiLogin/apiHelp → auth + public help endpoints                       │
└───────────────▲───────────────────────────────────────────────┬─────────────────────┘
                │ Vite dev proxy: /api → http://localhost:4000    │
                │ (configured in vite.config.js — avoids CORS)     │
┌───────────────┴───────────────────────────────────────────────▼─────────────────────┐
│  Express API (:4000)  server/index.js                                                │
│    REST: /api/auth/signup, /api/auth/login, /api/users, /api/needs, /api/matches,    │
│          /api/help, PATCH /api/needs/:id, PATCH /api/users/:id                        │
│    SSE:  GET /api/stream  (broadcasts full collection on every mutation)              │
│                                                                                      │
│  DB layer  server/db.js  (better-sqlite3)                                            │
│    tables: users, needs, matches   (skills[]/location{} stored as JSON text)         │
│    seedIfEmpty() creates demo NGO + volunteer + 6 needs on first boot                │
│    migrate() ALTERs needs to add newer columns on an existing DB                     │
│    → file: server/reliefLink.db  (gitignored)                                        │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

**Real-time model:** Any mutation on the server calls `broadcast(collection)`, which serializes the
**entire** collection and pushes it as an SSE event named after the collection (`users`/`needs`/`matches`).
The client's `store.js` holds one `EventSource`; each event replaces the cached array and notifies all
React subscribers. This is why the UI is "live" and syncs across browser tabs.

> **Important design invariant:** The frontend's storage API (`getAll/getById/add/update/subscribe`)
> was intentionally kept identical to an earlier localStorage prototype. That means **only
> `src/data/store.js` knows about HTTP/SSE** — every page/component is storage-agnostic. To migrate to
> real Firebase/another backend, you'd only rewrite `store.js`.

---

## 4. How to run (dev)

```bash
cd smart-allocation
npm run setup     # installs BOTH frontend deps and server/ deps (first time only)
npm start         # === npm run dev:all === runs API (:4000) + web (:5173) together via concurrently
# open http://localhost:5173
```

Alternatives:
- Two terminals: `npm run server` (API) and `npm run dev` (web).
- `npm run build` → production build into `dist/`. `npm run preview` to serve it.

**Demo accounts (auto-seeded):** `ngo@demo.org` and `asha@demo.org`, password `demo`.

> **#1 gotcha:** The app needs BOTH processes. If only `npm run dev` runs, the UI has no backend and
> "nothing works" (no data loads/saves). Use `npm start`.

`package.json` scripts:
- `dev` → `vite` (web only)
- `server` → `npm --prefix server start` (API only; runs `server/index.js`)
- `server:install` / `setup` → dependency installs
- `start` / `dev:all` → `concurrently ... "npm run server" "npm run dev"`
- `build` / `preview` → Vite build/preview

---

## 5. Data model (SQLite tables)

Stored in `server/reliefLink.db`. Array/object fields (`skills`, `location`) are serialized as **JSON
text** and hydrated back to JS on read (see `hydrate`/`serialize` in `server/db.js`).

### `users`
| column | type | notes |
|---|---|---|
| id | TEXT PK | generated: `Date.now().toString(36)+random` |
| role | TEXT | `'ngo'` or `'volunteer'` |
| name | TEXT | org name or full name |
| email | TEXT UNIQUE | login id |
| password | TEXT | **plaintext for the demo** — NOT for production |
| skills | TEXT(JSON `[]`) | volunteer skills |
| availability | TEXT | `anytime`/`weekdays`/`weekends`/`evenings` |
| location | TEXT(JSON `{lat,lng}`) | |
| createdAt | INTEGER | epoch ms |

### `needs`
| column | type | notes |
|---|---|---|
| id | TEXT PK | |
| ngoId | TEXT | owner user id, or `'public'` for community help requests |
| ngoName | TEXT | display name |
| title | TEXT | |
| category | TEXT | `food`/`medical`/`shelter`/`education` |
| urgency | TEXT | `low`/`medium`/`high` |
| skills | TEXT(JSON `[]`) | required skills |
| location | TEXT(JSON `{lat,lng}`) | |
| status | TEXT | `open` → `assigned` → `fulfilled` |
| assignedTo / assignedName / assignedAt | TEXT/TEXT/INTEGER | set when a volunteer accepts |
| fulfilledAt | INTEGER | set when marked fulfilled |
| requesterName / requesterPhone | TEXT | for community (WhatsApp) help requests |
| description | TEXT | optional details |
| photo | TEXT | compressed JPEG **data URL** (inline) |
| source | TEXT | `'ngo'` or `'whatsapp'` (community request) |
| createdAt / updatedAt | INTEGER | |

### `matches`
| column | type | notes |
|---|---|---|
| id | TEXT PK | |
| needId | TEXT | |
| volunteerId / volunteerName | TEXT | |
| status | TEXT | `'accepted'` |
| createdAt | INTEGER | |

---

## 6. REST + SSE API (server/index.js)

| Method | Endpoint | Body / Notes | Returns |
|---|---|---|---|
| POST | `/api/auth/signup` | `{role,name,email,password}` | new user (409 if email exists) |
| POST | `/api/auth/login` | `{email,password}` | user (401 if invalid) |
| GET | `/api/users` | — | all users |
| GET | `/api/users/:id` | — | one user (404 if missing) |
| GET | `/api/needs` | — | all needs |
| GET | `/api/matches` | — | all matches |
| POST | `/api/needs` | need fields (NGO posting) | created need; broadcasts `needs` |
| POST | `/api/help` | `{title,location,...,requesterPhone}` | community request → creates `needs` row with `source:'whatsapp'`, `ngoId:'public'`; broadcasts |
| PATCH | `/api/needs/:id` | partial need | updated need; broadcasts `needs` |
| PATCH | `/api/users/:id` | partial user (profile edit) | updated user; broadcasts `users` |
| GET | `/api/stream` | SSE | on connect sends snapshots of all 3 collections; then pushes on every mutation |

Every mutating endpoint calls `broadcast(collection)` → SSE `event: <collection>` with the full JSON array.

---

## 7. The matching algorithm (the core — know this well)

Implemented in **`src/lib/matching.js`**.

```
matchScore = skillOverlap*0.6 + proximityScore*0.3 + urgencyScore*0.1   // each sub-score is 0..100
```

- **skillOverlap** = `(volunteer's matching skills ÷ skills required by the need) × 100`
- **proximityScore** = based on distance: `<=1km → 100`, else `min(100, (1/distanceKm)*100)`.
  Distance is the real **Haversine** great-circle distance between lat/lng (`haversineKm`).
- **urgencyScore** = `URGENCY_WEIGHT[urgency] * 100` where weights are `high:1, medium:0.5, low:0.2`.

Key exported functions:
- `haversineKm(a, b)` — km between two `{lat,lng}`.
- `skillOverlap(volunteerSkills, requiredSkills)` — 0..100.
- `proximityScore(distanceKm)` / `urgencyScore(urgency)` — 0..100.
- `scoreNeed(volunteer, need)` → `{ need, total, skillOverlap, proximityScore, urgencyScore, distanceKm }` (full breakdown for the UI).
- `findMatches(volunteer, needs, limit=5)` — filters `status==='open'`, scores, sorts desc, returns top N.

There is **no ML** — it's a transparent weighted formula, easy to explain.

---

## 8. Directory & file-by-file reference

```
smart-allocation/
├─ package.json            # scripts + frontend deps (React, Vite, Leaflet, Recharts, router, concurrently)
├─ vite.config.js          # Vite + React plugin; proxy /api → :4000; port 5173
├─ index.html              # SPA root; loads Google Fonts (Inter + Sora); #root mount
├─ README.md               # user-facing quickstart + feature summary
├─ PROJECT_OVERVIEW.md     # (this file) full architecture/codebase guide
├─ .gitignore              # ignores node_modules, dist, server/*.db, .DS_Store
├─ public/
│  └─ community.png        # hero/auth background photo (hands holding paper people)
├─ server/                 # BACKEND (own package.json + node_modules)
│  ├─ package.json         # express, cors, better-sqlite3; scripts: start/dev
│  ├─ index.js             # Express app: REST routes + SSE hub (broadcast on mutation)
│  └─ db.js                # better-sqlite3: schema, migrate(), CRUD helpers, seedIfEmpty()
└─ src/                    # FRONTEND
   ├─ main.jsx             # React root; wraps App in Providers (Theme→Language→Auth→Notifications) + BrowserRouter
   ├─ App.jsx              # <Nav/> + <Routes> + global <VolunteerAlerts/><ToastStack/><ChatBot/>
   ├─ index.css            # ALL styling: theme tokens (dark/light), aurora bg, components, print styles
   ├─ config.js            # SUPPORT_WHATSAPP number, ORG_NAME, ALERT_RADIUS_KM (15)
   ├─ data/
   │  ├─ store.js          # THE data layer: fetch + SSE cache; exports getAll/getById/add/update/subscribe/apiSignup/apiLogin/apiHelp
   │  └─ seed.js           # UI constants: SKILLS[], CATEGORIES[], URGENCIES[], CATEGORY_SKILLS{}, CATEGORY_ICONS{}, MAP_CENTER (Bengaluru)
   ├─ lib/
   │  ├─ matching.js       # matching algorithm + Haversine (Section 7)
   │  ├─ useCollection.js  # React hook: subscribe(name) → live array
   │  ├─ whatsapp.js       # waLink(phone,text) wa.me deep links; localized volunteerMessage()/helpRequestMessage()
   │  ├─ maps.js           # directionsLink(location) → Google Maps directions URL
   │  ├─ sla.js            # SLA_HOURS per urgency, deadlineFor(), slaRemaining(), useNow() ticking hook
   │  ├─ sound.js          # playAlarm() via Web Audio API (two beeps; no audio file)
   │  ├─ image.js          # fileToCompressedDataURL() — canvas-resize an uploaded image to ~800px JPEG
   │  ├─ report.js         # needsToCSV()/downloadCSV()/printReport() for Impact export
   │  ├─ botKnowledge.js   # multilingual chatbot: INTENTS[], matchIntent(text,lang), QUICK_REPLIES, UI strings (en/hi/kn)
   │  └─ icons.js          # pinIcon(urgency) — colored Leaflet divIcon markers
   ├─ context/
   │  ├─ AuthContext.jsx        # user/ready + signup/login/logout/updateProfile; session id in localStorage; live user sync
   │  ├─ ThemeContext.jsx       # theme 'dark'|'light' → data-theme attr; persisted; respects OS preference
   │  ├─ LanguageContext.jsx    # lang 'en'|'hi'|'kn' (English/Hindi/Kannada); persisted; LANGUAGES[]
   │  └─ NotificationsContext.jsx # items/unread/toasts + push()/markAllRead()/clearAll(); PERSISTS items+unread to localStorage
   ├─ components/
   │  ├─ Nav.jsx            # top nav; role-based links; notification bell + dropdown; theme toggle; who/logout
   │  ├─ ProtectedRoute.jsx # guards routes by login + role; waits for auth 'ready'
   │  ├─ LocationPicker.jsx # small Leaflet map; click to drop/move a pin; "use my location"
   │  ├─ ChatBot.jsx        # floating assistant widget; language switcher; quick replies; WhatsApp/Request-help actions
   │  ├─ VolunteerAlerts.jsx# headless: watches needs feed → role-aware alerts (see Section 9)
   │  ├─ ToastStack.jsx     # renders transient toast notifications (top-right)
   │  ├─ SlaBadge.jsx       # live SLA countdown badge for open needs (uses useNow)
   │  └─ PageHeader.jsx     # reusable page header (icon tile + gradient title + subtitle + actions/stats)
   └─ pages/
      ├─ Landing.jsx        # marketing hero (photo banner) + role choice + feature tiles
      ├─ Auth.jsx           # split-screen signup/login (branded left panel + form); role picker
      ├─ NgoDashboard.jsx   # post-need form (+photo) + NgoAnalytics + "My needs" list; welcome header + stat chips
      ├─ VolunteerDashboard.jsx # volunteer profile: skills/availability/location; welcome header + "Find tasks"
      ├─ MapView.jsx        # live map; color pins; filter bar; popups with SLA/WhatsApp/Directions/"I'll help"
      ├─ SmartMatch.jsx     # "Find my best matches" → ranked match cards (score %, SLA, actions)
      ├─ MyTasks.jsx        # volunteer's accepted tasks; mark completed; WhatsApp/Directions
      ├─ Impact.jsx         # stats + Recharts bar/donut + leaderboard + CSV/print export
      └─ RequestHelp.jsx    # public community help form (+photo) → POST /api/help; WhatsApp deep link
```

---

## 9. Feature deep-dives

### 9.1 Auth & sessions (`AuthContext.jsx`)
- `signup/login` call `apiSignup/apiLogin` (in `store.js`) → dedicated endpoints. On success the **user id**
  is stored in `localStorage['reliefLink:session']` and the user object in React state.
- The provider `subscribe('users', ...)` so the current user stays in sync with live updates (e.g. profile edits).
- **Readiness race fix (important):** `ready` is only set true once the users list has actually loaded (or
  there's no session). This prevents `ProtectedRoute` from bouncing a logged-in user to `/auth` on a hard
  refresh of a protected page.

### 9.2 Real-time alerts (`VolunteerAlerts.jsx` + `NotificationsContext.jsx`)
Headless component mounted in `App.jsx`. It diffs the live `needs` feed against a `prev` Map of `id→status`:
- **Volunteer:** a **new open** need matching their skills (`skillOverlap>0`) and within `ALERT_RADIUS_KM`
  (15km) → `push()` a notification + `playAlarm()` (Web Audio beep).
- **Volunteer:** their assigned task turns `fulfilled` → "Task completed ✅".
- **NGO:** their own need turns `assigned` → "A volunteer accepted 🎉" + sound.
- First pass after login sets a baseline (no alerts for pre-existing data).
- Notifications: `push()` adds to `items` (history, capped 50) + `toasts` (auto-dismiss 7s) and increments
  `unread`. **`items`+`unread` persist to `localStorage['reliefLink:notifications']`** so the bell survives refresh.
- The **bell** (in `Nav.jsx`) shows unread count; opening it marks all read; has a **Clear** action.

### 9.3 Live map (`MapView.jsx`)
- Renders all needs (except fulfilled unless "Show fulfilled") as colored teardrop pins (`lib/icons.js`):
  🔴 high, 🟡 medium, 🟢 low.
- **Filter bar:** text search + category chips + urgency chips + "Show fulfilled" toggle.
- **Popup** per need: photo thumb, urgency/status badges, **SLA countdown**, skills, and actions:
  "I'll help" (volunteers), **💬 WhatsApp** (localized message), **🗺️ Directions**.
- "I'll help" (accept): creates a `matches` row + PATCHes the need to `assigned` with `assignedTo/Name/At`.

### 9.4 Smart Match (`SmartMatch.jsx`)
- "Find my best matches" runs `findMatches(user, needs, 5)` and renders **match cards** with a rank (#1..#5),
  category icon, gradient score %, score breakdown, SLA badge, and I'll help / WhatsApp / Directions.

### 9.5 Impact dashboard (`Impact.jsx`)
- Stat cards (fulfilled, active volunteers, avg response time), a **bar chart** (needs by category) and a
  **donut** (status breakdown) via Recharts, and a **leaderboard** (top volunteers by points:
  fulfilled=10, in-progress=5).
- **Charts use a manual `useWidth()` (ResizeObserver) instead of Recharts `ResponsiveContainer`** — the
  ResponsiveContainer mis-measured width under React StrictMode and bunched all bars at the left. The
  measured-width approach is the fix; keep it.
- **Export:** `Export CSV` (`report.js` → Blob download) and `Print / PDF` (`window.print()`; print CSS in
  `index.css` hides nav/chat/toasts/aurora and cleans cards).

### 9.6 NGO dashboard (`NgoDashboard.jsx`)
- Post-need form: title, category (chips prefill required skills via `CATEGORY_SKILLS`), urgency, skills,
  location (map/geolocation), **optional photo** (compressed via `image.js`).
- `NgoAnalytics` sub-component: **fulfilment rate**, **avg response time**, **per-category progress bars**.
- "My needs" list with SLA badges and a **Mark fulfilled** action (PATCH → status fulfilled).
- Welcome `PageHeader` with live **open/assigned/fulfilled** stat chips.

### 9.7 Request Help + WhatsApp (`RequestHelp.jsx`, `lib/whatsapp.js`)
- Public form (name, phone, need, category, urgency, details, **photo**, location) → `apiHelp()` →
  `POST /api/help` → creates an `open` need with `source:'whatsapp'`. Nearby matching volunteers get alerted.
- **WhatsApp is click-to-chat `wa.me` deep links** (no API keys). `waLink(phone,text)` builds the URL;
  `volunteerMessage()`/`helpRequestMessage()` build **localized** prefilled text (en/hi/kn).
  Set your number in `src/config.js` → `SUPPORT_WHATSAPP`. To productionize, replace `whatsapp.js` with
  the WhatsApp Business Cloud API.

### 9.8 Chatbot (`ChatBot.jsx`, `lib/botKnowledge.js`)
- Floating assistant. **Offline rule-based** (no LLM/API key): `matchIntent(text, lang)` scores INTENTS by
  keyword hits (keywords include English + Hindi + Kannada + romanized words) and returns the reply in the
  selected language. Quick-reply chips + WhatsApp + Request-help buttons.
- Covers: how to get help, volunteer, how matching works, categories, **government schemes**, **emergency
  helplines** (Indian numbers), greetings/thanks. To upgrade to an LLM, swap `botKnowledge.js` — the widget
  is unchanged.
- **Language selector** in the chat header (EN/हिं/ಕ) updates the shared `LanguageContext`, which also drives
  WhatsApp message language everywhere.

### 9.9 SLA countdowns (`lib/sla.js`, `SlaBadge.jsx`)
- Response-time targets: **high=2h, medium=6h, low=24h** from `createdAt`. `SlaBadge` uses `useNow(1000)` to
  tick every second and shows "⏳ Xh Ym left" or turns red "⏰ overdue".

### 9.10 Theming & visuals (`ThemeContext.jsx`, `index.css`)
- Dark/light toggle in the nav; persisted; defaults to OS preference. All colors are CSS variables under
  `:root`/`[data-theme='dark']`/`[data-theme='light']`.
- **Animated aurora background:** `body::before` = drifting radial-gradient glows (26s loop), `body::after`
  = faint dot grid. Respects `prefers-reduced-motion`.
- Brand gradient: indigo → violet → cyan (`--brand-grad`). Fonts: Sora (headings), Inter (body).

---

## 10. Routes (App.jsx)

| Path | Page | Guard |
|---|---|---|
| `/` | Landing | public |
| `/auth` | Auth (signup/login) | public |
| `/map` | MapView | public |
| `/impact` | Impact | public |
| `/request-help` | RequestHelp | public |
| `/ngo` | NgoDashboard | role `ngo` |
| `/volunteer` | VolunteerDashboard | role `volunteer` |
| `/matches` | SmartMatch | role `volunteer` |
| `/my-tasks` | MyTasks | role `volunteer` |
| `*` | → redirect `/` | — |

Global overlays (always mounted): `VolunteerAlerts` (headless), `ToastStack`, `ChatBot`.

---

## 11. End-to-end user flow

1. NGO signs up → posts a need (title, category, urgency, skills, location, optional photo).
2. The need instantly appears on the **live map** for everyone (SSE broadcast).
3. A community member without an account can instead use **Request Help** (creates a need, `source:whatsapp`).
4. Volunteer signs up → sets skills, availability, location.
5. Volunteer clicks **Find matches** → algorithm scores every open need → shows top 5 with a match %.
6. Volunteer clicks **I'll help** → status → `assigned`; NGO gets a live "accepted" alert.
7. Volunteer/NGO can **WhatsApp** each other and get **Directions** to the location.
8. NGO (or volunteer via My Tasks) marks the task **Fulfilled** → feeds the **Impact dashboard** & leaderboard.

---

## 12. Conventions & gotchas (read before editing)

- **Only `src/data/store.js` talks to the network.** Keep pages storage-agnostic.
- **`useCollection(name)`** is the standard way a component reads a live collection.
- **Mutations are fire-and-forget** in the UI; the SSE broadcast re-renders lists. Don't hand-manage list state.
- **JSON columns:** always go through `server/db.js` helpers so `skills`/`location` serialize/hydrate correctly.
- **Adding a `needs` column:** add it to the `CREATE TABLE` in `db.js` AND to `migrate()` (ALTER for existing DBs).
- **Charts:** use the `useWidth()` pattern in `Impact.jsx`, not Recharts `ResponsiveContainer` (StrictMode bug).
- **Node 16:** don't upgrade deps to versions requiring Node 18/20 (Vite 5, concurrently 8+, etc.).
- **Security notes (demo-only):** passwords are plaintext; auth is not tokenized; helpline/scheme text is
  general guidance for India (the bot tells users to verify officially). Harden all of this before production.
- **DB reset:** delete `server/reliefLink.db*` and restart the server to reseed clean demo data.
- The SQLite `.db` files and `node_modules`/`dist` are **gitignored** — never commit them.

---

## 13. Extending the app (common tasks → where to go)

| I want to… | Do this |
|---|---|
| Add a new API endpoint | `server/index.js` (+ a helper in `server/db.js` if it touches the DB) |
| Add a field to needs | `server/db.js` (CREATE + `migrate()`), then use it in the relevant page |
| Add a new page | create `src/pages/X.jsx`, add a `<Route>` in `App.jsx`, link it in `Nav.jsx` |
| Add a new skill/category | `src/data/seed.js` (`SKILLS`, `CATEGORIES`, `CATEGORY_SKILLS`, `CATEGORY_ICONS`) |
| Change the matching weights | `src/lib/matching.js` |
| Add a chatbot answer / language | `src/lib/botKnowledge.js` (INTENTS + UI + QUICK_REPLIES); languages in `LanguageContext.jsx` |
| Change SLA targets | `src/lib/sla.js` (`SLA_HOURS`) |
| Restyle / new theme color | `src/index.css` (CSS variables at the top) |
| Swap to real WhatsApp API | replace `src/lib/whatsapp.js` |
| Swap SQLite → PostgreSQL | rewrite `server/db.js` only (routes/SSE/frontend unchanged) |
| Swap backend → Firebase | rewrite `src/data/store.js` only |

---

## 14. Known limitations / future work
- Auth is demo-grade (plaintext passwords, no JWT/session tokens, no rate limiting).
- Photos are stored inline as base64 in SQLite (fine for a demo; use object storage at scale).
- No automated tests yet; no CI.
- Bundle is a single ~750KB chunk (no code-splitting).
- Real WhatsApp/SMS delivery, push notifications, and true auth are the main production gaps.

---

*Generated as the canonical codebase guide. If you are a new session: start at Section 3 (architecture),
then Section 8 (file map), then the relevant Section 9 feature. `src/data/store.js`, `server/index.js`,
`server/db.js`, and `src/lib/matching.js` are the four files that explain most of the system.*
