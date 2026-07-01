---
name: exactOptionalPropertyTypes Prisma fix
description: TypeScript strictest mode rejects undefined-to-null mismatches in Prisma writes; must coerce explicitly.
---

# Prisma + exactOptionalPropertyTypes

**Rule:** When passing Zod-parsed data (where optional fields are `T | undefined`) to Prisma create/update (which expects `T | null`), always coerce with `?? null`.

**Why:** The tsconfig uses `exactOptionalPropertyTypes: true`, so TypeScript treats `undefined` and `null` as distinct. Prisma's generated types require `null` for nullable fields, not `undefined`.

**How to apply:** Pattern: `{ field: parsed.data.field ?? null }` for nullable Prisma columns. Never spread a Zod partial object directly into a Prisma `data:` block.
