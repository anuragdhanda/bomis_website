# 📋 BOMIS Website — Audit Report

**Website:** Bright Open Minds International School (BOMIS), Rajound, Haryana
**Audit Date:** August 2026
**Prepared By:** Replit AI Agent
**Report Type:** Full-Stack Website Audit

---

## 📌 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Frontend Pages](#4-frontend-pages)
5. [API Endpoints](#5-api-endpoints)
6. [Database Schema](#6-database-schema)
7. [Features List](#7-features-list)
8. [Security Audit](#8-security-audit)
9. [Performance Audit](#9-performance-audit)
10. [Issues & Recommendations](#10-issues--recommendations)
11. [Environment Variables](#11-environment-variables)
12. [How to Run](#12-how-to-run)

---

## 1. Project Overview

BOMIS is a full-stack school website and admin dashboard built for **Bright Open Minds International School**, located in Rajound, Haryana, India. The site serves three audiences:

| Audience | Purpose |
|---|---|
| **Parents / Visitors** | Learn about the school, academics, admissions, faculty, gallery |
| **Students** | Access the student portal (demo) |
| **Admin Staff** | Manage faculty, gallery, news/events, and inquiries via dashboard |

---

## 2. Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.1.0 | UI framework |
| TypeScript | ~5.9.3 | Type safety |
| Vite | latest (catalog) | Build tool & dev server |
| Tailwind CSS v4 | catalog | Styling |
| Wouter | ^3.3.5 | Client-side routing |
| TanStack React Query | catalog | Server state / API caching |
| Framer Motion | catalog | Animations |
| Radix UI | multiple | Accessible UI primitives |
| React Hook Form | ^7.55.0 | Form management |
| Recharts | ^2.15.2 | Charts (student portal) |
| Lucide React | catalog | Icons |
| Uppy | ^5.x | File upload with progress |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js (ESM) | v20.20.0 | Runtime |
| Express | ^5.2.1 | HTTP framework |
| TypeScript | ~5.9.3 | Type safety |
| Groq SDK | ^1.5.0 | AI chatbot (LLaMA 3.3 70B) |
| jsonwebtoken | ^9.0.3 | JWT auth tokens |
| bcryptjs | ^3.0.3 | Password hashing |
| Helmet | ^8.3.0 | Security headers |
| express-rate-limit | ^8.6.1 | Rate limiting |
| Nodemailer | ^9.0.3 | Email / OTP |
| Pino | ^9.14.0 | Structured logging |
| Google Cloud Storage | ^7.21.0 | Object / file storage |
| esbuild | 0.27.3 | Production bundler |

### Database
| Technology | Version | Purpose |
|---|---|---|
| PostgreSQL | Replit managed | Primary database |
| Drizzle ORM | catalog | Query builder & schema |
| Drizzle Kit | ^0.31.10 | DB migrations / push |
| Zod | catalog | Schema validation |

---

## 3. Project Structure

```
workspace/
├── artifacts/
│   ├── bright-school/          # React + Vite frontend (served at /)
│   │   └── src/
│   │       ├── pages/         # All page components
│   │       ├── components/    # Shared UI components
│   │       ├── context/       # React context providers
│   │       └── lib/           # Utilities, auth helpers
│   │
│   ├── api-server/            # Express API backend (served at /api)
│   │   └── src/
│   │       ├── routes/        # Route handlers
│   │       ├── lib/           # Auth, mailer, storage helpers
│   │       └── index.ts       # Server entry point
│   │
│   └── mockup-sandbox/        # UI mockup/design preview server
│
├── lib/
│   ├── db/                    # Drizzle schema + PostgreSQL connection
│   ├── api-spec/              # OpenAPI spec + Orval codegen config
│   ├── api-client-react/      # Generated React Query hooks
│   ├── api-zod/               # Zod validation schemas
│   └── object-storage-web/    # Object storage browser helpers
│
├── README.md                  # This file
└── replit.md                  # Developer notes & preferences
```

---

## 4. Frontend Pages

### Public Pages

| Route | Page | Description |
|---|---|---|
| `/` | **Home** | Hero carousel, school values, campus features, stats counters, testimonials, gallery preview, admission CTA |
| `/about` | **About Us** | School history/milestones, vision & mission, leadership profiles, infrastructure highlights |
| `/academics` | **Academics** | Curriculum overview, teaching approach (experiential, personalized, technology-integrated) |
| `/admissions` | **Admissions** | Step-by-step admission process, fee tables, age eligibility, inquiry form, FAQ section |
| `/faculty` | **Faculty** | Faculty directory with class/subject filters, faculty cards |
| `/gallery` | **Gallery** | Infrastructure images + API-backed gallery, category filtering, image lightbox |
| `/facilities` | **Facilities** | Facility cards with images and descriptions (labs, sports, library, etc.) |
| `/contact` | **Contact Us** | Contact details, message/inquiry form, embedded Google Maps |
| `/student-portal` | **Student Portal** | Demo dashboard — grades, attendance charts, timetable, notices *(no live backend)* |

### Admin Pages (Password Protected)

| Route | Page | Description |
|---|---|---|
| `/admin/login` | **Admin Login** | Username/password login OR email OTP login |
| `/admin` | **Dashboard** | Stats cards, navigation to management sections |
| `/admin/gallery` | **Gallery Manager** | Upload, edit, delete gallery images |
| `/admin/faculty` | **Faculty Manager** | Add, edit, delete faculty profiles |
| `/admin/inquiries` | **Inquiries Manager** | View, update status, delete contact/admission inquiries |

---

## 5. API Endpoints

Base URL: `/api`

### Health
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/healthz` | None | Server health check |

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | None | Username + password login → 24h JWT |
| POST | `/auth/send-otp` | None | Send OTP to admin email |
| POST | `/auth/verify-otp` | None | Verify OTP → JWT |
| GET | `/auth/me` | Admin JWT | Get current admin info |
| POST | `/auth/register` | None (rate-limited) | Register new admin account |

### Gallery
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/gallery` | None | List gallery items (filterable by category) |
| POST | `/gallery` | Admin JWT | Create gallery item |
| PATCH | `/gallery/:id` | Admin JWT | Update gallery item |
| DELETE | `/gallery/:id` | Admin JWT | Delete gallery item |

### Faculty
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/faculty` | None | List all faculty |
| POST | `/faculty` | Admin JWT | Add faculty member |
| PATCH | `/faculty/:id` | Admin JWT | Update faculty member |
| DELETE | `/faculty/:id` | Admin JWT | Delete faculty member |

### News & Events
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/news-events` | None | List news/events (filter by type, limit) |
| GET | `/news-events/:id` | None | Get single news/event |
| POST | `/news-events` | Admin JWT | Create news/event |
| PATCH | `/news-events/:id` | Admin JWT | Update news/event |
| DELETE | `/news-events/:id` | Admin JWT | Delete news/event |

### Inquiries
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/inquiries` | None | Submit contact or admission inquiry |
| GET | `/inquiries` | Admin JWT | List inquiries (filterable by type) |
| PATCH | `/inquiries/:id` | Admin JWT | Update inquiry status |
| DELETE | `/inquiries/:id` | Admin JWT | Delete inquiry |

### Statistics
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/stats` | Admin JWT | Dashboard counts (faculty, gallery, inquiries, news) |

### Storage
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/storage/uploads/request-url` | Admin JWT | Get signed upload URL |
| GET | `/storage/public-objects/*` | None | Serve public storage objects |
| GET | `/storage/objects/*` | None | Serve stored images/files |

### Chatbot
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/chat` | None | AI chatbot (Groq LLaMA 3.3 70B), keeps last 10 messages |

---

## 6. Database Schema

### `admins` table
| Column | Type | Notes |
|---|---|---|
| id | serial | Primary key |
| username | text | NOT NULL, unique |
| password_hash | text | bcrypt cost 12 |
| email | text | Nullable |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |

### `otp_tokens` table
| Column | Type | Notes |
|---|---|---|
| id | serial | Primary key |
| email | text | NOT NULL |
| token_hash | text | Hashed OTP |
| expires_at | timestamptz | OTP expiry |
| used | boolean | Single-use flag |
| attempts | integer | Brute-force tracking |
| locked_until | timestamptz | Lock after failed attempts |
| created_at | timestamptz | Auto |

### `faculty` table
| Column | Type | Notes |
|---|---|---|
| id | serial | Primary key |
| name | text | NOT NULL |
| designation | text | NOT NULL |
| subject | text | Nullable |
| image_url | text | Nullable |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |

### `gallery` table
| Column | Type | Notes |
|---|---|---|
| id | serial | Primary key |
| title | text | NOT NULL |
| image_url | text | NOT NULL |
| category | text | NOT NULL, default: `events` |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |

### `inquiries` table
| Column | Type | Notes |
|---|---|---|
| id | serial | Primary key |
| name | text | NOT NULL |
| email | text | NOT NULL |
| phone | text | Nullable |
| message | text | NOT NULL |
| type | text | `contact` or `admission` |
| status | text | `new`, `read`, `resolved` |
| student_name | text | Nullable (admissions) |
| grade_applying | text | Nullable (admissions) |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |

### `news_events` table
| Column | Type | Notes |
|---|---|---|
| id | serial | Primary key |
| title | text | NOT NULL |
| content | text | NOT NULL |
| type | text | `news` or `event` |
| excerpt | text | Nullable |
| image_url | text | Nullable |
| event_date | date | Nullable |
| published_at | timestamptz | Nullable |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |

---

## 7. Features List

### ✅ Public Website
- Responsive multi-page school website
- Hero section with school imagery
- Animated stats counters
- Faculty directory with filters
- Image gallery with category filtering and lightbox
- Facilities showcase
- Academics curriculum overview
- Admissions process with fee structure
- Contact form with Google Maps embed
- Admission inquiry drawer (available on all pages)

### ✅ AI Chatbot
- Floating chat widget on all pages
- Powered by Groq LLaMA 3.3 70B model
- **Voice input** — speak in Hindi or English (Web Speech API)
- **Text-to-Speech** — bot responses read aloud
- Bilingual (Hindi + English)
- BOMIS-specific system prompt
- Last 10 messages kept for context

### ✅ Admin Dashboard
- JWT-based authentication (password or email OTP)
- Gallery management (upload, edit, delete)
- Faculty management (add, edit, delete)
- Inquiry management (view, status update, delete)
- Dashboard stats overview
- Signed URL image uploads to object storage

### ✅ Student Portal (Demo)
- Demo dashboard with grades display
- Attendance charts (Recharts)
- Class timetable view
- School notices board
- *(Backend/authentication not yet implemented)*

---

## 8. Security Audit

### ✅ Strengths

| Area | Implementation |
|---|---|
| **Security Headers** | Helmet.js — sets X-Content-Type, CSP, HSTS, etc. |
| **CORS** | Allowlist-based; production = same-origin only |
| **Rate Limiting** | Global 300 req/15 min; stricter limits on auth and OTP routes |
| **Password Hashing** | bcrypt with cost factor 12 |
| **JWT** | 24h expiry; signed with JWT_SECRET / SESSION_SECRET |
| **OTP Security** | Hashed storage, single-use, expiry, attempt tracking, email lock, anti-enumeration |
| **Input Validation** | Zod validation on all request bodies and queries |
| **SQL Injection** | Drizzle ORM parameterized queries (no raw SQL) |
| **Body Size Limit** | 50KB JSON/URL-encoded limit |
| **Logging** | Pino structured logs; cookies/set-cookie redacted |
| **Trust Proxy** | Enabled for correct IP detection behind proxy |

### ⚠️ Issues Found

| Severity | Issue |
|---|---|
| 🔴 High | `/auth/register` is publicly accessible — anyone can create an admin account |
| 🟡 Medium | `/chat` endpoint has no dedicated rate limiter — only global 300 req/15 min applies |
| 🟡 Medium | Public inquiry form has no CAPTCHA or spam protection |
| 🟡 Medium | JWT stored client-side (localStorage) — XSS risk if not handled carefully |
| 🟢 Low | OTP tokens not auto-cleaned up — expired rows accumulate in DB |
| 🟢 Low | `updatedAt` uses application-level `$onUpdate`, not DB trigger — direct SQL bypasses it |

---

## 9. Performance Audit

### ✅ Strengths

| Area | Implementation |
|---|---|
| **API Caching** | TanStack React Query — server state cached in browser |
| **Production Build** | Vite + esbuild — fast, tree-shaken bundle |
| **Direct Uploads** | Uppy uploads direct to signed storage URL (bypasses server) |
| **Chat Context Cap** | Last 10 messages only — keeps token costs low |
| **API Limits** | News list uses `limit` query param |

### ⚠️ Issues Found

| Severity | Issue |
|---|---|
| 🟡 Medium | No React lazy loading / code splitting on routes — entire app JS loaded upfront |
| 🟡 Medium | No compression middleware (gzip/brotli) on API server |
| 🟡 Medium | Many images are standard `<img>` without `loading="lazy"`, `srcSet`, or WebP |
| 🟢 Low | No API pagination on gallery/faculty endpoints — large datasets load all at once |
| 🟢 Low | No DB indexes on common filter columns (status, type, category, dates) |
| 🟢 Low | Static image arrays eagerly imported — increases initial JS bundle size |

---

## 10. Issues & Recommendations

### 🔴 Critical

1. **Restrict admin registration** — `/auth/register` should require an existing admin JWT or a one-time secret key. Currently anyone on the internet can create an admin account.

### 🟡 Medium Priority

2. **Add chat rate limiter** — Add a per-IP rate limiter specifically on `/api/chat` to prevent AI cost abuse.
3. **Implement student portal backend** — The student portal currently shows hardcoded demo data. Real student auth and data is not implemented.
4. **Add news/events admin UI** — The API has full CRUD for news/events but there is no admin page to manage them from the dashboard.
5. **Add compression** — Install `compression` middleware on the Express server to reduce response sizes.
6. **Add CAPTCHA** on public inquiry form to prevent spam submissions.

### 🟢 Low Priority

7. **Lazy load routes** — Use `React.lazy()` + `Suspense` to split the bundle by route.
8. **Optimize images** — Add `loading="lazy"` and use WebP format with `srcSet`.
9. **Add DB indexes** — Add indexes on `inquiries.status`, `gallery.category`, `news_events.type`.
10. **OTP cleanup job** — Add a periodic task to delete expired/used OTP tokens from the database.
11. **DB enums** — Replace free-text `type`/`status`/`category` columns with PostgreSQL enums or check constraints for data integrity.

---

## 11. Environment Variables

| Variable | Type | Required | Description |
|---|---|---|---|
| `DATABASE_URL` | Runtime | ✅ Yes | PostgreSQL connection — auto-managed by Replit |
| `SESSION_SECRET` | Secret | ✅ Yes | JWT signing secret |
| `GROQ_API_KEY` | Secret | ✅ Yes | Groq API key for AI chatbot |
| `NODE_ENV` | Env Var | ✅ Yes | Set to `development` or `production` |
| `GMAIL_USER` | Env Var | ⚠️ Optional | Gmail address for OTP/notification emails |
| `GMAIL_APP_PASSWORD` | Secret | ⚠️ Optional | Gmail App Password |
| `ADMIN_EMAIL` | Env Var | ⚠️ Optional | Default admin email for OTP login |
| `ALLOWED_ORIGIN` | Env Var | ⚠️ Optional | CORS override for custom domain |
| `PUBLIC_OBJECT_SEARCH_PATHS` | Env Var | ⚠️ Optional | Public object storage paths |
| `PRIVATE_OBJECT_DIR` | Env Var | ⚠️ Optional | Private object storage directory |

---

## 12. How to Run

### Install Dependencies
```bash
pnpm install
```

### Push Database Schema
```bash
pnpm --filter @workspace/db run push
```

### Start Development Servers

| Service | Command | Port |
|---|---|---|
| Frontend | `pnpm --filter @workspace/bright-school run dev` | 5173 |
| API Server | `pnpm --filter @workspace/api-server run dev` | 8080 |

Both services start automatically via Replit managed workflows.

### Default Admin Account
On first start, the server seeds a default admin account:
- **Username:** `admin`
- **Password:** Set via `ADMIN_PASSWORD` env var (or check server logs on first run)
- To enable OTP login, set the `ADMIN_EMAIL` environment variable.

### Build for Production
```bash
pnpm run build
```

---

*Report generated automatically via code audit — August 2026*
