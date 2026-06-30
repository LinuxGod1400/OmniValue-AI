/**
 * Prisma seed script.
 * Run after `prisma generate` + `prisma migrate dev`:
 *   pnpm --filter @omnivalue/api db:seed
 */

async function main(): Promise<void> {
  console.info('[seed] Starting…');
  // Lazy import so this file compiles before `prisma generate` creates the client
  const prismaModule = await import('@prisma/client');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PrismaClient = (prismaModule as any).PrismaClient ?? (prismaModule as any).default?.PrismaClient;
  if (!PrismaClient) {
    throw new Error('PrismaClient not found — run `pnpm db:generate` first.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const prisma = new PrismaClient() as {
    user: { upsert: (args: unknown) => Promise<unknown> };
    $disconnect: () => Promise<void>;
  };
  try {
    await prisma.user.upsert({
      where: { email: 'dev@omnivalue.ai' },
      update: {},
      create: { email: 'dev@omnivalue.ai', displayName: 'Dev User' },
    });
    console.info('[seed] Done.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  console.error('[seed] Error:', err);
  process.exit(1);
});
