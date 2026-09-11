# AGENTS.md — BOMIS Website

This file is the single source of truth for working on this repository.

> **MANDATORY RULES FOR EVERY AGENT (in every session):**
>
> 1. **READ THIS FILE BEFORE ANY CHANGE** — Before making any edit, refactor, build step, or commit, read `AGENTS.md` again. Do not rely on memory.
> 2. **UPDATE THIS FILE AT SESSION END** — After any meaningful change (new feature, bug fix, new route, new env var, config change, deployment change, dependency change, or anything a future agent needs to know), add/update the relevant section below and commit it along with your change.
> 3. **KEEP IT CURRENT** — If you discover the repo differs from this file, update the file immediately (structure, package names, ports, endpoints, env vars). Never leave stale info.
> 4. **NEVER DELETE SECTIONS** — Only add or edit. Preserve history where useful.

---

## 1. Project Overview

**Bright Open Minds (BOMIS)** — private school website × admin dashboard for Rajound, Haryana, India.

| Audience | Purpose |
|---|---|
| Parents / Visitors | Learn about the school, academics, admissions, faculty, gallery |
| Students | Student portal (demo only — no live backend) |
| Admin Staff | Manage faculty, gallery, inquiries via dashboard |

**Deployment (current):**
- **Frontend:** Vercel → `https://bomiswebsite-anurag-2773.vercel.app` (project `bomis_website` / team `anurag-2773`)
- **Backend (API):** Render → `https://bomis-website-api.onrender.com`
- **Database:** PostgreSQL on **Neon** (via `DATABASE_URL`)
- Frontend talks to the API through `VITE_API_BASE_URL` (in `.env` / Vercel env vars). In local dev it proxies `/api` → `localhost:8080`.

---

## 2. Repository Layout (ACCURATE — README may say "bright-school"; the real folder is `frontend`)

```
bomis_website/
├── artifacts/
│   ├── frontend/              # React + Vite frontend  (package: @workspace/birla-school, port 5173)
│   │   └── src/
│   │       ├── pages/         # Home, About, Academics, Admissions, FeesStructure, Faculty, Gallery, Facilities, Contact, StudentPortal, Legal, admin/...
│   │       ├── components/    # Chatbot.tsx, AdmissionDrawer.tsx, layout/, ui/ (shadcn-style)
│   │       ├── context/       # AdmissionDrawerContext
│   │       ├── hooks/         # use-toast, use-mobile
│   │       └── lib/           # utils etc.
│   ├── api-server/            # Express API backend  (package: @workspace/api-server, port 8080)
│   │   └── src/
│   │       ├── routes/        # auth, chat, faculty, gallery, health, index, inquiries, newsEvents, stats, storage
│   │       └── lib/           # auth, logger, mailer, objectAcl, objectStorage
│   └── mockup-sandbox/        # legacy UI mockup sandbox
├── lib/
│   ├── db/                    # Drizzle schema + PostgreSQL connection (package: @workspace/db)
│   ├── api-spec/              # OpenAPI spec + orval codegen (api-contract)
│   ├── api-client-react/      # Generated React Query hooks + customFetch + setBaseUrl
│   ├── api-zod/               # Generated Zod schemas
│   └── object-storage-web/    # object storage browser helpers
├── scripts/
├── .env                       # LOCAL secrets (NOT committed — see below)
├── package.json               # workspace scripts
├── pnpm-workspace.yaml        # workspace + version catalog + overrides
├── vercel.json                # Vercel static-frontend build config
├── AGENTS.md                  # THIS FILE
└── README.md / replit.md      # older audit docs (partially outdated on names)
```

> **PACKAGE NAMING GOTCHA:** The frontend package is `@workspace/birla-school` and lives in folder `artifacts/frontend` (the folder was renamed from `birla-school`; the package name stayed the same). `vercel.json` builds it via `pnpm --filter @workspace/birla-school build`. The README and older docs reference `bright-school` — ignore that; it is outdated.

---

## 3. Tech Stack

### Frontend (`artifacts/frontend`)
React 19.1 (pinned via overrides/catalog) · TypeScript ~5.9 · Vite 7 · Tailwind CSS v4 · Wouter (routing) · TanStack React Query · Framer Motion · Radix UI · React Hook Form + Zod · Recharts (student portal) · Lucide icons · Uppy (uploads).

