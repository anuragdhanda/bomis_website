---
name: Security hardening patterns
description: Patterns and mistakes caught during the BOMIS school app security audit — applicable to any Express/JWT project in this workspace.
---

## Key issues found and fixed

**JWT secret fallback is a critical flaw.** A `?? "hardcoded-fallback"` on the JWT secret means the app silently runs with a known signing key if the env var is missing. Fix: throw loudly on startup instead.

**Hardcoded seed credentials are hardcoded forever.** `ensureDefaultAdmin` seeding `admin`/`birla@admin2024` is equivalent to shipping the password in the repo. Fix: generate a random password with `crypto.randomBytes(12).toString("base64url")` and log it once as WARN. Each deployment gets a unique credential.

**OTP via `Math.random()` is predictable.** Use `crypto.randomInt(100000, 1000000)` — it is cryptographically secure. Never log the OTP value (even in dev mode), as logs may be persisted or forwarded.

**`/stats` leaking inquiry counts without auth.** Any endpoint that exposes business data (counts, summaries) needs `requireAdmin`. "It's just counts" is still data exposure.

**Partial `[[ports]]` in `.replit` breaks port detection.** If any `[[ports]]` entries exist, ALL artifact service ports must be listed — a partial list causes the unmapped services to fail `DIDNT_OPEN_A_PORT` on every restart.

**Why:** These are all low-effort, high-impact hardening steps. Express apps without rate limiting, body size limits, and security headers are trivially abusable.

**How to apply:** For any new Express service: add `helmet()`, `cors()` with explicit origin list, global rate limiter, auth-endpoint rate limiter, and `express.json({ limit: "50kb" })`. Verify JWT/session secrets throw on missing values. Check every route that touches sensitive data for `requireAdmin`.
