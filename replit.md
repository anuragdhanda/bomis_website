# Birla Open Minds International School (BOMIS) Website

A full-stack school website built with React + Vite (frontend) and Express + Drizzle ORM (backend), backed by PostgreSQL.

## Project Structure

```
artifacts/
  birla-school/   – React/Vite frontend (preview path: /)
  api-server/     – Express REST API (preview path: /api)
  mockup-sandbox/ – Design/canvas tooling (preview path: /__mockup)
lib/
  db/             – Drizzle ORM schema + migrations (PostgreSQL)
  api-client-react/ – Generated React Query hooks
  api-spec/       – OpenAPI spec + Orval codegen config
  api-zod/        – Shared Zod validation schemas
```

## Running the App

Dependencies are managed with pnpm (monorepo). After cloning or syncing:

```bash
pnpm install
```

Workflows are configured automatically:
- **Frontend**: `pnpm --filter @workspace/birla-school run dev`
- **API Server**: `pnpm --filter @workspace/api-server run dev`

## Database

Uses Replit's built-in PostgreSQL. The schema is managed with Drizzle Kit.

To push schema changes to the database:
```bash
pnpm --filter @workspace/db run push
```

Tables: `admins`, `faculty`, `gallery`, `inquiries`, `news_events`

## Environment Secrets

| Secret | Purpose |
|--------|---------|
| `SESSION_SECRET` | JWT signing secret for admin auth |
| `DATABASE_URL` | Injected automatically by Replit's managed PostgreSQL |

## User Preferences

(none recorded yet)
