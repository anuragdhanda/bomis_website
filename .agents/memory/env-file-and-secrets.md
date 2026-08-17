---
name: Environment files and Replit secrets
description: Replit blocks agents from writing real .env files; use example templates and managed secrets instead.
---

Real `.env` files must not be written into the workspace by the agent because they can expose credentials. Keep non-secret local configuration documented in `.env.example` templates, and store `GROQ_API_KEY`, session secrets, database credentials, and similar values in Replit Secrets. Node's `--env-file-if-exists` can support a developer-created private `.env` without replacing Replit-injected values.

**Why:** Replit prevents filesystem writes to actual `.env` files as a safety boundary, and frontend Vite environment values are browser-visible.

**How to apply:** Use `.env.example` for setup guidance, load optional backend `.env` files only for local development, and never put server secrets in a frontend `.env`.