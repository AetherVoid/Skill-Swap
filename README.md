# SkillSwap Malawi

Peer-to-peer **skills exchange** for Malawi: trade **time and expertise** instead of money, with a mobile-first **PWA**, **English/Chichewa** UI, **Node** API, **PostgreSQL**, and hooks for **SMS/USSD**—aligned with the [**Executive Summary**](docs/EXECUTIVE_SUMMARY.md) (canonical product spec).

**Product context (summary):** youthful, low-cash economy; **~28%** internet use; rural majority—so **PWA + SMS/USSD** are essential. Pilot cities called out in the doc include **Lilongwe or Mzuzu** with an anchor NGO/university.

## Prerequisites

- Node.js 20+
- Docker (for PostgreSQL + Redis), or any PostgreSQL instance

## Database

```bash
docker compose up -d postgres redis
cd backend
copy .env.example .env
npm install
npx prisma db push
npm run db:seed
```

**Development — open app without login:** In `.env`, set `DISABLE_AUTH=true` (included in `.env.example`). The API impersonates the seeded demo user (`demo@skillswap.local`) for app routes and the admin user for `/admin/*`. In `frontend/` and `admin/`, `VITE_DISABLE_AUTH=true` is set in `.env.development` so UIs skip login. **Never enable `DISABLE_AUTH` in production.**

### Dummy accounts (after `npm run db:seed`)

| Role | Email | Password | Notes |
|------|--------|----------|--------|
| **Super admin** | `admin@skillswap.local` | `admin123` | Admin panel & `/admin/*` API. Override with `ADMIN_SEED_PASSWORD` when seeding. |
| **Regular user** | `demo@skillswap.local` | `user123` | Web app: `POST /auth/login` with `{ "email", "password" }`. Verified; teaches *English conversation*, wants *Smartphone repair*; starts with **5** time-credit hours. Override with `DEMO_USER_SEED_PASSWORD` when seeding. |

**Note:** After changing auth to email, run `npx prisma db push` (or migrate) so `User.email` is required, then re-seed.

## API

```bash
cd backend
npm run dev
```

Health: `http://localhost:4000/health`

- **Auth:** `POST /auth/register` (email, password, name, district), `POST /auth/login` (email, password).
- **Users:** `GET/PATCH /users/me`, `PUT /users/me/skills`
- **Taxonomy:** `GET /taxonomy`
- **Matches:** `GET /matches`
- **Exchanges:** `POST /exchanges`, `GET /exchanges`, `GET/POST /exchanges/:id/messages`, `PATCH /exchanges/:id`
- **Admin API (JWT, role `super_admin` or `moderator`):** `GET /admin/overview`, `GET /admin/users`, `GET /admin/users/:id`, `GET /admin/exchanges`

## Admin panel (React Admin)

Use the **super admin** row in the dummy table above for the admin UI (same credentials).

```bash
cd admin
npm install
npm run dev
```

Open `http://localhost:5174/`. With `VITE_DISABLE_AUTH=true` (default in dev), the panel opens without a login screen as long as the API runs with `DISABLE_AUTH=true` and seed data exists. Otherwise log in with the super-admin email and password from the table above. The UI proxies API calls to `http://localhost:4000` via `/api`.

## Web app (PWA)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. API calls use the Vite proxy to `http://localhost:4000` via `/api`.

Optional: set `VITE_API_URL` to point at a hosted API.

## KPIs, budget, and roadmap

See **[docs/EXECUTIVE_SUMMARY.md](docs/EXECUTIVE_SUMMARY.md)** for KPI examples (e.g. user growth, completed swaps/month, ratings), **year-one cost band (~$14.5k–$18.5k USD)**, phased rollout **2026–2027**, and **next steps** (field research, anchor partners, pilot).

## What’s next (technical + product)

- Firebase (or equivalent) phone auth + JWT hardening
- SMS/USSD gateway + Redis for USSD session state
- Real-time chat (e.g. Socket.io), push notifications
- Full **escrow** + **dispute** flows matching the executive summary
- PostGIS proximity; swap cycles & group sessions as in the spec
