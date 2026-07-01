---
name: Package install method
description: pnpm workspaces don't function properly in this Replit environment; use npm or installLanguagePackages.
---

# Package Installation in This Replit Environment

**Rule:** Never use `pnpm install` or `pnpm add`. Use `npm install <pkg>` at workspace root or the `installLanguagePackages` code_execution sandbox function.

**Why:** pnpm workspace linking silently fails; packages end up missing or incorrectly resolved. All packages land in root `node_modules` and are accessible from all workspace packages.

**How to apply:** For new packages: `npm install <pkg>` from `/home/runner/workspace`. For bulk installs: use `installLanguagePackages({ language: "nodejs", packages: [...] })` in code_execution.
