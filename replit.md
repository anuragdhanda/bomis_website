# Birla Open Minds International School (BOMIS)

A full-stack school website and admin dashboard for **Birla Open Minds International School**. The public site covers academics, admissions, faculty, facilities, and a gallery. The admin dashboard lets staff manage faculty, news/events, gallery items, and inquiries.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Radix UI, Framer Motion, Wouter, TanStack Query
- **Backend**: Express v5, Node.js (ESM)
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: JWT-based admin authentication (bcryptjs password hashing)
- **Storage**: Replit Object Storage
- **Email**: Nodemailer + Gmail (optional — disabled when credentials are absent)

## Project Structure

```
artifacts/
  birla-school/   # React + Vite frontend (served at /)
  api-server/     # Express API backend (served at /api)
lib/
  db/             # Drizzle schema + PostgreSQL connection
  api-spec/       # OpenAPI spec + Orval codegen config
  api-client-react/ # Generated React Query hooks
  api-zod/        # Zod validation schemas
  object-storage-web/ # Object storage helpers
```

## How to Run

Both services start automatically via their managed workflows:

| Workflow | Command |
|---|---|
| `artifacts/birla-school: web` | `pnpm --filter @workspace/birla-school run dev` (port 5173) |
| `artifacts/api-server: API Server` | `pnpm --filter @workspace/api-server run dev` (port 8080) |

After a fresh GitHub import, each artifact checks the lockfile and restores
workspace dependencies before starting. The post-merge setup also initializes
the existing Drizzle database schema, so the preview does not depend on a
manual `pnpm install` step.

The public legal pages are available at `/privacy-policy` and
`/terms-of-service`, and are linked from the footer.

## Environment Variables / Secrets

| Key | Notes |
|---|---|
| `SESSION_SECRET` | Secret (set) — used to sign JWTs |
| `GROQ_API_KEY` | Secret (set) — Groq API key for the AI chatbot (LLaMA 3.3 70B) |
| `DATABASE_URL` | Runtime-managed by Replit — do not set manually |
| `NODE_ENV` | Set to `development` |
| `ADMIN_EMAIL` | Optional — admin email for OTP login; set or use "Create Account" on login page |
| `GMAIL_USER` | Optional — Gmail address for email/OTP notifications |
| `GMAIL_APP_PASSWORD` | Optional secret — Gmail App Password for notifications |
| `PUBLIC_OBJECT_SEARCH_PATHS` | Optional — paths for public object storage |
| `PRIVATE_OBJECT_DIR` | Optional — directory for private object storage |

## Database

Schema is managed with Drizzle ORM. To push schema changes to the database:

```bash
pnpm --filter @workspace/db run push
```

## Default Admin

On first start the server seeds a default admin account with username `admin`. To enable OTP login, set `ADMIN_EMAIL` to the admin's email address. Alternatively, use "Create Account" on the login page.

## User Preferences

- Keep the existing monorepo structure and stack
