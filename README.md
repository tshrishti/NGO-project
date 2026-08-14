# ReliefLink — Smart Resource & Volunteer Allocation

A centralized platform that shows urgent community needs on a **live map** and a **smart matching
algorithm** that connects volunteers to tasks based on skills and proximity.

Built for a *Code for Good*-style hackathon. Runs **100% locally** — no cloud accounts, no billing.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite | Fast dev, simple |
| Backend | Node.js + Express | Real REST API + Server-Sent Events for live updates |
| Database | SQLite (`better-sqlite3`) | Real relational DB, **zero-config** & file-based — no Postgres install needed locally (swappable for PostgreSQL later) |
| Real-time | Server-Sent Events (`/api/stream`) | Server pushes changed collections; UI updates live across tabs/devices |
| Map | Leaflet + OpenStreetMap | Free, no Google Maps billing |
| Matching | Plain JS (`src/lib/matching.js`) | No ML — a transparent weighted formula |
| Charts | Recharts | Impact dashboard |
| Theming | Dark/Light toggle (`ThemeContext`) | Persisted, respects OS preference |

## Run it (one command)

```bash
npm run setup     # installs frontend + backend deps (first time only)
npm start         # runs BOTH the API (:4000) and the web app (:5173) together
```

Then open **http://localhost:5173**. The Vite dev server proxies `/api` → `http://localhost:4000`,
so there's no CORS setup.

> ⚠️ The app needs **both** processes. `npm start` (alias `npm run dev:all`) runs them together.
> If you prefer separate terminals: `npm run server` (API) and `npm run dev` (web).

Demo accounts (seeded automatically): `ngo@demo.org` and `asha@demo.org`, password `demo`.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Create account (NGO/volunteer) |
| POST | `/api/auth/login` | Log in |
| GET | `/api/users` · `/api/needs` · `/api/matches` | List collections |
| POST | `/api/needs` · `/api/matches` | Create |
| POST | `/api/help` | Public help request (community member → creates a need) |
| PATCH | `/api/needs/:id` · `/api/users/:id` | Update (assign, fulfill, edit profile) |
| GET | `/api/stream` | Server-Sent Events live feed |

## Assistant chatbot & WhatsApp support

- **Assistant chatbot** (💬 bottom-right, every page): an offline rule-based bot that explains how to
  request help, how to volunteer, how matching works, categories, **government relief schemes**, and
  **emergency helplines**. Swap `src/lib/botKnowledge.js` for an LLM later — the widget is unchanged.
- **Request Help** page (`/request-help`): a community member submits a need (name, phone, category,
  urgency, location). It creates a live need and alerts nearby volunteers.
- **WhatsApp handoff** (no API keys): uses **click-to-chat `wa.me` deep links**. The requester can
  message support with a prefilled text; volunteers get a **“💬 WhatsApp”** button on each task to
  reach the requester directly. Set your number in `src/config.js` (`SUPPORT_WHATSAPP`). To go
  production, replace `src/lib/whatsapp.js` with the WhatsApp Business Cloud API.
- **Volunteer alerts**: when a new **open** need appears that matches a signed-in volunteer's skills
  and is within `ALERT_RADIUS_KM` (default 15 km), they get a **toast + alarm sound 🔔 + a nav bell**
  with unread count — driven by the same SSE stream.

## More features

- **Two-way alerts**: NGOs are notified when a volunteer accepts their need; volunteers are notified
  when their task is marked complete. Notifications **persist across refresh** (localStorage) with a
  clearable bell dropdown.
- **Live map filters**: search box + category + urgency chips + "show fulfilled" toggle.
- **Volunteer “My Tasks”** (`/my-tasks`): active vs. completed, mark-complete, WhatsApp, directions.
- **Leaderboard** on Impact: top volunteers by points (fulfilled = 10, in-progress = 5).
- **Export / print report**: on Impact — **Export CSV** (needs table) and **Print / PDF** (print-styled).
- **Photo attachments**: attach a photo when posting a need or requesting help (auto-compressed to
  ~800px JPEG, stored inline). Thumbnails show in lists and map popups.
- **Directions**: every task has a **🗺️ Directions** link that opens Google/Apple Maps navigation.
- **NGO analytics** (NGO dashboard): fulfilment rate, avg. response time, and per-category progress bars.
- **SLA / urgency countdown**: open needs show a live countdown to their response target
  (high = 2h, medium = 6h, low = 24h) and turn red when overdue — see `src/lib/sla.js`.

## The 7 screens

1. **Landing** — problem + choose NGO or Volunteer
2. **Signup/Login** — role-based auth
3. **NGO Dashboard** — post needs (title, category, urgency, skills, map location)
4. **Volunteer Dashboard** — profile: skills, availability, location
5. **Live Map** — color-coded pins (🔴 high, 🟡 medium, 🟢 low), click for details / "I'll help"
6. **Smart Match** — top 3–5 best-fit needs with a match score %
7. **Impact Dashboard** — fulfilled needs, active volunteers, avg response time, charts

## Matching algorithm

```
matchScore = skillOverlap × 0.6 + proximityScore × 0.3 + urgencyWeight × 0.1
```

- `skillOverlap` = (volunteer's matching skills ÷ skills required) × 100
- `proximityScore` = based on `1 / distanceKm` (Haversine on lat/lng), normalized 0–100
- `urgencyWeight` = high 1 · medium 0.5 · low 0.2 (×100)

## Data model (SQLite tables, JSON columns for `skills`/`location`)

- `users`: id, role, name, email, password, skills[], availability, location {lat,lng}
- `needs`: id, ngoId, ngoName, title, category, urgency, skills[], location {lat,lng}, status, assignedTo, assignedAt, fulfilledAt
- `matches`: id, needId, volunteerId, status

## End-to-end flow

NGO posts a need → server broadcasts it → appears live on every open map → volunteer sets
skills/location → clicks **Find matches** → picks one and clicks **I'll help** (PATCH sets status
`assigned`, NGO sees it live via SSE) → NGO marks **Fulfilled** → feeds the Impact dashboard.

## Swapping SQLite → PostgreSQL later

Only `server/db.js` touches the database. Replace `better-sqlite3` with `pg` and adjust the
queries; the Express routes, SSE, and the whole frontend stay unchanged.
