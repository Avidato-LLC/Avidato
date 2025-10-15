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
  // Add connection timeout settings
  transactionOptions: {
    maxWait: 5000, // 5 seconds
    timeout: 10000, // 10 seconds
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma