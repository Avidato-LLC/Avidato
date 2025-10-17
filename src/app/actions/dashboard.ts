'use server'

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { prisma } from '../../lib/prisma'
import type { Session } from 'next-auth'

/**
 * Dashboard Statistics Interface
 */
interface DashboardStats {
  studentCount: number
  lessonCount: number
  recentStudents: Array<{
    id: string
    name: string
    targetLanguage: string
    level: string
    createdAt: Date
  }>
}

/**
 * Server Action Response Interface
 */
interface DashboardResponse {
  success: boolean
  data?: DashboardStats
  error?: string
}

/**
 * Fetches dashboard statistics for the authenticated user
 * 
 * @returns DashboardResponse with user statistics or error
 */
export async function getDashboardStats(): Promise<DashboardResponse> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as Session | null
    if (!session?.user || typeof session.user.id !== 'string') {
      return {
        success: false,
        error: 'You must be logged in to view dashboard statistics'
      }
    }

    const userId = session.user.id

    try {
      // Use a single transaction for all queries to improve performance
      const result = await Promise.race([
        prisma.$transaction(async (tx) => {
          // Run all queries in parallel within the transaction
          const [studentCount, lessonCount, recentStudents] = await Promise.all([
            tx.student.count({
              where: {
                tutorId: userId,
                archived: false
              }
            }),
            tx.lesson.count({
              where: {
                student: {
                  tutorId: userId,
                  archived: false
                }
              }
            }),
            // Only return the 2 most recently created students for dashboard
            tx.student.findMany({
              where: {
                tutorId: userId,
                archived: false
              },
              select: {
                id: true,
                name: true,
                targetLanguage: true,
                level: true,
                createdAt: true
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: 2 // Limit to 2 most recent students
            })
          ])

          return {
            studentCount,
            lessonCount,
            recentStudents
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout')), 3000)
        )
      ])

      return {
        success: true,
        data: result as {
          studentCount: number
          lessonCount: number
          recentStudents: Array<{
            id: string
            name: string
            targetLanguage: string
            level: string
            createdAt: Date
          }>
        }
      }

    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error)
      
      // Return fallback data instead of complete failure
      return {
        success: true,
        data: {
          studentCount: 0,
          lessonCount: 0,
          recentStudents: []
        }
      }
    }

  } catch (error) {
    console.error('❌ Auth error:', error)
    
    return {
      success: false,
      error: 'Authentication failed. Please try logging in again.'
    }
  }
}