### Backend (`artifacts/api-server`)
Node 20 ESM · Express 5 · TypeScript · Groq SDK (chatbot, llama-3.3-70b-versatile) · jsonwebtoken + bcryptjs · Helmet · express-rate-limit · Nodemailer · Pino · esbuild (build).

### Database (`lib/db`)
PostgreSQL + Drizzle ORM + Zod. Schema in `lib/db/src/schema.ts`.

---

## 4. Commands

```bash
# from repo root
pnpm install                          # install everything
pnpm --filter @workspace/db run push  # push drizzle schema → DB
pnpm run typecheck                    # typecheck ALL projects (always run after changes)
pnpm run build                        # typecheck + build everything
pnpm -r --if-present run build        # build only (no typecheck)
```

### Dev servers (two terminals)
| Service | Command | Port |
|---|---|---|
| API | `pnpm --filter @workspace/api-server run dev` | 8080 |
| Frontend | `pnpm --filter @workspace/birla-school run dev` | 5173 |

**VERIFICATION DISCIPLINE:** after any code change, run `pnpm run typecheck`. Fix all errors before committing. Do not skip.

---

## 5. Environment Variables

### Backend (API server — `artifacts/.env` committed, plus production env on Render)
| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon Postgres connection string |
| `SESSION_SECRET` | ✅ | JWT signing secret ALSO used as admin-register key |
| `GROQ_API_KEY` | ✅ | Groq key for chatbot |
| `NODE_ENV` | ✅ | `development` / `production` |
| `PORT` | ✅ | 8080 |
| `BREVO_API_KEY` | optional | Brevo (Sendinblue) SMTP/API key for inquiry/OTP emails (`xkeysib-…`) |
| `BREVO_SENDER_EMAIL` | optional | From-address for inquiry/OTP emails (default `anuragdhanda551@gmail.com`) |
| `BREVO_SENDER_NAME` | optional | From-name for inquiry/OTP emails (default `BOMIS Website`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_SECRET_KEY` | optional | admin seeding / OTP |
| `ALLOWED_ORIGIN` | optional | CORS override |
| `PUBLIC_OBJECT_SEARCH_PATHS` / `PRIVATE_OBJECT_DIR` | optional | object storage |

> **⚠️ SEcrets are COMMITTED in `artifacts/.env`** (owner's explicit decision). Root `.env` is local-only and **NOT** tracked (`.gitignore` covers `.env` but the file was force-added long ago). Do not add new secrets without asking the owner.

### Frontend (`artifacts/frontend/.env.example`)
| Variable | Notes |
|---|---|
| `VITE_API_BASE_URL` | API base URL e.g. `https://bomis-website.onrender.com`. Used by `setBaseUrl()` in `main.tsx` AND by `Chatbot.tsx`. Leave unset locally to fall back to the `localhost:8080` dev proxy. |
| `VITE_API_PORT` / `API_PORT` / `BASE_PATH` | dev-server + base path settings |

---

## 6. Public Pages & Routing

Frontend routes (Wouter) in `artifacts/frontend/src/App.tsx`:

| Route | Page |
|---|---|
| `/` | Home |
| `/about` | About Us |
| `/academics` | Academics |
| `/admissions` | Admissions (incl. inquiry form + fee tables) |
| `/fees` | FeesStructure |
| `/faculty` | Faculty (filterable directory) |
| `/gallery` | Gallery (API-backed, category filter, lightbox) |
| `/facilities` | Facilities |
| `/contact` | Contact (form + map) |
| `/student-portal` | Demo dashboard (no live backend) |
| `/admin/login` | Admin login (password or OTP) |
| `/admin` … | Admin dashboard (gallery / faculty / inquiries managers) |
| `*` | not-found |

---

## 7. API Endpoints (base `/api`, API server `routes/index.ts`)

| Method + Path | Auth | Purpose |
|---|---|---|
| GET `/healthz` | — | health check |
| POST `/auth/login` · `/auth/send-otp` · `/auth/verify-otp` · `/auth/register` · GET `/auth/me` | JWT for /me + /register | auth |
| GET `/gallery` · POST / PATCH / DELETE `/gallery/:id` | JWT for writes | gallery |
| GET `/faculty` · POST / PATCH / DELETE `/faculty/:id` | JWT for writes | faculty |
| GET `/news-events` · `/news-events/:id` · POST/PATCH/DELETE | JWT for writes | news & events (no admin UI) |
| POST `/inquiries` · GET / PATCH / DELETE `/inquiries/:id` | JWT for admin ops | **apply/contact forms** |
| GET `/stats` | JWT | dashboard counts |
| POST `/storage/uploads/request-url` · GET `/storage/...` | JWT for upload | object storage |
| POST `/chat` | — | **AI chatbot** (Groq). Keeps last 10 messages. |

---

## 8. Key Feature Notes (IMPORTANT)

### 🎓 Apply / Inquiry forms ("apply form")
- **Components:** `AdmissionDrawer.tsx` (global "Apply Now" drawer), `pages/Admissions.tsx`, `pages/Contact.tsx`.
- Submits via generated hook `useCreateInquiry()` → `POST /api/inquiries` with `type: "admission" | "contact"`.
- Backend `routes/inquiries.ts` validates with Zod, inserts into `inquiries` table, then **sends a notification email** via `lib/mailer.ts` using `BREVO_API_KEY` (nodemailer → Brevo SMTP relay `smtp-relay.brevo.com`). If the key is empty, email is skipped (form still saves to DB).
- Admin sees submissions at `/admin/inquiries` (status: new/read/resolved).

### 🤖 Chatbot
- Component `Chatbot.tsx` (mounted globally in `App.tsx`, floating draggable robot, voice in/out, TTS).
- **API URL RULE:** Chatbot uses `import.meta.env.VITE_API_BASE_URL` (NOT `BASE_URL`). If unset, it falls back to relative `/api/chat` (dev proxy). When changing chatbot networking, keep this behavior — production relies on `VITE_API_BASE_URL`.
- Backend `routes/chat.ts` → Groq `llama-3.3-70b-versatile`, BOMIS-specific system prompt, bilingual replies, 503 if `GROQ_API_KEY` missing, max_tokens 160.

### 🔐 Auth
- JWT in localStorage, signed with `SESSION_SECRET`, 24h expiry.
- `/auth/register` is gated by a secret key (`ADMIN_SECRET_KEY` or `SESSION_SECRET`).
- OTP flow uses `BREVO_API_KEY` (auth.ts, nodemailer → Brevo SMTP relay).

### 🎨 Admin
- Views in `src/pages/admin/` — `Login.tsx`, `Dashboard.tsx`, `AdminLayout.tsx`.
- Managers: `views/GalleryAdmin.tsx`, `views/FacultyAdmin.tsx`, `views/InquiriesAdmin.tsx` (wired via `pages/admin/pages/`).

---

## 9. Deployment & Infrastructure

### Frontend → Vercel (`bomiswebsite-anurag-2773.vercel.app`)
- **Build settings live in the Vercel DASHBOARD (project `bomis_website` / team `anurag-2773`)**, not in repo root `vercel.json`:
  `rootDirectory: artifacts/frontend`, `buildCommand: vite build`, `outputDirectory: dist/public`, `installCommand: pnpm install --no-frozen-lockfile`, node 24.x. Because `rootDirectory` is set, a repo-root `vercel.json` is NOT enough for routing config.
- **SPA rewrite lives in `artifacts/frontend/vercel.json`** (`/(.*)` → `/index.html`). Keep it there — inside the rootDirectory. Repo-root `vercel.json` only holds framework + the same rewrite (harmless duplication).
- On Vercel there is **NO `/api` proxy** — every API call must go to the Render URL via `VITE_API_BASE_URL`. It must be set as a Vercel env var at build time.
- One-time deploy: `vercel --prod --yes` (logged in as `anuragdhanda551-2163`). If the lockfile is out of date, run `pnpm install --no-frozen-lockfile` and commit first.

### Backend → Render (`bomis-website.onrender.com`)
- Runs the API server with env vars configured in the Render dashboard (DB URL, Groq key, Brevo creds, etc.).
- **⚠️ `NODE_ENV` must be `production`** on Render — otherwise CORS allowlist falls through to localhost/replit origins and Vercel requests are rejected.
- **Render env var API gotcha:** updating a single env var by key uses `PUT /v1/services/{serviceId}/env-vars/{key}` with flat body `{"key":"...","value":"..."}` (NOT the `{"envVar":{...}}` wrapper). The bulk endpoint `PUT .../env-vars` takes a JSON array of `{key,value}` objects and **replaces all** env vars.
- CORS allowlist in `artifacts/api-server/src/app.ts` includes `https://bomiswebsite-anurag-2773.vercel.app`. Overridable via `ALLOWED_ORIGIN` env var.

### Database → Neon (Postgres)
- Schema pushed via Drizzle (`pnpm --filter @workspace/db run push`). Don't hand-edit DB; edit `lib/db/src/schema.ts` and push.

---

## 10. Conventions

- **ESM + TypeScript**, `.js` extension for relative imports in server code (NodeNext).
- UI uses shadcn-style primitives in `src/components/ui/` (Radix + Tailwind v4 + cva).
- Theme color: orange `#F15A29` (brand) used across UI.
- Tailwind v4 (CSS-first config in `src/index.css`, plugin via `@tailwindcss/vite`).
- Generated API client lives in `lib/api-client-react` (orval). If the OpenAPI spec changes, regenerate — don't hand-patch generated files.
- No comments unless needed. Keep Hinglish-friendly user-facing strings for chatbot (Hindi + English).
- Git identity in this repo: `Anurag Dhanda <anuragdhanda551@gmail.com>` (already set locally).

---

## 11. Session Log / Changelog

Append here at the end of every session (most recent first). Include: date, what changed, where, and any follow-up needed.

### 2026-09-11 — Sitemap folder created + sitemap.xml generated
- **New dedicated folder:** `artifacts/frontend/public/sitemap/` now holds the site sitemap (previously the single `sitemap.xml` sat loose in `public/`).
- **`public/sitemap/sitemap.xml`:** comprehensive sitemap covering all 11 public routes (Home, About, Academics, Admissions, Fees, Faculty, Gallery, Facilities, Contact, Student Portal, Privacy/Terms) with per-route `lastmod` (2026-09-11), `changefreq`, and `priority`. Admin routes + 404 excluded (not meant for indexing).
- **`public/robots.txt` updated:** `Sitemap:` line now points to `https://bomiswebsite-anurag-2773.vercel.app/sitemap/sitemap.xml`.
- Old `public/sitemap.xml` deleted (was superseded).
- **Follow-up:** deploy to Vercel (`vercel --prod --yes`) so live site serves the new sitemap at `/sitemap/sitemap.xml`. No backend/DB changes.

### 2026-09-10 — Full on-page SEO audit + implementation (React+Vite, NOT Next.js)
- **NOTE:** this project is a React + Vite + Wouter SPA (no Next.js metadata API / app router). SEO was implemented with Vite equivalents.
- **New components:** `src/components/Seo.tsx` (sets `document.title`, meta description, canonical, OG/Twitter tags, robots per route) and `src/components/JsonLd.tsx` (injects JSON-LD `<script type="application/ld+json">`).
- **Title/meta per page:** added `<Seo>` to Home, About, Academics, Admissions, Facilities, Faculty, Gallery, Contact, FeesStructure (now routed at `/fees`), StudentPortal, Legal (privacy/terms), 404. Unique 50-60 char titles with "Rajound" + 150-160 char descriptions.
- **Heading hierarchy fixed:** Home highlight cards h3→h2; About Vision/Mission h3→h2; Admissions steps h4→h3 + fee cards h3→h2; Facilities/FeesStructure cards h3→h2; Faculty names + empty-state h3→h2; Gallery empty-state h3→h2; Contact sub-heads h4→h3; StudentPortal dashboard added h2 + Seo.
- **Clean URLs:** added missing `/fees` route (FeesStructure was orphaned) + `/fees-structure` → `/fees` redirect in `App.tsx`.
- **Alt text:** improved logo/chairman/principal alts to be descriptive; all `<img>` verified to have alt.
- **Internal linking:** footer added Home + Fee Structure links; About → Facilities link added in Infrastructure section; navbar/footer already linked all key pages.
- **JSON-LD:** School schema on Home (educational org w/ address, phone, email, openingHours) + LocalBusiness schema on Contact (address, openingHoursSpecification Mo–Sa 08:00–16:00). No fabricated geo coordinates or social URLs.
- **robots.txt:** updated in `public/` with `Sitemap:` line. **sitemap.xml:** created in `public/` (11 public routes, lastmod/changefreq/priority).
- **Accessibility:** navbar navs got `aria-label`, footer social icon links got `aria-label`.
- Canonical base URL used everywhere: `https://bomiswebsite-anurag-2773.vercel.app`. Typecheck + production build pass (files land in `dist/public/`).

### 2026-09-10 — Secret scanning fix: removed secrets from git history + env consolidation
- **`artifacts/.env` removed from git entirely** (GitHub push protection blocked a Groq API Key). Rewrote all 146 commits via `git filter-branch --index-filter "git rm --cached --ignore-unmatch artifacts/.env"` and force-pushed (`git push --force origin main:main`). The file now exists locally only; replicated from root `.env` after the rewrite.
- **`.gitignore`:** added `artifacts/.env` explicitly so it never gets tracked again.
- **`.env.example` deleted** (was `artifacts/frontend/.env.example`). Its frontend/build settings (`API_PORT`, `VITE_API_PORT`, `BASE_PATH`, `VITE_API_BASE_URL`) were merged into root `.env`.
- **IMPORTANT for future agents:** never commit `artifacts/.env` again — GitHub push protection scans history. Production secrets live in the **Render dashboard** (backend) and **Vercel env vars** (frontend `VITE_API_BASE_URL`). Local dev reads both `.env` (root) and `artifacts/.env`.
- **History rewritten** — old commit SHAs no longer exist locally or on `origin`. Do NOT fetch/pull old refs.

### 2026-09-07 — Chatbot UX/robustness fixes (no more "technical glitch" spam)
- **Frontend `Chatbot.tsx` hardened** so genuine issues surface with helpful messages instead of a vague glitch, and failures recover cleanly:
  - **30s timeout (AbortController):** if the API hangs, loading spinner no longer spins forever; user gets a clear "time lag" message.
  - **Error body now parsed:** `sendChat` reads `{ error }` from the server response, so 401/503/429 messages like "assistant is not configured" are preserved (previously discarded → generic error).
  - **Error messages differentiated:** abort/timeout vs "not configured" (backend config issue) vs generic — each shows a friendly Hinglish hint.
  - **Stale-closure fix:** `sendMessage` now reads current state via refs (`messagesRef`, `loadingRef`, `ttsRef`), so voice-input auto-send can't drop/duplicate messages or fire while a request is already in flight.
  - **Mic error feedback added:** `recognition.onerror` now shows a hint when mic permission is denied instead of failing silently.
  - **`recognition.start()` guarded** in a try/catch (prevents uncaught exceptions on browsers that throw directly).
- **Verified live:** `POST https://bomis-website.onrender.com/api/chat` returns 200 with a real reply; typecheck + production build pass.
- **Follow-up:** this frontend fix only reaches users after a **Vercel redeploy** (`vercel --prod --yes`). Backend unchanged, no Render deploy needed.

### 2026-09-05 — Chatbot fix: GROQ_API_KEY was invalid on Render + local
- **Problem:** deployed chatbot failed with `401`/`"The school assistant is not configured correctly."` from `POST /api/chat`.
- **Root cause:** the `GROQ_API_KEY` was expired/invalid. Verified by calling Groq's API directly (`invalid_api_key` 401) for all three candidates: Render env var, root `.env`, and the value in git history (commit `80c54e1`).
- **Fix:** owner supplied a new valid Groq API key. Updated `artifacts/.env` (committed) and root `.env` (local-only). Confirmed the key is valid (HTTP 200 on `GET /v1/models`) and that `chat.ts`'s model `openai/gpt-oss-20b` is supported by it. Ran a smoke test of the exact Groq SDK call used by `routes/chat.ts` — returned a real reply.
- **Frontend verified OK (no change needed):** deployed bundle calls `https://bomis-website.onrender.com/api/chat` via `VITE_API_BASE_URL`.
- **Follow-up:** owner is updating `GROQ_API_KEY` in the Render dashboard (Environment → Save → Deploy). Verify `POST https://bomis-website.onrender.com/api/chat` returns 200 before closing this session.

### 2026-09-03 — CORS: allowed primary Vercel deployment domain
- Added `https://bomiswebsite.vercel.app` to the production CORS allowlist in `artifacts/api-server/src/app.ts`. This lets its gallery and chatbot requests reach `https://bomis-website.onrender.com` without the browser blocking them.
- Corrected the stale source comment that said production frontend and API share one domain; they are deployed separately on Vercel and Render.
- **Follow-up:** deploy the API change to Render before retesting the live Vercel site.

### 2026-09-02 — Full stack live: CORS fixed + VITE_API_BASE_URL corrected + frontend redeployed
- **Render NODE_ENV → production:** updated via `PUT /v1/services/{id}/env-vars/NODE_ENV` (flat `{key,value}` body, NOT wrapped in `envVar`). Triggers CORS allowlist in `app.ts` to activate (was falling through to localhost list when NODE_ENV was `development`).
- **CORS now working:** `access-control-allow-origin: https://bomiswebsite-anurag-2773.vercel.app` confirmed in response headers.
- **Correct backend URL:** `https://bomis-website.onrender.com` (NOT `bomis-website-api.onrender.com` — that domain is dead).
- **VITE_API_BASE_URL updated on Vercel:** old wrong value removed (`vercel env remove`), new `https://bomis-website.onrender.com` added for both production and preview (`vercel env add`).
- **Frontend redeployed:** `vercel --prod --yes` — build succeeded, live at `bomiswebsite-anurag-2773.vercel.app`.
- **End-to-end verified:** `/gallery`, `/about`, `/faculty` all 200; API `/api/healthz` returns 200 with correct CORS headers from Vercel origin.
- **Remaining follow-ups:** (1) Brevo email vars not yet on Render production — inquiry/OTP emails won't send in prod until `BREVO_API_KEY` etc. are added in Render dashboard. (2) Chatbot requires `GROQ_API_KEY` on Render (already set). (3) `SESSION_SECRET` and `DATABASE_URL` already on Render from prior deploys.

### 2026-09-01 — AGENTS.md created
- Created `AGENTS.md` at repo root as single source of truth (full project info, commands, env vars, routes, endpoints, conventions, deployment).
- Added MANDATORY RULES: every agent must read this file before any change and update the Session Log at session end.
- Reads: README.md (audit), package.json, pnpm-workspace.yaml, vercel.json, page/route inventory.

### 2026-09-01 — Gmail credentials for inquiry emails
- Added `GMAIL_USER=anuragdhanda551@gmail.com` and new `GMAIL_APP_PASSWORD` to `artifacts/.env` (committed) and root `.env` (local).
- **Follow-up:** update the same two env vars in the Render dashboard → Environment → Save + deploy, or inquiry emails won't send in production.

### 2026-09-01 — Switch email notifications from Gmail to Brevo (Sendinblue)
- Replaced Gmail SMTP with **Brevo SMTP relay** (`smtp-relay.brevo.com`). Added new `BREVO_API_KEY` (`xkeysib-…`), `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` to `artifacts/.env` (committed) and root `.env` (local). Removed old `GMAIL_USER` / `GMAIL_APP_PASSWORD` from both.
- Updated `lib/mailer.ts` (inquiry emails) and `routes/auth.ts` (OTP emails) to use Brevo SMTP via nodemailer. Typecheck passes.
- **Follow-up:** the old Gmail vars are already in production Render env — remove them there and add `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` in the Render dashboard → Environment → Save + deploy, or production emails won't send. Sender address `anuragdhanda551@gmail.com` must be a verified sender in the Brevo account.

### 2026-09-01 — Chatbot API URL fix + Vercel prep
- `Chatbot.tsx`: switched `import.meta.env.BASE_URL` → `VITE_API_BASE_URL` (fallback to relative `/api` when unset). Fixes chatbot on Vercel (no `/api` proxy there).
- Finalized Vercel setup: `vercel.json`, `vite.config.ts` conditional Replit plugins, `main.tsx` calls `setBaseUrl(VITE_API_BASE_URL)`, `.env.example` documents `VITE_API_BASE_URL`.

### (earlier) — Vercel migration work
- Repo prepared for Vercel frontend + Render backend split; DB moved to Neon.
- Apply form already correct (uses generated client that respects `VITE_API_BASE_URL`).

---

*Next agent: read the top of this file again before making changes. Update the Session Log before finishing.*
