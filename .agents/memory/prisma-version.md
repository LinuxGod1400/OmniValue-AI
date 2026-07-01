---
name: Prisma version pinning
description: Prisma v7 is installed by default and breaks schema URL and PrismaClient export; must pin to v5.
---

# Prisma Must Stay on v5

**Rule:** Always pin `prisma` and `@prisma/client` to `^5` (currently `5.22.0`).

**Why:** Prisma v7 (the default latest) removed `url = env(...)` from `schema.prisma` datasource and moved it to a `prisma.config.ts` file. It also changed the `PrismaClient` import path. This broke all existing code that follows the standard v5 pattern.

**How to apply:** When installing or upgrading, always use `npm install prisma@5 @prisma/client@5 --save-exact`. After any schema change, run `npx prisma db push` from `apps/api/`.
