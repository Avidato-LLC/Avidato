import { PrismaClient } from '@prisma/client'

/**
 * Prisma Client Instance
 * 
 * This file creates and exports a singleton Prisma client instance
 * for database operations throughout the application.
 * 
 * Features:
 * - Singleton pattern to prevent multiple connections
 * - Global instance in development for hot reloading
 * - Proper connection management
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma