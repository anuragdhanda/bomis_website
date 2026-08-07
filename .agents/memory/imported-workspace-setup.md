---
name: Imported workspace setup
description: First-run requirements for imported pnpm/Drizzle workspaces
---

Imported workspace archives may contain the complete lockfile and source but no installed dependencies or initialized development database. Restore packages from the lockfile, then apply the existing Drizzle schema before diagnosing workflow or browser errors. Artifact-managed services should check their package-local binaries before starting, and the workspace should not also define duplicate legacy workflows for the same ports.

**Why:** Missing packages make every service fail with misleading command-not-found errors, duplicate workflows cause port conflicts, and an uninitialized database makes public API calls return 500 even when the frontend itself renders.

**How to apply:** For a fresh imported workspace, let one startup guard restore the existing lockfile under a process lock, then run the package's existing database schema push command. Keep only the artifact-managed workflows and verify the actual package-local links such as `artifacts/<name>/node_modules/.bin/*` before skipping installation.