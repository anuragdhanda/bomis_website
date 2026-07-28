# Birla Open Minds International School (BOMIS) Website

A full-stack dynamic website for Birla Open Minds International School, Rajound.

## Stack

- **Frontend**: React + Vite + Tailwind CSS (artifact: `artifacts/birla-school`, preview path: `/`)
- **Backend**: Node.js + Express REST API (artifact: `artifacts/api-server`, preview path: `/api`)
- **Database**: PostgreSQL via Drizzle ORM (lib: `lib/db`)
- **Monorepo**: pnpm workspaces

## How to Run

Dependencies are installed with `pnpm install` from the workspace root.

The database schema is pushed with:
```
pnpm --filter @workspace/db run push
```

Two workflows run the app:
- **`artifacts/birla-school: web`** — Vite dev server for the React frontend
- **`artifacts/api-server: API Server`** — Express API (builds then starts)

## Project Structure

```
artifacts/
  birla-school/     # React frontend (pages, components, hooks)
  api-server/       # Express backend (routes, middlewares)
lib/
  db/               # Drizzle ORM schema + client (PostgreSQL)
  api-zod/          # Shared Zod validation schemas
  api-spec/         # OpenAPI spec + Orval codegen config
  api-client-react/ # Generated React Query hooks from API spec
attached_assets/    # School logo and images
```

## Pages

Home, About Us, Academics, Admissions, Faculty, Gallery, Facilities, Contact Us, News & Events, Admin Panel (JWT-protected)

## Environment Variables

- `DATABASE_URL` — managed by Replit (auto-provisioned PostgreSQL)
- `SESSION_SECRET` — secret for JWT signing
- `GMAIL_USER` / `GMAIL_APP_PASSWORD` — optional, enables email notifications for contact/admission forms

## Admin Panel

Default admin credentials are seeded on first startup. The admin panel (`/admin`) supports CRUD for News, Events, Gallery, Faculty, and Admissions inquiries.

## User Preferences

- Keep the existing orange (#F15A29) and white theme
- Use the uploaded logo assets from `attached_assets/`
