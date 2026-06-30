# OmniValue AI

AI-powered Android application built as a production-ready TypeScript monorepo.

## Architecture

```
omnivalue-ai/
├── apps/
│   ├── api/          — Express + TypeScript REST API (port 3000)
│   └── mobile/       — React Native + Expo mobile app (port 8081)
├── packages/
│   ├── types/        — Shared TypeScript type definitions
│   ├── config/       — Shared env parsing (Zod schemas)
│   └── utils/        — Shared utility functions
├── .github/workflows/ — GitHub Actions CI/CD
└── ...               — Root config (tsconfig, eslint, prettier, husky)
```

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Mobile      | React Native, Expo, Expo Router     |
| API         | Node.js, Express, TypeScript        |
| Database    | PostgreSQL, Prisma ORM              |
| Monorepo    | pnpm workspaces                     |
| Testing     | Vitest                              |
| Linting     | ESLint + Prettier                   |
| Git hooks   | Husky + lint-staged + commitlint    |
| CI/CD       | GitHub Actions                      |

## Development

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16 (or use DATABASE_URL pointing to Replit's built-in DB)

### Setup

```bash
# Install all dependencies
pnpm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env

# Generate Prisma client
pnpm --filter @omnivalue/api db:generate

# Run database migrations
pnpm --filter @omnivalue/api db:migrate

# Build shared packages
pnpm --filter './packages/*' build
```

### Running

```bash
# Start API (port 3000)
pnpm dev:api

# Start mobile (port 8081)
pnpm dev:mobile

# Start both in parallel
pnpm dev
```

### Testing

```bash
pnpm test             # Run all tests
pnpm test:coverage    # Run with coverage
pnpm typecheck        # TypeScript checks across all packages
pnpm lint             # ESLint across all packages
pnpm format:check     # Prettier check
```

## Commit Convention

Uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(api): add user authentication
fix(mobile): resolve keyboard layout issue
chore: bump dependencies
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

## User Preferences

- TypeScript strict mode everywhere
- pnpm workspaces for monorepo management
- Conventional Commits enforced via commitlint
- Vitest for all testing
- Zod for runtime validation / env parsing
