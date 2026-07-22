# Birla Open Minds International School

A full-stack dynamic school website for Birla Open Minds International School, Bhopal. Parents research here, students feel proud here, and administrators manage everything through a protected admin panel.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/birla-school run dev` — run the frontend (port varies)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — used as JWT secret

## Admin Login

Default credentials: `admin` / `birla@admin2024`
Change these in production by updating the admins table directly.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18 + Vite, Tailwind CSS, Framer Motion, TanStack Query, Wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: JWT (jsonwebtoken + bcryptjs)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth for all endpoints)
- `lib/db/src/schema/` — DB table definitions (newsEvents, gallery, faculty, inquiries, admins)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/birla-school/src/pages/` — All React pages
- `artifacts/birla-school/src/components/` — Shared components (Navbar, Footer, layout)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero slider, highlights, news, testimonials, gallery preview |
| `/about` | About Us — history, vision, principal/chairman messages |
| `/academics` | Academics — curriculum tabs, teaching methodology |
| `/admissions` | Admissions — process steps, eligibility, inquiry form |
| `/faculty` | Faculty — dynamic grid from DB |
| `/gallery` | Gallery — category-filtered image grid with lightbox |
| `/news-events` | News & Events — tabbed listing with detail pages |
| `/facilities` | Facilities — 6 facility cards |
| `/contact` | Contact — address, map embed, contact form |
| `/admin` | Admin dashboard (JWT-protected) |
| `/admin/login` | Admin login |

## Architecture decisions

- PostgreSQL instead of MongoDB (already provisioned; functionally equivalent for this use case)
- JWT stored in localStorage (`birla_admin_token`) for admin auth
- OpenAPI-first development: spec → codegen → typed hooks
- Zustand replaced with a simple event-based store to avoid an extra dependency

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any schema change in `lib/db/src/schema/`, run `pnpm run typecheck:libs` before `pnpm --filter @workspace/api-server run typecheck`
- Deep imports into `@workspace/api-client-react/src/generated/*` are not allowed — import only from the barrel `@workspace/api-client-react`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
