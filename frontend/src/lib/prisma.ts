import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client to prevent connection issues in serverless
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

let metadataColumnEnsured = false;

export const ensureResponseMetadataColumn = async () => {
  if (metadataColumnEnsured) {
    return;
  }

  try {
    const [{ exists }] =
      await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
        `
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'FormResponse'
          AND column_name = 'metadata'
        ) as exists
        `
      );

    if (exists) {
      metadataColumnEnsured = true;
      return;
    }

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "FormResponse"
      ADD COLUMN IF NOT EXISTS "metadata" JSONB
    `);
    metadataColumnEnsured = true;
  } catch (error) {
    console.error('Failed to ensure metadata column exists:', error);
  }
};

// Graceful shutdown for serverless
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

export default prisma;
