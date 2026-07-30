# Birla Open Minds International School (BOMIS Rajound)

A full-stack school website for BOMIS Rajound — Birla Open Minds International School.

## Stack

- **Frontend** (`artifacts/birla-school`): React + Vite + Tailwind CSS + shadcn/ui
- **Backend** (`artifacts/api-server`): Express 5 + Drizzle ORM + PostgreSQL
- **Shared libs** (`lib/`): `api-spec`, `api-zod`, `api-client-react`, `db`
- **Package manager**: pnpm (monorepo)

## Running the project

Both services start automatically via managed workflows.

| Service | Workflow name | Port |
|---------|--------------|------|
| Frontend (React/Vite) | `artifacts/birla-school: web` | 5173 |
| API server (Express) | `artifacts/api-server: API Server` | 8080 |

To start from scratch after a fresh import:

```bash
pnpm install --frozen-lockfile   # install all workspace dependencies
cd lib/db && pnpm run push        # push Drizzle schema to the database
```

## Environment variables / secrets

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection (auto-provided by Replit) |
| `SESSION_SECRET` | ✅ Yes | JWT/session signing for the API |
| `GMAIL_USER` | Optional | Gmail address for inquiry email notifications |
| `GMAIL_APP_PASSWORD` | Optional | Gmail app password for email notifications |

Email notifications are gracefully disabled if `GMAIL_USER`/`GMAIL_APP_PASSWORD` are not set.

## User preferences

<!-- Add remembered preferences here -->
