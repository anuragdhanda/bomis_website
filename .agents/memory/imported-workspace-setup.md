---
name: Imported workspace setup
description: First-run requirements for imported pnpm/Drizzle workspaces
---

Imported workspace archives may contain the complete lockfile and source but no installed dependencies or initialized development database. Restore packages from the lockfile, then apply the existing Drizzle schema before diagnosing workflow or browser errors.

**Why:** Missing packages make every service fail with misleading command-not-found errors, while an uninitialized database makes public API calls return 500 even when the frontend itself renders.

**How to apply:** For a fresh imported workspace, run the package install using the existing lockfile, then run the package's existing database schema push command before restarting managed workflows.