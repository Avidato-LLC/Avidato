import { PrismaClient } from '@prisma/client'

/**
 * Optimized Prisma Client Instance
 * 
 * Performance optimizations:
 * - Connection pooling configuration
 * - Query logging in development
 * - Faster connection timeout settings
 * - Optimized for Supabase
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Optimized connection settings for Supabase
  transactionOptions: {
    maxWait: 3000, // 3 seconds - shorter wait time
    timeout: 8000, // 8 seconds - shorter timeout
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma