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

    // Get student count for this user
    const studentCount = await prisma.student.count({
      where: {
        tutorId: userId,
        archived: false // Only count active students
      }
    })

    // Get lesson count for this user (across all their students)
    const lessonCount = await prisma.lesson.count({
      where: {
        student: {
          tutorId: userId,
          archived: false
        }
      }
    })

    // Get recent students (last 5 created)
    const recentStudents = await prisma.student.findMany({
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
      take: 5
    })

    return {
      success: true,
      data: {
        studentCount,
        lessonCount,
        recentStudents
      }
    }

  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error)
    
    return {
      success: false,
      error: 'Failed to load dashboard statistics. Please try again.'
    }
  }
}